import type { Context, Next } from 'koa';
import type Koa from 'koa';

export const test1 = (ctx: Context) => {
  console.log(ctx.method);
};

export const test2 = (ctx: Koa.Context) => {
  console.log(ctx.method);
};
