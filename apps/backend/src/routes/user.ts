/**
 * 用户相关路由
 * 处理用户注册、登录、用户信息管理等
 */

import Router from '@koa/router';
import { UserController } from '../controllers/UserController';
import { jwtAuth, requireAdmin } from '../middlewares/auth';
import { validateRequired, validateIdParam, validatePagination } from '../middlewares/validation';
import { AppContext } from '../types/context';

export function createUserRoutes(userController: UserController): Router {
  const router = new Router({ prefix: '/api/users' });

  /**
   * 用户注册
   * POST /api/users/register
   */
  router.post(
    '/register',
    validateRequired(['username', 'password', 'realName', 'studentId', 'enrollmentYear', 'major']),
    async (ctx: AppContext) => {
      await userController.register(ctx);
    }
  );

  /**
   * 用户登录
   * POST /api/users/login
   */
  router.post('/login', validateRequired(['username', 'password']), async (ctx: AppContext) => {
    await userController.login(ctx);
  });

  /**
   * 获取当前用户信息
   * GET /api/users/me
   */
  router.get('/me', jwtAuth(), async (ctx: AppContext) => {
    await userController.getCurrentUser(ctx);
  });

  /**
   * 根据ID获取用户信息
   * GET /api/users/:id
   */
  router.get('/:id', jwtAuth(), validateIdParam('id'), async (ctx: AppContext) => {
    await userController.getUserById(ctx);
  });

  /**
   * 根据学号获取用户信息
   * GET /api/users/student/:studentId
   */
  router.get('/student/:studentId', jwtAuth(), async (ctx: AppContext) => {
    await userController.getUserByStudentId(ctx);
  });

  /**
   * 更新用户信息
   * PUT /api/users/:id
   */
  router.put('/:id', jwtAuth(), validateIdParam('id'), async (ctx: AppContext) => {
    await userController.updateUser(ctx);
  });

  /**
   * 获取用户列表（分页）
   * GET /api/users?page=1&size=10&major=计算机科学&enrollmentYear=2023
   */
  router.get('/', jwtAuth(), requireAdmin, validatePagination(), async (ctx: AppContext) => {
    await userController.getUsers(ctx);
  });

  /**
   * 批量创建用户
   * POST /api/users/bulk
   */
  router.post('/bulk', jwtAuth(), requireAdmin, async (ctx: AppContext) => {
    await userController.bulkCreateUsers(ctx);
  });

  /**
   * 分配角色给用户
   * POST /api/users/:id/roles
   */
  router.post(
    '/:id/roles',
    jwtAuth(),
    requireAdmin,
    validateIdParam('id'),
    validateRequired(['roleIds']),
    async (ctx: AppContext) => {
      await userController.assignRoles(ctx);
    }
  );

  /**
   * 获取用户角色
   * GET /api/users/:id/roles
   */
  router.get('/:id/roles', jwtAuth(), validateIdParam('id'), async (ctx: AppContext) => {
    await userController.getUserRoles(ctx);
  });

  return router;
}
