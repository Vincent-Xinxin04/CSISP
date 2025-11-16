import { Model, DataTypes, Sequelize } from 'sequelize';
import { Status, AttendanceTask as AttendanceTaskType } from '@csisp/types';

// 使用标准类型定义
interface AttendanceTaskAttributes
  extends Omit<AttendanceTaskType, 'id' | 'createdAt' | 'updatedAt'> {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

class AttendanceTask extends Model<AttendanceTaskAttributes> implements AttendanceTaskAttributes {
  public id!: number;
  public classId!: number;
  public taskName!: string;
  public taskType!: string;
  public startTime!: Date;
  public endTime!: Date;
  public status!: Status;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联方法
  public static associate(models: Record<string, any>) {
    AttendanceTask.belongsTo(models.Class, { foreignKey: 'class_id' });
    AttendanceTask.hasMany(models.AttendanceRecord, { foreignKey: 'attendance_task_id' });
  }
}

export default function (sequelize: Sequelize) {
  AttendanceTask.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      taskName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      taskType: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endTime: {
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
      modelName: 'AttendanceTask',
      tableName: 'attendance_task',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return AttendanceTask;
}
