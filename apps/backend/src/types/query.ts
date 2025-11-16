// 数据库查询相关类型定义
import { Op, WhereOptions, Order } from 'sequelize';
import { PaginationParams } from '@csisp/types';

/**
 * 排序方向枚举
 */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * 查询操作符枚举
 */
export enum QueryOperator {
  /** 等于 */
  EQUAL = 'eq',
  /** 不等于 */
  NOT_EQUAL = 'ne',
  /** 大于 */
  GREATER_THAN = 'gt',
  /** 大于等于 */
  GREATER_THAN_OR_EQUAL = 'gte',
  /** 小于 */
  LESS_THAN = 'lt',
  /** 小于等于 */
  LESS_THAN_OR_EQUAL = 'lte',
  /** 包含 */
  IN = 'in',
  /** 不包含 */
  NOT_IN = 'notIn',
  /** 包含字符串 */
  LIKE = 'like',
  /** 不包含字符串 */
  NOT_LIKE = 'notLike',
  /** 以字符串开始 */
  STARTS_WITH = 'startsWith',
  /** 以字符串结束 */
  ENDS_WITH = 'endsWith',
  /** 为空 */
  IS_NULL = 'isNull',
  /** 不为空 */
  IS_NOT_NULL = 'isNotNull',
  /** 在范围内 */
  BETWEEN = 'between',
  /** 不在范围内 */
  NOT_BETWEEN = 'notBetween',
}

/**
 * 基础查询条件
 */
export interface BaseQueryCondition {
  /**
   * 字段名
   */
  field: string;
  /**
   * 操作符
   */
  operator: QueryOperator;
  /**
   * 值
   */
  value: any;
}

/**
 * 复合查询条件
 */
export interface CompositeQueryCondition {
  /**
   * AND条件
   */
  and?: (BaseQueryCondition | CompositeQueryCondition)[];
  /**
   * OR条件
   */
  or?: (BaseQueryCondition | CompositeQueryCondition)[];
}

/**
 * 查询条件类型
 */
export type QueryCondition = BaseQueryCondition | CompositeQueryCondition;

/**
 * 排序配置
 */
export interface SortConfig {
  /**
   * 排序字段
   */
  field: string;
  /**
   * 排序方向
   */
  direction: SortDirection;
}

/**
 * 查询参数
 */
export interface QueryParams extends PaginationParams {
  /**
   * 查询条件
   */
  where?: WhereOptions<any> | QueryCondition;
  /**
   * 排序配置
   */
  order?: SortConfig[] | Order;
  /**
   * 关联查询
   */
  include?: string[] | any[];
  /**
   * 选择字段
   */
  attributes?: string[];
  /**
   * 分组字段
   */
  group?: string[];
  /**
   * 是否计数
   */
  count?: boolean;
  /**
   * 事务
   */
  transaction?: any;
}

/**
 * 高级搜索参数
 */
export interface AdvancedSearchParams extends PaginationParams {
  /**
   * 关键词搜索
   */
  keyword?: string;
  /**
   * 过滤条件
   */
  filters?: Record<string, any>;
  /**
   * 排序字段
   */
  sortBy?: string;
  /**
   * 排序方向
   */
  sortDirection?: SortDirection;
  /**
   * 开始日期
   */
  startDate?: string | Date;
  /**
   * 结束日期
   */
  endDate?: string | Date;
}

/**
 * Sequelize查询构建器配置
 */
export interface SequelizeQueryBuilderOptions {
  /**
   * 是否使用软删除
   */
  useSoftDelete?: boolean;
  /**
   * 默认排序字段
   */
  defaultSortField?: string;
  /**
   * 默认排序方向
   */
  defaultSortDirection?: SortDirection;
  /**
   * 允许的排序字段
   */
  allowedSortFields?: string[];
  /**
   * 允许的过滤字段
   */
  allowedFilterFields?: string[];
}

/**
 * 转换查询条件为Sequelize WhereOptions
 */
export function convertToSequelizeWhere(condition: QueryCondition): WhereOptions<any> {
  if ('field' in condition) {
    // 处理基础查询条件
    const { field, operator, value } = condition;

    switch (operator) {
      case QueryOperator.EQUAL:
        return { [field]: value };
      case QueryOperator.NOT_EQUAL:
        return { [field]: { [Op.ne]: value } };
      case QueryOperator.GREATER_THAN:
        return { [field]: { [Op.gt]: value } };
      case QueryOperator.GREATER_THAN_OR_EQUAL:
        return { [field]: { [Op.gte]: value } };
      case QueryOperator.LESS_THAN:
        return { [field]: { [Op.lt]: value } };
      case QueryOperator.LESS_THAN_OR_EQUAL:
        return { [field]: { [Op.lte]: value } };
      case QueryOperator.IN:
        return { [field]: { [Op.in]: value } };
      case QueryOperator.NOT_IN:
        return { [field]: { [Op.notIn]: value } };
      case QueryOperator.LIKE:
        return { [field]: { [Op.like]: `%${value}%` } };
      case QueryOperator.NOT_LIKE:
        return { [field]: { [Op.notLike]: `%${value}%` } };
      case QueryOperator.STARTS_WITH:
        return { [field]: { [Op.like]: `${value}%` } };
      case QueryOperator.ENDS_WITH:
        return { [field]: { [Op.like]: `%${value}` } };
      case QueryOperator.IS_NULL:
        return { [field]: { [Op.is]: null } };
      case QueryOperator.IS_NOT_NULL:
        return { [field]: { [Op.not]: null } };
      case QueryOperator.BETWEEN:
        return { [field]: { [Op.between]: value } };
      case QueryOperator.NOT_BETWEEN:
        return { [field]: { [Op.notBetween]: value } };
      default:
        return { [field]: value };
    }
  } else {
    // 处理复合查询条件
    const sequelizeWhere: WhereOptions<any> = {};

    if (condition.and) {
      // 使用正确的方式设置Op.and条件
      Object.assign(sequelizeWhere, {
        [Op.and]: condition.and.map(convertToSequelizeWhere),
      });
    }
    if (condition.or) {
      // 使用正确的方式设置Op.or条件
      Object.assign(sequelizeWhere, {
        [Op.or]: condition.or.map(convertToSequelizeWhere),
      });
    }

    return sequelizeWhere;
  }
}
