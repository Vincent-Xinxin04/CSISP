import { Model, DataTypes, Sequelize } from 'sequelize';
import { Status, Semester, Class as ClassType } from '@csisp/types';

// 使用标准类型定义
interface ClassAttributes extends Omit<ClassType, 'id' | 'createdAt' | 'updatedAt'> {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

class Class extends Model<ClassAttributes> implements ClassAttributes {
  public id!: number;
  public className!: string;
  public courseId!: number;
  public teacherId!: number;
  public semester!: Semester;
  public academicYear!: number;
  public maxStudents!: number;
  public status!: Status;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联方法
  public static associate(models: Record<string, any>) {
    Class.belongsTo(models.Course, { foreignKey: 'course_id' });
    Class.belongsTo(models.Teacher, { foreignKey: 'teacher_id' });
    Class.hasMany(models.AttendanceTask, { foreignKey: 'class_id' });
    Class.hasMany(models.AttendanceRecord, { foreignKey: 'class_id' });
    Class.hasMany(models.Schedule, { foreignKey: 'class_id' });
  }
}

export default function (sequelize: Sequelize) {
  Class.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      className: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      maxStudents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'Class',
      tableName: 'class',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return Class;
}
