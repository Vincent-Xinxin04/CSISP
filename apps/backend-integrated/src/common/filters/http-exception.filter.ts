/**
 * 全局 HTTP 异常过滤器
 *
 * 统一捕获控制器/守卫/拦截器抛出的异常，
 * 将其转换为统一的 { code, message } 响应结构，
 * 并通过 Nest Logger 输出错误日志。
 */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { getBackendLogger } from '@infra/logger';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse();
    const request: any = ctx.getRequest();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: number = status;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = status;
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && (res as any).message) {
        message = (res as any).message as string;
      }
    } else if ((exception as any)?.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST;
      code = status;
      message = '参数验证失败';
    }

    const traceId: string | undefined =
      request.headers?.['x-trace-id'] ??
      request.headers?.['X-Trace-Id'] ??
      request.headers?.['x-traceid'];
    const logger = getBackendLogger('error', traceId);

    logger.error(
      {
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
        userId: request.userId ?? request.user?.id ?? null,
        status,
        errorMessage: (exception as any)?.message ?? undefined,
        errorName: (exception as any)?.name ?? undefined,
      },
      'Request failed'
    );

    response.status(status).json({
      code,
      message,
    });
  }
}
