import type { Context } from 'koa';
import { aggregateAdminOverview } from '@services/admin/dashboard.service';
import { getRequestLogger } from '@infra/logger';

export async function getAdminOverview(ctx: Context) {
  const q: any = (ctx.state as any)?.query || {};
  const days = Number(q.days ?? 30);
  const limit = Number(q.limit ?? 10);
  const traceId = (ctx.state as any)?.traceId as string | undefined;
  const auth = ctx.get('Authorization') || undefined;
  const data: any = await aggregateAdminOverview(days, limit, traceId, auth);
  if (data?.meta?.error) {
    const log = getRequestLogger(ctx);
    log.warn(
      { context: 'admin-dashboard', error: data.meta.error },
      'Admin overview partial failure'
    );
  }
  const msg = data?.meta?.error ? data.meta.error : 'OK';
  ctx.body = { code: 0, message: msg, data };
}
