/**
 * 参数验证中间件
 * 请求参数验证和格式化
 */

import { Middleware } from '../types/middleware';
import { AppContext } from '../types/context';

/**
 * 参数验证错误类
 */
export class ValidationError extends Error {
  public errors: Record<string, string>;
  public statusCode: number;

  constructor(errors: Record<string, string>) {
    super('参数验证失败');
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = 400;
  }
}

/**
 * 必填参数验证中间件
 */
export const validateRequired = (requiredFields: string[]): Middleware => {
  return async (ctx: AppContext, next) => {
    const body = ctx.request.body || {};
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      const errors: Record<string, string> = {};
      missingFields.forEach(field => {
        errors[field] = `${field} 不能为空`;
      });

      throw new ValidationError(errors);
    }

    await next();
  };
};

/**
 * 分页参数验证中间件
 */
export const validatePagination = (): Middleware => {
  return async (ctx: AppContext, next) => {
    const query = ctx.query || {};
    const errors: Record<string, string> = {};

    // 验证page参数
    if (query.page !== undefined) {
      const page = parseInt(query.page as string);
      if (isNaN(page) || page < 1) {
        errors.page = 'page 必须是大于0的数字';
      } else {
        query.page = page;
      }
    } else {
      query.page = 1; // 默认值
    }

    // 验证size参数
    if (query.size !== undefined) {
      const size = parseInt(query.size as string);
      if (isNaN(size) || size < 1 || size > 100) {
        errors.size = 'size 必须是1-100之间的数字';
      } else {
        query.size = size;
      }
    } else {
      query.size = 10; // 默认值
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    ctx.query = query;
    await next();
  };
};

/**
 * ID参数验证中间件
 */
export const validateIdParam = (paramName = 'id'): Middleware => {
  return async (ctx: AppContext, next) => {
    const id = ctx.params[paramName];

    if (id === undefined || id === null) {
      throw new ValidationError({ [paramName]: `${paramName} 参数不能为空` });
    }

    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new ValidationError({ [paramName]: `${paramName} 必须是大于0的数字` });
    }

    // 将验证后的ID存回params
    ctx.params[paramName] = parsedId;

    await next();
  };
};
