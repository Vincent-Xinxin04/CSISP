import { Model, DataTypes, Sequelize } from 'sequelize';
import { Status, SemesterConfig } from '@csisp/types';

// 使用标准类型定义
interface AcademicConfigAttributes extends Omit<SemesterConfig, 'id' | 'createdAt' | 'updatedAt'> {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

class AcademicConfig extends Model<AcademicConfigAttributes> implements AcademicConfigAttributes {
  public id!: number;
  public year!: string;
  public semester!: 1 | 2;
  public startDate!: Date;
  public endDate!: Date;
  public isCurrent!: boolean;
  public status!: Status;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export default function (sequelize: Sequelize) {
  AcademicConfig.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      year: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[1, 2]],
        },
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'start_date',
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'end_date',
      },
      isCurrent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_current',
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'AcademicConfig',
      tableName: 'academic_config',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return AcademicConfig;
}
