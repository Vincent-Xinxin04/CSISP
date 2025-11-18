/**
 * 错误处理中间件
 * 统一错误处理和响应格式化
 */

import { Middleware, ErrorMiddlewareOptions, Next } from '../types/middleware';
import { AppContext } from '../types/context';

/**
 * 错误处理中间件
 * 捕获所有未处理的错误并格式化响应
 */
export const errorHandler = (options: ErrorMiddlewareOptions = {}): Middleware => {
  const { showDetailsInDev = true, logErrors = true, errorMappings = {} } = options;

  return async (ctx: AppContext, next: Next) => {
    try {
      await next();
    } catch (error: any) {
      // 记录错误日志
      if (logErrors) {
        const payload = {
          method: ctx.method,
          url: ctx.url,
          error: error.message,
          stack: error.stack,
          userId: ctx.userId,
        };
        process.stderr.write(`error:${JSON.stringify(payload)}\n`);
      }

      // 设置默认错误状态码
      if (!ctx.status || ctx.status < 400) {
        ctx.status = 500;
      }

      // 构建错误响应
      let errorResponse: any = {
        code: ctx.status,
        message: '服务器内部错误',
      };

      // 处理不同类型的错误
      if (error.name === 'ValidationError') {
        errorResponse = {
          code: 400,
          message: '参数验证失败',
          errors: error.errors || error.message,
        };
        ctx.status = 400;
      } else if (error.name === 'UnauthorizedError') {
        errorResponse = {
          code: 401,
          message: '未授权访问',
        };
        ctx.status = 401;
      } else if (error.name === 'ForbiddenError') {
        errorResponse = {
          code: 403,
          message: '权限不足',
        };
        ctx.status = 403;
      } else if (error.name === 'NotFoundError') {
        errorResponse = {
          code: 404,
          message: '资源不存在',
        };
        ctx.status = 404;
      } else if (error.name === 'ConflictError') {
        errorResponse = {
          code: 409,
          message: '资源冲突',
        };
        ctx.status = 409;
      } else if (error.code === 'ECONNREFUSED') {
        errorResponse = {
          code: 503,
          message: '数据库连接失败',
        };
        ctx.status = 503;
      }

      // 应用自定义错误映射
      if (errorMappings[error.name]) {
        errorResponse = {
          code: errorMappings[error.name].code,
          message: errorMappings[error.name].message,
        };
        ctx.status = errorMappings[error.name].code;
      }

      // 开发环境下显示详细错误信息
      if (showDetailsInDev && process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
        errorResponse.details = error.message;
      }

      ctx.body = errorResponse;
    }
  };
};

/**
 * 404错误处理中间件
 * 处理未找到的路由
 */
export const notFoundHandler: Middleware = async (ctx: AppContext, next: Next) => {
  await next();

  if (ctx.status === 404 || (!ctx.body && ctx.status === 200)) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '接口不存在',
      path: ctx.path,
      method: ctx.method,
    };
  }
};
