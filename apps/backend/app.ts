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
import cors from '@koa/cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 导入自定义中间件
import {
  errorHandler,
  notFoundHandler,
  logger,
  accessLogger,
  rateLimit,
  userRateLimit,
  apiRateLimit,
  strictRateLimit,
  relaxedRateLimit,
  defaultCors,
  validateRequired,
  validatePagination,
  validateIdParam,
} from './src/middlewares/index.js';

// 导入路由
import {
  createUserRoutes,
  createCourseRoutes,
  createAttendanceRoutes,
  createHomeworkRoutes,
} from './src/routes/index.js';

// 导入控制器
import { UserController } from './src/controllers/UserController.js';
import { CourseController } from './src/controllers/CourseController.js';
import { AttendanceController } from './src/controllers/AttendanceController.js';
import { HomeworkController } from './src/controllers/HomeworkController.js';

// 导入服务
import { UserService } from './src/services/UserService.js';
import { CourseService } from './src/services/CourseService.js';
import { AttendanceService } from './src/services/AttendanceService.js';
import { HomeworkService } from './src/services/HomeworkService.js';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建Koa应用实例
const app = new Koa();

// 创建路由实例
const router = new Router();

// 环境配置
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * 初始化服务层
 */
function initializeServices() {
  return {
    userService: new UserService(),
    courseService: new CourseService(),
    attendanceService: new AttendanceService(),
    homeworkService: new HomeworkService(),
  };
}

/**
 * 初始化控制器
 */
function initializeControllers(services: ReturnType<typeof initializeServices>) {
  return {
    userController: new UserController(services.userService),
    courseController: new CourseController(services.courseService),
    attendanceController: new AttendanceController(services.attendanceService),
    homeworkController: new HomeworkController(services.homeworkService),
  };
}

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
  app.use(
    cors({
      origin: ctx => {
        const origin = ctx.get('Origin');
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
          'http://localhost:5174',
        ];

        if (NODE_ENV === 'development') {
          return origin || '*';
        }

        return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
      },
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token',
        'Accept',
        'Accept-Language',
        'Content-Language',
      ],
      exposeHeaders: ['X-Total-Count', 'X-Page', 'X-Page-Size'],
      maxAge: 86400,
    })
  );

  // 日志中间件
  app.use(
    accessLogger({
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
function setupRoutes(controllers: ReturnType<typeof initializeControllers>) {
  // 健康检查路由
  router.get('/health', ctx => {
    ctx.body = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
    };
  });

  // API路由
  router.use('/api/users', createUserRoutes(controllers.userController));
  router.use('/api/courses', createCourseRoutes(controllers.courseController));
  router.use('/api/attendance', createAttendanceRoutes(controllers.attendanceController));
  router.use('/api/homework', createHomeworkRoutes(controllers.homeworkController));

  // 根路由
  router.get('/', ctx => {
    ctx.body = {
      message: 'Welcome to CSISP Backend API',
      version: '1.0.0',
      environment: NODE_ENV,
      endpoints: {
        health: '/health',
        users: '/api/users',
        courses: '/api/courses',
        attendance: '/api/attendance',
        homework: '/api/homework',
      },
    };
  });

  // 404处理
  router.all('(.*)', ctx => {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: 'API endpoint not found',
      path: ctx.path,
      method: ctx.method,
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
    // 初始化服务
    const services = initializeServices();

    // 初始化控制器
    const controllers = initializeControllers(services);

    // 配置中间件
    setupGlobalMiddleware();

    // 配置路由
    setupRoutes(controllers);

    // 启动HTTP服务器
    const server = app.listen(PORT, () => {
      console.log(`🚀 CSISP Backend Server is running at http://localhost:${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🔧 Process ID: ${process.pid}`);
      console.log(`📅 Started at: ${new Date().toISOString()}`);
    });

    // 优雅关闭处理
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📤 Received ${signal}, starting graceful shutdown...`);

      server.close(() => {
        console.log('✅ HTTP server closed');

        // 这里可以添加数据库连接关闭等清理操作

        console.log('🎉 Graceful shutdown completed');
        process.exit(0);
      });

      // 强制关闭超时
      setTimeout(() => {
        console.error('⚠️  Force shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // 监听系统信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 未捕获异常处理
    process.on('uncaughtException', error => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// 启动应用
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, startServer };
