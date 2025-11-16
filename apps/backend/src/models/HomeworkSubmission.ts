import { Model, DataTypes, Sequelize } from 'sequelize';
import { HomeworkSubmission as HomeworkSubmissionType } from '@csisp/types';

// 使用标准类型定义
interface HomeworkSubmissionAttributes
  extends Omit<HomeworkSubmissionType, 'id' | 'submitTime' | 'updatedAt'> {
  id: number;
  homeworkId: number;
  userId: number;
  submitTime: Date;
  created_at?: Date;
  updated_at?: Date;
}

class HomeworkSubmission
  extends Model<HomeworkSubmissionAttributes>
  implements HomeworkSubmissionAttributes
{
  public id!: number;
  public homeworkId!: number;
  public userId!: number;
  public filePath!: string;
  public fileName?: string;
  public content?: string;
  public status!: string;
  public submitTime!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联方法
  public static associate(models: Record<string, any>) {
    HomeworkSubmission.belongsTo(models.Homework, { foreignKey: 'homework_id' });
    HomeworkSubmission.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default function (sequelize: Sequelize) {
  HomeworkSubmission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      homeworkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      filePath: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'submitted',
      },
      submitTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'HomeworkSubmission',
      tableName: 'homework_submission',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return HomeworkSubmission;
}
