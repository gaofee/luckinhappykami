// 基础响应接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 卡密相关类型
export interface Card {
  id: number;
  card_key: string;
  encrypted_key: string;
  status: CardStatus;
  card_type: CardType;
  duration?: number;
  total_count?: number;
  remaining_count?: number;
  allow_reverify: boolean;
  device_id?: string;
  verify_method?: VerifyMethod;
  use_time?: Date;
  expire_time?: Date;
  create_time: Date;
  remark?: string;
}

export enum CardStatus {
  UNUSED = 0,
  USED = 1,
  DISABLED = 2
}

export enum CardType {
  TIME = 'time',
  COUNT = 'count'
}

export enum VerifyMethod {
  WEB = 'web',
  POST = 'post',
  GET = 'get'
}

// 管理员相关类型
export interface Admin {
  id: number;
  username: string;
  password_hash: string;
  create_time: Date;
  last_login?: Date;
}

// API密钥相关类型
export interface ApiKey {
  id: number;
  key_name: string;
  api_key: string;
  status: ApiKeyStatus;
  use_count: number;
  last_use_time?: Date;
  create_time: Date;
  description?: string;
}

export enum ApiKeyStatus {
  DISABLED = 0,
  ENABLED = 1
}

// 系统设置相关类型
export interface Setting {
  id: number;
  name: string;
  value: string;
  create_time: Date;
  update_time: Date;
}

// 轮播图相关类型
export interface Slide {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  sort_order: number;
  status: SlideStatus;
  create_time: Date;
}

export enum SlideStatus {
  DISABLED = 0,
  ENABLED = 1
}

// 系统特点相关类型
export interface Feature {
  id: number;
  title: string;
  icon: string;
  description: string;
  sort_order: number;
  status: FeatureStatus;
  create_time: Date;
}

export enum FeatureStatus {
  DISABLED = 0,
  ENABLED = 1
}

// 请求相关类型
export interface VerifyRequest {
  card_key: string;
  device_id: string;
}

export interface GenerateCardsRequest {
  count: number;
  card_type: CardType;
  duration?: number;
  total_count?: number;
  allow_reverify: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CardFilters extends PaginationParams {
  status?: CardStatus;
  card_type?: CardType;
  search?: string;
}

// 统计相关类型
export interface StatsData {
  total: number;
  used: number;
  unused: number;
  usage_rate: number;
}

export interface DailyStats {
  date: string;
  count: number;
}

// JWT Payload类型
export interface JWTPayload {
  admin_id: number;
  username: string;
  iat?: number;
  exp?: number;
}

// 数据库连接类型
export interface Database {
  get<T>(sql: string, params?: any[]): Promise<T>;
  all<T>(sql: string, params?: any[]): Promise<T[]>;
  run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;
  close(): Promise<void>;
}

// 中间件类型
export interface AuthenticatedRequest {
  admin?: Admin;
  adminId?: number;
  body?: any;
  query?: any;
  params?: any;
  headers?: any;
}

// 错误类型
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '身份验证失败') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super(`${resource}不存在`, 404);
  }
}
