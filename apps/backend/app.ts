/**
 * CSISP Backend Application Entry Point
 * 主要功能：
 * - 初始化Koa应用
 * - 配置中间件栈
 * - 设置路由
 * - 启动服务器
 */

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from '@koa/router';

// 导入自定义中间件
import { errorHandler, logger, rateLimit, defaultCors } from './src/middlewares';

// 导入路由配置与控制器初始化
import { initializeControllers } from './src/initControllers';
import { RouterConfig } from './src/controllers/RouterConfig';

// 创建Koa应用实例
const app = new (Koa as any)();

// 创建路由实例
const router = new Router();

// 环境配置
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 使用统一控制器与路由配置（ServiceFactory + Sequelize 模型注册）

/**
 * 配置全局中间件
 */
function setupGlobalMiddleware() {
  // 错误处理中间件（必须第一个）
  app.use(
    errorHandler({
      showDetailsInDev: NODE_ENV === 'development',
      logErrors: true,
    })
  );

  // CORS中间件
  app.use(defaultCors);

  // 日志中间件
  app.use(
    logger({
      logBody: NODE_ENV === 'development',
      excludePaths: ['/health', '/favicon.ico'],
    })
  );

  // 速率限制中间件
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 1000, // 每个IP最多1000次请求
      excludePaths: ['/health'],
    })
  );

  // 请求体解析中间件
  app.use(
    bodyParser({
      enableTypes: ['json', 'form'],
      jsonLimit: '10mb',
      formLimit: '10mb',
    })
  );
}

/**
 * 配置路由
 */
function setupRoutes(controllers: RouterConfig) {
  // 从控制器配置获取统一 API 路由
  const apiRouter = controllers.getRouter();
  app.use(apiRouter.routes());
  app.use(apiRouter.allowedMethods());

  // 根路由
  router.get('/', (ctx: any) => {
    ctx.body = {
      message: 'Welcome to CSISP Backend API',
      version: '1.0.0',
      environment: NODE_ENV,
      endpoints: {
        api: '/api',
      },
    };
  });

  // 应用路由
  app.use(router.routes());
  app.use(router.allowedMethods());
}

/**
 * 启动服务器
 */
async function startServer() {
  try {
    // 初始化控制器与路由
    const controllers = await initializeControllers();

    // 配置中间件
    setupGlobalMiddleware();

    // 配置路由
    setupRoutes(controllers);

    // 启动HTTP服务器
    const server = app.listen(PORT, () => {
      process.stdout.write(
        `\x1b[36m[CSISP]\x1b[0m 🚀 Server started · \x1b[1mPort\x1b[0m=${PORT} · \x1b[1mEnv\x1b[0m=${NODE_ENV} · \x1b[1mPID\x1b[0m=${process.pid}\n`
      );
    });

    // 优雅关闭处理
    const gracefulShutdown = (signal: string) => {
      process.stdout.write(`\x1b[36m[CSISP]\x1b[0m ⏹️  Shutdown signal received: ${signal}\n`);

      server.close(() => {
        process.stdout.write('\x1b[36m[CSISP]\x1b[0m 🔌 Server closed\n');

        // 这里可以添加数据库连接关闭等清理操作

        process.stdout.write('\x1b[36m[CSISP]\x1b[0m 🔌 Shutdown done\n');
        process.exit(0);
      });

      // 强制关闭超时
      setTimeout(() => {
        process.stderr.write('\x1b[36m[CSISP]\x1b[0m 🔌 Force shutdown timeout\n');
        process.exit(1);
      }, 10000);
    };

    // 监听系统信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 未捕获异常处理
    process.on('uncaughtException', () => {
      process.stderr.write('uncaught_exception\n');
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', () => {
      process.stderr.write('unhandled_rejection\n');
      gracefulShutdown('unhandledRejection');
    });
  } catch {
    process.stderr.write('failed_start_server\n');
    process.exit(1);
  }
}

// 启动应用
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, startServer };
