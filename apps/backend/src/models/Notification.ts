import { Model, DataTypes, Sequelize } from 'sequelize';
import { Notification as NotificationType } from '@csisp/types';

// 使用标准类型定义
interface NotificationAttributes extends Omit<NotificationType, 'id' | 'createdAt' | 'updatedAt'> {
  id: number;
  targetUserId: number;
  senderId: number;
  created_at?: Date;
  updated_at?: Date;
}

class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
  public id!: number;
  public type!: string;
  public title!: string;
  public content!: string;
  public targetUserId!: number;
  public senderId!: number;
  public status!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联方法
  public static associate(models: Record<string, any>) {
    Notification.belongsTo(models.User, { foreignKey: 'sender_id' });
    Notification.belongsTo(models.User, { foreignKey: 'target_user_id' });
  }
}

export default function (sequelize: Sequelize) {
  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      targetUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'unread',
      },
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notification',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return Notification;
}
