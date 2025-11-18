/**
 * 基础服务类
 * 提供通用的CRUD操作和错误处理机制
 */
import { ApiResponse, PaginationParams, PaginationResponse } from '@csisp/types';

export abstract class BaseService {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  /**
   * 创建记录
   * @param data 创建数据
   * @returns 创建结果
   */
  async create(data: any): Promise<ApiResponse<any>> {
    try {
      const record = await this.model.create(data);
      return {
        code: 201,
        message: '创建成功',
        data: record,
      };
    } catch (error) {
      return this.handleError(error, '创建失败');
    }
  }

  /**
   * 根据ID查找记录
   * @param id 记录ID
   * @returns 查找结果
   */
  async findById(id: number): Promise<ApiResponse<any | null>> {
    try {
      const record = await this.model.findByPk(id);
      if (!record) {
        return {
          code: 404,
          message: '记录不存在',
        };
      }
      return {
        code: 200,
        message: '查询成功',
        data: record,
      };
    } catch (error) {
      return this.handleError(error, '查询失败');
    }
  }

  /**
   * 更新记录
   * @param id 记录ID
   * @param data 更新数据
   * @returns 更新结果
   */
  async update(id: number, data: any): Promise<ApiResponse<any | null>> {
    try {
      const [affectedCount, affectedRows] = await this.model.update(data, {
        where: { id },
        returning: true,
      });

      if (affectedCount === 0) {
        return {
          code: 404,
          message: '记录不存在',
        };
      }

      return {
        code: 200,
        message: '更新成功',
        data: affectedRows[0],
      };
    } catch (error) {
      return this.handleError(error, '更新失败');
    }
  }

  /**
   * 删除记录
   * @param id 记录ID
   * @returns 删除结果
   */
  async delete(id: number): Promise<ApiResponse<boolean>> {
    try {
      const affectedCount = await this.model.destroy({
        where: { id },
      });

      if (affectedCount === 0) {
        return {
          code: 404,
          message: '记录不存在',
        };
      }

      return {
        code: 200,
        message: '删除成功',
        data: true,
      };
    } catch (error) {
      return this.handleError<boolean>(error, '删除失败');
    }
  }

  /**
   * 分页查询
   * @param params 分页参数
   * @param where 查询条件
   * @returns 分页结果
   */
  async findAllWithPagination(
    params: PaginationParams,
    where?: any
  ): Promise<ApiResponse<PaginationResponse<any>>> {
    try {
      const { page, size } = params;
      const offset = (page - 1) * size;

      const { count, rows } = await this.model.findAndCountAll({
        where,
        limit: size,
        offset,
        order: [['created_at', 'DESC']],
      });

      const totalPages = Math.ceil(count / size);

      return {
        code: 200,
        message: '查询成功',
        data: {
          data: rows,
          total: count,
          page,
          size,
          totalPages,
        },
      };
    } catch (error) {
      return this.handleError<PaginationResponse<any>>(error, '查询失败');
    }
  }

  /**
   * 查询所有记录
   * @param where 查询条件
   * @returns 查询结果
   */
  async findAll(where?: any): Promise<ApiResponse<any[]>> {
    try {
      const records = await this.model.findAll({
        where,
        order: [['created_at', 'DESC']],
      });

      return {
        code: 200,
        message: '查询成功',
        data: records,
      };
    } catch (error) {
      return this.handleError<any[]>(error, '查询失败');
    }
  }

  /**
   * 错误处理
   * @param error 错误对象
   * @param message 错误消息
   * @returns 错误响应
   */
  protected handleError<T>(error: any, message: string): ApiResponse<T> {
    const payload = { model: this.model?.name, error: String(error?.message || error) };
    process.stderr.write(`service_error:${JSON.stringify(payload)}\n`);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return {
        code: 409,
        message: '数据已存在',
      } as ApiResponse<T>;
    }

    if (error.name === 'SequelizeValidationError') {
      return {
        code: 400,
        message: error.errors[0]?.message || '数据验证失败',
      } as ApiResponse<T>;
    }

    return {
      code: 500,
      message: message,
    } as ApiResponse<T>;
  }
}
