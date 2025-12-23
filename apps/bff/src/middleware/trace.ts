import type { Context, Next } from 'koa';

// 链路追踪 ID 中间件
//
// 作用：
// - 从请求头 X-Trace-Id 读取现有 traceId，若不存在则生成新的
// - 将 traceId 写入 ctx.state.traceId，并回写到响应头 X-Trace-Id
// - 便于在日志与下游服务中串联一次请求的完整调用链
function genTraceId() {
  const r = Math.random().toString(16).slice(2, 10);
  return `${Date.now().toString(16)}-${r}`;
}

export default function traceMiddleware() {
  return async (ctx: Context, next: Next) => {
    const incoming = ctx.get('X-Trace-Id');
    const traceId = incoming || genTraceId();
    (ctx.state as any).traceId = traceId;
    ctx.set('X-Trace-Id', traceId);
    await next();
  };
}
