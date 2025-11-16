import { Model, DataTypes, Sequelize } from 'sequelize';
import { Status, Homework as HomeworkType } from '@csisp/types';

// 使用标准类型定义
interface HomeworkAttributes extends Omit<HomeworkType, 'id' | 'createdAt' | 'updatedAt'> {
  id: number;
  classId: number;
  created_at?: Date;
  updated_at?: Date;
}

class Homework extends Model<HomeworkAttributes> implements HomeworkAttributes {
  public id!: number;
  public classId!: number;
  public title!: string;
  public content!: string;
  public deadline!: Date;
  public status!: Status;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联方法
  public static associate(models: Record<string, any>) {
    Homework.belongsTo(models.Class, { foreignKey: 'class_id' });
    Homework.hasMany(models.HomeworkSubmission, { foreignKey: 'homework_id' });
  }
}

export default function (sequelize: Sequelize) {
  Homework.init(
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
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deadline: {
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
      modelName: 'Homework',
      tableName: 'homework',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return Homework;
}
