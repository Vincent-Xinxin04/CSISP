/**
 * 用户控制器
 * 处理用户相关的HTTP请求，包括注册、登录、用户管理等
 */
import { AppContext } from '../types/context';
import { UserService } from '../services/UserService';
import { BaseController } from './BaseController';
import { CreateUserInput, UpdateUserInput, LoginParams } from '@csisp/types';

export class UserController extends BaseController {
  private userService: UserService;

  constructor(userService: UserService) {
    super();
    this.userService = userService;
  }

  /**
   * 用户注册
   * POST /api/users/register
   * @param ctx Koa上下文
   */
  async register(ctx: AppContext): Promise<void> {
    try {
      const userData: CreateUserInput = ctx.request.body as CreateUserInput;

      // 验证必填参数
      const requiredParams = [
        'username',
        'password',
        'realName',
        'studentId',
        'enrollmentYear',
        'major',
      ];
      if (!this.validateRequiredParams(ctx, requiredParams, userData)) {
        return;
      }

      const result = await this.userService.register(userData);
      this.handleServiceResponse(ctx, result);
    } catch (error) {
      console.error('用户注册错误:', error);
      this.serverError(ctx, '用户注册失败');
    }
  }

  /**
   * 用户登录
   * POST /api/users/login
   * @param ctx Koa上下文
   */
  async login(ctx: AppContext): Promise<void> {
    try {
      const loginData: LoginParams = ctx.request.body as LoginParams;

      // 验证必填参数
      const requiredParams = ['username', 'password'];
      if (!this.validateRequiredParams(ctx, requiredParams, loginData)) {
        return;
      }

      const result = await this.userService.login(loginData);
      this.handleServiceResponse(ctx, result);
    } catch (error) {
      console.error('用户登录错误:', error);
      this.serverError(ctx, '用户登录失败');
    }
  }

  /**
   * 获取当前用户信息
   * GET /api/users/me
   * @param ctx Koa上下文
   */
  async getCurrentUser(ctx: AppContext): Promise<void> {
    try {
      // 从JWT中间件获取用户信息
      const userId = ctx.state.user?.userId;
      if (!userId) {
        this.unauthorized(ctx, '未登录或登录已过期');
        return;
      }

      const result = await this.userService.findById(userId);
      this.handleServiceResponse(ctx, result);
    } catch (error) {
      console.error('获取当前用户信息错误:', error);
      this.serverError(ctx, '获取用户信息失败');
    }
  }

  /**
   * 根据ID获取用户信息
   * GET /api/users/:id
   * @param ctx Koa上下文
   */
  async getUserById(ctx: AppContext): Promise<void> {
    try {
      const userId = parseInt(ctx.params.id);
      if (isNaN(userId)) {
        this.error(ctx, '用户ID必须是数字', 400);
        return;
      }

      const result = await this.userService.findById(userId);
      this.handleServiceResponse(ctx, result);
    } catch (error) {
      console.error('获取用户信息错误:', error);
      this.serverError(ctx, '获取用户信息失败');
    }
  }

  /**
   * 根据学号获取用户信息
   * GET /api/users/student/:studentId
   * @param ctx Koa上下文
   */
  async getUserByStudentId(ctx: AppContext): Promise<void> {
    try {
      const studentId = ctx.params.studentId;
      if (!studentId) {
        this.error(ctx, '学号不能为空', 400);
        return;
      }

      const result = await this.userService.findByStudentId(studentId);
      this.handleServiceResponse(ctx, result);
    } catch (error) {
      console.error('根据学号获取用户信息错误:', error);
      this.serverError(ctx, '获取用户信息失败');
    }
  }

  /**
   * 更新用户信息
   * PUT /api/users/:id
   * @param ctx Koa上下文
   */
  async updateUser(ctx: AppContext): Promise<void> {
    try {
      const userId = parseInt(ctx.params.id);
      if (isNaN(userId)) {
        this.error(ctx, '用户ID必须是数字', 400);
        return;
      }

      const updateData: UpdateUserInput = ctx.request.body as UpdateUserInput;

      // 验证只能更新允许字段
      const allowedFields = ['realName', 'email', 'phone', 'major', 'status'];
      const updateFields = Object.keys(updateData);
      const invalidFields = updateFields.filter(field => !allowedFields.includes(field));

      if (invalidFields.length > 0) {
        this.error(ctx, `不允许更新的字段: ${invalidFields.join(', ')}`, 400);
        return;
      }

      const result = await this.userService.update(userId, updateData);
      this.handleServiceResponse(ctx, result);
    } catch (error) {
      console.error('更新用户信息错误:', error);
      this.serverError(ctx, '更新用户信息失败');
    }
  }

  /**
   * 获取用户列表（分页）
   * GET /api/users?page=1&size=10&major=计算机科学&enrollmentYear=2023
   * @param ctx Koa上下文
   */
  async getUsers(ctx: AppContext): Promise<void> {
    try {
      // 验证分页参数
      const pagination = this.validatePagination(ctx, ctx.query);

      // 构建查询条件
      const { major, enrollmentYear, status } = ctx.query;
      const where: any = {};

      if (major) where.major = major;
      if (enrollmentYear) where.enrollmentYear = parseInt(enrollmentYear as string);
      if (status !== undefined) where.status = parseInt(status as string);

      const result = await this.userService.findAllWithPagination(pagination, where);
      this.handleServiceResponse(ctx, result);
    } catch (error) {
      console.error('获取用户列表错误:', error);
      this.serverError(ctx, '获取用户列表失败');
    }
  }

  /**
   * 批量创建用户
   * POST /api/users/bulk
   * @param ctx Koa上下文
   */
  async bulkCreateUsers(ctx: AppContext): Promise<void> {
    try {
      const usersData: CreateUserInput[] = ctx.request.body as CreateUserInput[];

      if (!Array.isArray(usersData) || usersData.length === 0) {
        this.error(ctx, '用户数据必须是数组且不能为空', 400);
        return;
      }

      if (usersData.length > 100) {
        this.error(ctx, '一次最多创建100个用户', 400);
        return;
      }

      // 验证每个用户数据的必填字段
      for (let i = 0; i < usersData.length; i++) {
        const user = usersData[i];
        const requiredParams = [
          'username',
          'password',
          'realName',
          'studentId',
          'enrollmentYear',
          'major',
        ];
        const missingParams = requiredParams.filter(param => !user[param as keyof CreateUserInput]);

        if (missingParams.length > 0) {
          this.error(ctx, `第${i + 1}个用户缺少必填字段: ${missingParams.join(', ')}`, 400);
          return;
        }
      }

      const result = await this.userService.bulkCreate(usersData);
      this.handleServiceResponse(ctx, result);
    } catch (error) {
      console.error('批量创建用户错误:', error);
      this.serverError(ctx, '批量创建用户失败');
    }
  }

  /**
   * 分配角色给用户
   * POST /api/users/:id/roles
   * @param ctx Koa上下文
   */
  async assignRoles(ctx: AppContext): Promise<void> {
    try {
      const userId = parseInt(ctx.params.id);
      if (isNaN(userId)) {
        this.error(ctx, '用户ID必须是数字', 400);
        return;
      }

      const { roleIds } = ctx.request.body as { roleIds: number[] };

      if (!Array.isArray(roleIds)) {
        this.error(ctx, '角色ID必须是数组', 400);
        return;
      }

      if (roleIds.length > 10) {
        this.error(ctx, '用户最多分配10个角色', 400);
        return;
      }

      const result = await this.userService.assignRoles(userId, roleIds);
      this.handleServiceResponse(ctx, result);
    } catch (error) {
      console.error('分配角色错误:', error);
      this.serverError(ctx, '分配角色失败');
    }
  }

  /**
   * 获取用户角色
   * GET /api/users/:id/roles
   * @param ctx Koa上下文
   */
  async getUserRoles(ctx: AppContext): Promise<void> {
    try {
      const userId = parseInt(ctx.params.id);
      if (isNaN(userId)) {
        this.error(ctx, '用户ID必须是数字', 400);
        return;
      }

      const result = await this.userService.getUserRoles(userId);
      this.handleServiceResponse(ctx, result);
    } catch (error) {
      console.error('获取用户角色错误:', error);
      this.serverError(ctx, '获取用户角色失败');
    }
  }

  /**
   * 获取用户统计信息
   * GET /api/users/stats
   * @param ctx Koa上下文
   */
  async getUserStats(ctx: AppContext): Promise<void> {
    try {
      const result = await this.userService.getUserStats();
      this.handleServiceResponse(ctx, result);
    } catch (error) {
      console.error('获取用户统计错误:', error);
      this.serverError(ctx, '获取用户统计失败');
    }
  }
}
