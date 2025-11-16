import { Model, DataTypes, Sequelize } from 'sequelize';
import { Status, CourseRep as CourseRepType } from '@csisp/types';

// 使用标准类型定义
interface CourseRepAttributes
  extends Omit<CourseRepType, 'id' | 'createdAt' | 'updatedAt' | 'appointmentDate'> {
  id: number;
  userId: number;
  classId: number;
  appointmentDate: Date;
  created_at?: Date;
  updated_at?: Date;
}

class CourseRep extends Model<CourseRepAttributes> implements CourseRepAttributes {
  public id!: number;
  public userId!: number;
  public classId!: number;
  public responsibility!: string;
  public appointmentDate!: Date;
  public status!: Status;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联方法
  public static associate(models: Record<string, any>) {
    CourseRep.belongsTo(models.User, { foreignKey: 'user_id' });
    CourseRep.belongsTo(models.Class, { foreignKey: 'class_id' });
  }
}

export default function (sequelize: Sequelize) {
  CourseRep.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      responsibility: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'CourseRep',
      tableName: 'course_rep',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return CourseRep;
}
