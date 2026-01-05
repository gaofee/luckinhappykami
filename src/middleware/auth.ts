import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { dbGet, dbRun } from '../utils/database';

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

// JWT认证中间件
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌',
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // 验证用户是否存在
    const user = await dbGet(
      'SELECT id, username FROM admins WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在',
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
    };

    next();
  } catch (error) {
    console.error('认证失败:', error);
    return res.status(401).json({
      code: 401,
      message: '认证失败',
    });
  }
};

// 管理员登录
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
      });
    }

    const user = await dbGet(
      'SELECT id, username, password_hash FROM admins WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    const bcrypt = await import('bcrypt');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    // 生成JWT令牌
    const token = (jwt.sign as any)(
      { id: user.id, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // 更新最后登录时间
    await dbRun('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 修改管理员密码
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        code: 400,
        message: '旧密码和新密码不能为空',
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        code: 400,
        message: '新密码长度不能少于6位',
      });
    }

    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '用户未认证',
      });
    }

    // 获取当前用户信息
    const user = await dbGet(
      'SELECT password_hash FROM admins WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    // 验证旧密码
    const bcrypt = await import('bcrypt');
    const isValidOldPassword = await bcrypt.compare(old_password, user.password_hash);

    if (!isValidOldPassword) {
      return res.status(400).json({
        code: 400,
        message: '旧密码错误',
      });
    }

    // 生成新密码哈希
    const newPasswordHash = await bcrypt.hash(new_password, config.security.bcryptRounds);

    // 更新密码
    await dbRun('UPDATE admins SET password_hash = ? WHERE id = ?', [
      newPasswordHash,
      req.user.id
    ]);

    res.json({
      code: 0,
      message: '密码修改成功',
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};
