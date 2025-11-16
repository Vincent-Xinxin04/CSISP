import { Model, DataTypes, Sequelize } from 'sequelize';
import { AttendanceStatus, AttendanceRecord as AttendanceRecordType } from '@csisp/types';

// 使用标准类型定义
interface AttendanceRecordAttributes
  extends Omit<AttendanceRecordType, 'id' | 'createdAt' | 'updatedAt'> {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

class AttendanceRecord
  extends Model<AttendanceRecordAttributes>
  implements AttendanceRecordAttributes
{
  public id!: number;
  public attendanceTaskId!: number;
  public userId!: number;
  public status!: AttendanceStatus;
  public remark!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联方法
  public static associate(models: Record<string, any>) {
    AttendanceRecord.belongsTo(models.AttendanceTask, { foreignKey: 'attendance_task_id' });
    AttendanceRecord.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default function (sequelize: Sequelize) {
  AttendanceRecord.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      attendanceTaskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [['normal', 'late', 'absent', 'leave', 'not_checked']],
        },
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'AttendanceRecord',
      tableName: 'attendance_record',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return AttendanceRecord;
}
