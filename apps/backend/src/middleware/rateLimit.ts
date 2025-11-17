/**
 * 速率限制中间件
 * 防止API被过度使用
 */

import { Middleware, RateLimitMiddlewareOptions } from '../types/middleware';
import { AppContext } from '../types/context';

// 存储速率限制数据
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * 内存存储的速率限制中间件
 * 注意：生产环境建议使用Redis等外部存储
 */
export const rateLimit = (options: RateLimitMiddlewareOptions = {}): Middleware => {
  const {
    windowMs = 60 * 1000, // 1分钟
    max = 100, // 每分钟最多100次请求
    keyGenerator = (ctx: AppContext) => ctx.ip,
    message = '请求过于频繁，请稍后再试',
    excludePaths = ['/health', '/metrics'],
  } = options;

  return async (ctx: AppContext, next) => {
    // 检查是否在排除路径中
    if (excludePaths.some(path => ctx.path.startsWith(path))) {
      return await next();
    }

    const key = keyGenerator(ctx);
    const now = Date.now();

    // 获取或创建速率限制记录
    let record = rateLimitStore.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(key, record);
    }

    // 检查是否超过限制
    if (record.count >= max) {
      ctx.status = 429;
      ctx.body = {
        code: 429,
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      };
      return;
    }

    // 增加计数
    record.count++;

    // 设置响应头
    ctx.set('X-RateLimit-Limit', max.toString());
    ctx.set('X-RateLimit-Remaining', (max - record.count).toString());
    ctx.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    await next();
  };
};

/**
 * 用户级别的速率限制
 * 基于用户ID进行限制
 */
export const userRateLimit = (options: RateLimitMiddlewareOptions = {}): Middleware => {
  return rateLimit({
    ...options,
    keyGenerator: (ctx: AppContext) => {
      return ctx.userId ? `user:${ctx.userId}` : `ip:${ctx.ip}`;
    },
  });
};

/**
 * API端点级别的速率限制
 * 基于IP和路径进行限制
 */
export const apiRateLimit = (options: RateLimitMiddlewareOptions = {}): Middleware => {
  return rateLimit({
    ...options,
    keyGenerator: (ctx: AppContext) => {
      return `api:${ctx.ip}:${ctx.method}:${ctx.path}`;
    },
  });
};

/**
 * 严格速率限制
 * 适用于敏感操作
 */
export const strictRateLimit = (options: RateLimitMiddlewareOptions = {}): Middleware => {
  return rateLimit({
    windowMs: 5 * 60 * 1000, // 5分钟
    max: 10, // 每5分钟最多10次
    message: '操作过于频繁，请5分钟后再试',
    ...options,
  });
};

/**
 * 宽松速率限制
 * 适用于一般查询操作
 */
export const relaxedRateLimit = (options: RateLimitMiddlewareOptions = {}): Middleware => {
  return rateLimit({
    windowMs: 60 * 1000, // 1分钟
    max: 1000, // 每分钟最多1000次
    message: '请求过于频繁，请稍后再试',
    ...options,
  });
};
