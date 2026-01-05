import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = '服务器内部错误';
  let code = 500;

  // 处理自定义错误类型
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.statusCode;

    // 根据错误类型设置不同的响应码
    if (error instanceof ValidationError) {
      code = 1; // 参数错误
    } else if (error instanceof AuthenticationError) {
      code = 401; // 认证失败
    } else if (error instanceof AuthorizationError) {
      code = 403; // 权限不足
    } else if (error instanceof NotFoundError) {
      code = 404; // 资源不存在
    }
  }

  // 处理数据库错误
  if (error.message.includes('SQLITE_CONSTRAINT')) {
    statusCode = 400;
    code = 1;
    message = '数据约束错误，可能存在重复数据';
  }

  // 处理JSON解析错误
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    statusCode = 400;
    code = 1;
    message = '请求数据格式错误';
  }

  // 记录错误日志
  console.error(`[${new Date().toISOString()}] 错误:`, {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // 返回错误响应
  if (req.headers.accept?.includes('application/json') || req.path.startsWith('/api/')) {
    // API错误响应
    res.status(statusCode).json({
      code,
      message,
      data: null,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        url: req.url,
      }),
    });
  } else {
    // 页面错误响应
    res.status(statusCode).render('error', {
      title: '发生错误',
      error: {
        code: statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      },
    });
  }
};

// 404处理中间件
export const notFoundHandler = (req: Request, res: Response) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      code: 404,
      message: 'API接口不存在',
      data: null,
    });
  } else {
    res.status(404).render('404', {
      title: '页面未找到',
    });
  }
};
