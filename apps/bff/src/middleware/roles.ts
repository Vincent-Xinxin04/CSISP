import type { Context, Next } from 'koa';

// 角色/权限相关中间件
//
// requireRole：
// - 确保当前用户具备 roles 中至少一个角色，否则返回 403
// - 依赖 jwtAuth 将 roles 写入 ctx.state.roles
export const requireRole = (roles: string | string[]) => {
  const list = Array.isArray(roles) ? roles : [roles];
  return async (ctx: Context, next: Next) => {
    const userRoles: string[] = ((ctx.state as any)?.roles || []) as string[];
    if (!userRoles.length || !list.some(r => userRoles.includes(r))) {
      ctx.status = 403;
      ctx.body = { code: 403, message: '权限不足' };
      return;
    }
    await next();
  };
};

// requireAdmin：
// - 判断当前用户是否具有 admin 角色，或用户名为 admin
// - 不满足条件时返回 403，提示需要管理员权限
export const requireAdmin = async (ctx: Context, next: Next) => {
  const roles: string[] = ((ctx.state as any)?.roles || []) as string[];
  const user = (ctx.state as any)?.user;
  const isAdminRole = roles.includes('admin');
  const isAdminUser = user && user.username === 'admin';
  if (!isAdminRole && !isAdminUser) {
    ctx.status = 403;
    ctx.body = { code: 403, message: '需要管理员权限' };
    return;
  }
  await next();
};
