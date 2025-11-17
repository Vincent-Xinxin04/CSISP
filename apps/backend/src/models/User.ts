import { Model, DataTypes, Sequelize } from 'sequelize';
import { Status } from '@csisp/types';

// 使用标准类型定义
interface UserAttributes {
  id: number;
  username: string;
  password: string;
  studentId: string;
  enrollmentYear: number;
  major: string;
  realName: string;
  status: Status;
  created_at?: Date;
  updated_at?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public studentId!: string;
  public enrollmentYear!: number;
  public major!: string;
  public realName!: string;
  public status!: Status;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联方法
  public static associate(models: Record<string, any>) {
    User.belongsToMany(models.Role, { through: models.UserRole, foreignKey: 'user_id' });
    User.hasMany(models.Notification, { foreignKey: 'user_id' });
    User.hasMany(models.HomeworkSubmission, { foreignKey: 'student_id' });
  }
}

export default function (sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      studentId: {
        type: DataTypes.STRING(11),
        allowNull: false,
        unique: true,
      },
      enrollmentYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 2000,
          max: 3000,
        },
      },
      major: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      realName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'user',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return User;
}
