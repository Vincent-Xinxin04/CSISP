import type { Context, Next } from 'koa';

// 访问日志中间件
//
// 作用：
// - 记录每个请求的 method/path/status/耗时
// - 可通过 excludePaths 排除不需要记录的路径（如 /health）
// - 可选记录响应体前 N 字符，便于排错
type LoggerOptions = { excludePaths?: string[]; logResponse?: boolean };

export default function logger(options: LoggerOptions = {}) {
  const { excludePaths = ['/health'], logResponse = false } = options;

  return async (ctx: Context, next: Next) => {
    if (excludePaths.some(p => ctx.path.startsWith(p))) return next();
    const s = Date.now();
    await next();
    const ms = Date.now() - s;
    const traceId = (ctx.state as any)?.traceId;
    const base = `${ctx.method} ${ctx.path} ${ctx.status} ${ms}ms${
      traceId ? ` traceId=${traceId}` : ''
    }`;
    if (logResponse && ctx.body) {
      process.stdout.write(`${base} body=${JSON.stringify(ctx.body).slice(0, 500)}\n`);
    } else {
      process.stdout.write(`${base}\n`);
    }
  };
}
