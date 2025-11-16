import { Model, DataTypes, Sequelize } from 'sequelize';
import { Status, Semester, Course as CourseType } from '@csisp/types';

// 使用标准类型定义
interface CourseAttributes extends Omit<CourseType, 'id' | 'createdAt' | 'updatedAt'> {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

class Course extends Model<CourseAttributes> implements CourseAttributes {
  public id!: number;
  public courseName!: string;
  public courseCode!: string;
  public semester!: Semester;
  public academicYear!: number;
  public availableMajors!: string[];
  public status!: Status;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联方法
  public static associate(models: Record<string, any>) {
    Course.hasMany(models.Class, { foreignKey: 'course_id' });
    Course.hasMany(models.AttendanceTask, { foreignKey: 'course_id' });
    Course.hasMany(models.Homework, { foreignKey: 'course_id' });
    Course.hasMany(models.CourseRep, { foreignKey: 'course_id' });
  }
}

export default function (sequelize: Sequelize) {
  Course.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      courseName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      courseCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[1, 2]], // 对应Semester枚举值
        },
      },
      academicYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      availableMajors: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'Course',
      tableName: 'course',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return Course;
}
