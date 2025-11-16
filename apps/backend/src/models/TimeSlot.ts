import { Model, DataTypes, Sequelize } from 'sequelize';
import { Status, TimeSlot as TimeSlotType } from '@csisp/types';

// 使用标准类型定义
interface TimeSlotAttributes extends Omit<TimeSlotType, 'id' | 'createdAt' | 'updatedAt'> {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

class TimeSlot extends Model<TimeSlotAttributes> implements TimeSlotAttributes {
  public id!: number;
  public subCourseId!: number;
  public weekday!: number;
  public startTime!: string;
  public endTime!: string;
  public location!: string;
  public status!: Status;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联方法
  public static associate(models: Record<string, any>) {
    TimeSlot.hasMany(models.Schedule, { foreignKey: 'time_slot_id' });
  }
}

export default function (sequelize: Sequelize) {
  TimeSlot.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      subCourseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      weekday: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 7,
        },
      },
      startTime: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      endTime: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'TimeSlot',
      tableName: 'time_slot',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return TimeSlot;
}
