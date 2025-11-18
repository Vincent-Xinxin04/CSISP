// 后端上下文相关类型定义
import { Context as KoaContext, Request } from 'koa';
import { User, UserRoleType } from '@csisp/types';

/**
 * 自定义Koa请求接口
 */
export interface CustomRequest extends Request {
  user?: User;
  userId?: number;
  roles?: UserRoleType[];
  body: any;
}

/**
 * 自定义Koa上下文接口
 * 扩展标准Koa上下文，添加用户认证相关信息
 */
export interface AppContext extends KoaContext {
  request: CustomRequest;
  userId?: number;
  user?: User;
  roles?: UserRoleType[];
  state: any & {
    user?: User;
    userId?: number;
    roles?: UserRoleType[];
  };
  body: any;
  status: number;
  method: string;
  url: string;
  path: string;
  headers: Record<string, any>;
  get: (name: string) => string;
  set: (name: string, value: string) => void;
  ip: string;
  is: (types: string | string[]) => boolean;
  query: Record<string, any>;
  params: Record<string, any>;
}

/**
 * 应用配置接口
 */
export interface AppConfig {
  port: number;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  cors: CorsConfig;
  logger: LoggerConfig;
}

/**
 * 数据库配置接口
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dialect: 'postgres';
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

/**
 * Redis配置接口
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

/**
 * JWT配置接口
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

/**
 * CORS配置接口
 */
export interface CorsConfig {
  origin: string[];
  credentials: boolean;
  allowMethods: string[];
  allowHeaders: string[];
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'combined';
  file?: string;
}
