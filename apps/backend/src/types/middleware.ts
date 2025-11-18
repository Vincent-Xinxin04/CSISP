// 后端中间件相关类型定义
import { AppContext } from './context';
import { UserRoleType } from '@csisp/types';

/**
 * Next函数类型
 */
export type Next = () => Promise<void>;

/**
 * 自定义中间件类型
 */
export type Middleware = (ctx: AppContext, next: Next) => Promise<void>;

/**
 * 中间件工厂函数类型
 */
export type MiddlewareFactory = (...args: any[]) => Middleware;

/**
 * 认证中间件配置选项
 */
export interface AuthMiddlewareOptions {
  /**
   * 是否需要认证
   */
  required?: boolean;

  /**
   * 允许的角色列表
   */
  roles?: UserRoleType[];

  /**
   * 允许的权限列表
   */
  permissions?: string[];

  /**
   * 排除的路径
   */
  excludePaths?: string[];
}

/**
 * 日志中间件配置选项
 */
export interface LoggerMiddlewareOptions {
  /**
   * 是否记录请求体
   */
  logBody?: boolean;

  /**
   * 是否记录响应体
   */
  logResponse?: boolean;

  /**
   * 排除的路径
   */
  excludePaths?: string[];

  /**
   * 要屏蔽的敏感字段
   */
  sensitiveFields?: string[];
}

/**
 * 错误处理中间件配置选项
 */
export interface ErrorMiddlewareOptions {
  /**
   * 是否在开发环境下显示详细错误信息
   */
  showDetailsInDev?: boolean;

  /**
   * 是否记录错误日志
   */
  logErrors?: boolean;

  /**
   * 自定义错误响应映射
   */
  errorMappings?: Record<string, { code: number; message: string }>;
}

/**
 * 速率限制中间件配置选项
 */
export interface RateLimitMiddlewareOptions {
  /**
   * 时间窗口（毫秒）
   */
  windowMs?: number;

  /**
   * 每个窗口允许的最大请求数
   */
  max?: number;

  /**
   * 基于IP还是基于用户ID
   */
  keyGenerator?: (ctx: AppContext) => string;

  /**
   * 自定义响应消息
   */
  message?: string;

  /**
   * 排除的路径
   */
  excludePaths?: string[];
}

/**
 * 文件上传中间件配置选项
 */
export interface UploadMiddlewareOptions {
  /**
   * 最大文件大小（字节）
   */
  maxFileSize?: number;

  /**
   * 允许的文件类型
   */
  allowedTypes?: string[];

  /**
   * 上传目录
   */
  uploadDir?: string;

  /**
   * 是否保留原始文件名
   */
  preserveFilename?: boolean;

  /**
   * 最大文件数量
   */
  maxFiles?: number;
}

/**
 * 跨域中间件配置选项
 */
export interface CorsMiddlewareOptions {
  /**
   * 允许的源
   */
  origin?: string | string[] | ((ctx: AppContext) => string);

  /**
   * 是否允许凭证
   */
  credentials?: boolean;

  /**
   * 允许的HTTP方法
   */
  allowMethods?: string | string[];

  /**
   * 允许的HTTP头
   */
  allowHeaders?: string | string[];

  /**
   * 暴露的HTTP头
   */
  exposeHeaders?: string | string[];

  /**
   * 预检请求的有效期（秒）
   */
  maxAge?: number;
}
