/**
 * 基础控制器类
 * 提供通用的响应处理和错误处理机制
 */
import { AppContext } from '../types/context';
import { ApiResponse } from '@csisp/types';

export abstract class BaseController {
  /**
   * 发送成功响应
   * @param ctx Koa上下文
   * @param data 响应数据
   * @param message 响应消息
   * @param code 响应码
   */
  protected success<T>(
    ctx: AppContext,
    data?: T,
    message: string = '操作成功',
    code: number = 200
  ): void {
    ctx.body = {
      code,
      message,
      data,
    } as ApiResponse<T>;
    ctx.status = code;
  }

  /**
   * 发送错误响应
   * @param ctx Koa上下文
   * @param message 错误消息
   * @param code 错误码
   * @param data 错误数据
   */
  protected error<T>(
    ctx: AppContext,
    message: string = '操作失败',
    code: number = 400,
    data?: T
  ): void {
    ctx.body = {
      code,
      message,
      data,
    } as ApiResponse<T>;
    ctx.status = code;
  }

  /**
   * 发送未找到响应
   * @param ctx Koa上下文
   * @param message 消息
   */
  protected notFound(ctx: AppContext, message: string = '资源不存在'): void {
    ctx.body = {
      code: 404,
      message,
    } as ApiResponse;
    ctx.status = 404;
  }

  /**
   * 发送未授权响应
   * @param ctx Koa上下文
   * @param message 消息
   */
  protected unauthorized(ctx: AppContext, message: string = '未授权访问'): void {
    ctx.body = {
      code: 401,
      message,
    } as ApiResponse;
    ctx.status = 401;
  }

  /**
   * 发送禁止访问响应
   * @param ctx Koa上下文
   * @param message 消息
   */
  protected forbidden(ctx: AppContext, message: string = '禁止访问'): void {
    ctx.body = {
      code: 403,
      message,
    } as ApiResponse;
    ctx.status = 403;
  }

  /**
   * 发送服务器错误响应
   * @param ctx Koa上下文
   * @param message 消息
   * @param data 错误数据
   */
  protected serverError<T>(ctx: AppContext, message: string = '服务器内部错误', data?: T): void {
    ctx.body = {
      code: 500,
      message,
      data,
    } as ApiResponse<T>;
    ctx.status = 500;
  }

  /**
   * 验证必填参数
   * @param ctx Koa上下文
   * @param requiredParams 必填参数数组
   * @param body 请求体
   * @returns 验证结果
   */
  protected validateRequiredParams(ctx: AppContext, requiredParams: string[], body: any): boolean {
    const missingParams = requiredParams.filter(param => !body[param]);

    if (missingParams.length > 0) {
      this.error(ctx, `缺少必填参数: ${missingParams.join(', ')}`, 400);
      return false;
    }

    return true;
  }

  /**
   * 验证分页参数
   * @param ctx Koa上下文
   * @param query 查询参数
   * @returns 分页参数
   */
  protected validatePagination(ctx: AppContext, query: any): { page: number; size: number } {
    const page = parseInt(query.page) || 1;
    const size = parseInt(query.size) || 10;

    if (page < 1) {
      this.error(ctx, '页码必须大于0', 400);
      throw new Error('Invalid page number');
    }

    if (size < 1 || size > 100) {
      this.error(ctx, '每页数量必须在1-100之间', 400);
      throw new Error('Invalid page size');
    }

    return { page, size };
  }

  /**
   * 处理服务层响应
   * @param ctx Koa上下文
   * @param serviceResponse 服务层响应
   */
  protected handleServiceResponse<T>(ctx: AppContext, serviceResponse: ApiResponse<T>): void {
    const { code, message, data } = serviceResponse;

    if (code >= 200 && code < 300) {
      this.success(ctx, data, message, code);
    } else if (code === 404) {
      this.notFound(ctx, message);
    } else if (code === 401) {
      this.unauthorized(ctx, message);
    } else if (code === 403) {
      this.forbidden(ctx, message);
    } else if (code === 409) {
      this.error(ctx, message, 409, data);
    } else if (code >= 400 && code < 500) {
      this.error(ctx, message, code, data);
    } else {
      this.serverError(ctx, message, data);
    }
  }
}
