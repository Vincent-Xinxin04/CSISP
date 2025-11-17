/**
 * 用户服务类
 * 处理用户相关的业务逻辑，包括用户管理、认证、角色分配等
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CreateUserInput, LoginParams, ApiResponse, Status } from '@csisp/types';
import { BaseService } from './BaseService';
import { UserRepository } from '../../repositories/UserRepository';
import { UserMapper } from '../../mappers/UserMapper';

export class UserService extends BaseService {
  private userRepository: UserRepository;
  private userMapper: UserMapper;

  constructor(userRepository: UserRepository) {
    super();
    this.userRepository = userRepository;
    this.userMapper = new UserMapper();
  }

  /**
   * 用户注册
   * @param userData 用户注册数据
   * @returns 注册结果
   */
  async register(userData: CreateUserInput): Promise<ApiResponse<any>> {
    try {
      // 检查用户名是否已存在
      const existingUser = await this.userRepository.findByUsername(userData.username);

      if (existingUser) {
        return {
          code: 409,
          message: '用户名已存在',
        };
      }

      // 检查学号是否已存在
      const existingStudent = await this.userRepository.findByStudentId(userData.studentId);

      if (existingStudent) {
        return {
          code: 409,
          message: '学号已存在',
        };
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // 创建用户 - 使用mapper转换数据
      const user = await this.userRepository.create({
        username: userData.username,
        password: hashedPassword,
        studentId: userData.studentId,
        name: userData.realName,
        enrollmentYear: userData.enrollmentYear,
        major: userData.major,
        status: userData.status || Status.Active,
      });

      // 使用mapper转换返回数据
      const businessUser = this.userMapper.toBusinessModel(user);

      return {
        code: 201,
        message: '用户注册成功',
        data: businessUser,
      };
    } catch (error) {
      return this.handleError(error, '用户注册失败');
    }
  }

  /**
   * 用户登录
   * @param loginData 登录参数
   * @returns 登录结果，包含JWT令牌
   */
  async login(loginData: LoginParams): Promise<ApiResponse<any>> {
    try {
      const { username, password } = loginData;

      // 查找用户
      const user = await this.userRepository.findByUsername(username);

      if (!user) {
        return {
          code: 401,
          message: '用户名或密码错误',
        };
      }

      // 检查用户状态
      if (user.status === Status.Inactive) {
        return {
          code: 403,
          message: '账户已被禁用',
        };
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          code: 401,
          message: '用户名或密码错误',
        };
      }

      // 使用mapper转换用户数据
      const businessUser = this.userMapper.toBusinessModel(user);

      // 提取角色信息
      const roles = businessUser.roles.map((role: any) => role.name).filter(Boolean);

      // 生成JWT令牌
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          roles,
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as any
      );

      return {
        code: 200,
        message: '登录成功',
        data: {
          token,
          user: businessUser,
          roles: roles as string[],
        },
      };
    } catch (error) {
      return this.handleError(error, '登录失败');
    }
  }

  /**
   * 分配角色给用户
   * @param userId 用户ID
   * @param roleIds 角色ID数组
   * @returns 分配结果
   */
  async assignRoles(userId: number, roleIds: number[]): Promise<ApiResponse<boolean>> {
    try {
      // 检查用户是否存在
      const user = await this.model.findByPk(userId);
      if (!user) {
        return {
          code: 404,
          message: '用户不存在',
        } as ApiResponse<boolean>;
      }

      // 删除现有角色关联
      await this.userRoleModel.destroy({
        where: { user_id: userId }, // 注意字段映射
      });

      // 创建新的角色关联
      if (roleIds.length > 0) {
        const userRoles = roleIds.map(roleId => ({
          user_id: userId, // 注意字段映射
          role_id: roleId, // 注意字段映射
        }));

        await this.userRoleModel.bulkCreate(userRoles);
      }

      return {
        code: 200,
        message: '角色分配成功',
        data: true,
      };
    } catch (error) {
      return this.handleError(error, '角色分配失败') as ApiResponse<boolean>;
    }
  }

  /**
   * 获取用户角色
   * @param userId 用户ID
   * @returns 用户角色列表
   */
  async getUserRoles(userId: number): Promise<ApiResponse<any[]>> {
    try {
      const user = await this.model.findByPk(userId, {
        include: [
          {
            model: this.roleModel,
            through: { attributes: [] },
          },
        ],
      });

      if (!user) {
        return {
          code: 404,
          message: '用户不存在',
        } as ApiResponse<any[]>;
      }

      return {
        code: 200,
        message: '获取用户角色成功',
        data: (user as any).Roles || [],
      };
    } catch (error) {
      return this.handleError(error, '获取用户角色失败') as ApiResponse<any[]>;
    }
  }

  /**
   * 根据学号查找用户
   * @param studentId 学号
   * @returns 用户信息
   */
  async findByStudentId(studentId: string): Promise<ApiResponse<any | null>> {
    try {
      const user = await this.userRepository.findByStudentId(studentId);

      if (!user) {
        return {
          code: 404,
          message: '用户不存在',
        };
      }

      // 使用mapper转换返回数据
      const businessUser = this.userMapper.toBusinessModel(user);

      return {
        code: 200,
        message: '查询成功',
        data: businessUser,
      };
    } catch (error) {
      return this.handleError(error, '查询失败');
    }
  }

  /**
   * 批量创建用户
   * @param usersData 用户数据数组
   * @returns 创建结果
   */
  async bulkCreate(usersData: CreateUserInput[]): Promise<ApiResponse<any[]>> {
    try {
      // 密码批量加密
      const processedUsers = await Promise.all(
        usersData.map(async userData => ({
          username: userData.username,
          password: await bcrypt.hash(userData.password, 12),
          studentId: userData.studentId,
          name: userData.realName,
          enrollmentYear: userData.enrollmentYear,
          major: userData.major,
          status: userData.status || Status.Active,
        }))
      );

      const users = await this.userRepository.bulkCreate(processedUsers);

      // 使用mapper转换返回数据格式
      const result = users.map(user => this.userMapper.toBusinessModel(user));

      return {
        code: 201,
        message: '批量创建用户成功',
        data: result,
      };
    } catch (error) {
      return this.handleError(error, '批量创建用户失败') as ApiResponse<any[]>;
    }
  }

  /**
   * 获取用户统计信息
   * @returns 统计信息
   */
  async getUserStats(): Promise<ApiResponse<any>> {
    try {
      const totalCount = await this.model.count();
      const activeCount = await this.model.count({ where: { status: Status.Active } });
      const inactiveCount = await this.model.count({ where: { status: Status.Inactive } });

      // 按专业统计
      const majorStats = await this.model.findAll({
        attributes: ['major', [this.model.sequelize!.fn('COUNT', '*'), 'count']],
        group: ['major'],
        raw: true,
      });

      // 按入学年份统计
      const yearStats = await this.model.findAll({
        attributes: ['enrollment_year', [this.model.sequelize!.fn('COUNT', '*'), 'count']], // 注意字段映射
        group: ['enrollment_year'],
        order: [['enrollment_year', 'DESC']],
        raw: true,
      });

      return {
        code: 200,
        message: '获取用户统计成功',
        data: {
          totalCount,
          activeCount,
          inactiveCount,
          majorStats,
          yearStats,
        },
      };
    } catch (error) {
      return this.handleError(error, '获取用户统计失败');
    }
  }
}
