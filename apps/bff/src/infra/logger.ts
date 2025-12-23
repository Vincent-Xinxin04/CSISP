import type { Context } from 'koa';
import { createLogger } from '@csisp/logger';

const baseLogger = createLogger('bff');

export function getBaseLogger() {
  return baseLogger;
}

export function getRequestLogger(ctx: Context) {
  const traceId = (ctx.state as any)?.traceId;
  return traceId ? baseLogger.child({ traceId }) : baseLogger;
}
