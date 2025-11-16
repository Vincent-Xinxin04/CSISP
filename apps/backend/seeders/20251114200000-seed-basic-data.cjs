'use strict';

/**
 * CSISP 数据库基础种子数据
 * 包含用户、角色、课程等基础测试数据
 */

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('开始初始化基础数据...');

    // 创建角色数据
    const roles = await queryInterface.bulkInsert(
      'roles',
      [
        {
          name: '管理员',
          code: 'ADMIN',
          description: '系统管理员',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '教师',
          code: 'TEACHER',
          description: '授课教师',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '学生',
          code: 'STUDENT',
          description: '学生用户',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: ['id'] }
    );

    console.log('角色创建成功');

    // 创建用户数据
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = await queryInterface.bulkInsert(
      'users',
      [
        {
          username: 'admin',
          password: hashedPassword,
          realName: '系统管理员',
          studentId: 'ADMIN001',
          email: 'admin@csisp.edu',
          phone: '13800138000',
          enrollmentYear: 2020,
          major: '计算机科学与技术',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: 'teacher1',
          password: hashedPassword,
          realName: '张老师',
          studentId: 'TEA001',
          email: 'teacher1@csisp.edu',
          phone: '13800138001',
          enrollmentYear: 2015,
          major: '计算机科学与技术',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: 'student1',
          password: hashedPassword,
          realName: '李学生',
          studentId: '20220001',
          email: 'student1@csisp.edu',
          phone: '13800138002',
          enrollmentYear: 2022,
          major: '计算机科学与技术',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: ['id'] }
    );

    console.log('用户创建成功');

    // 创建教师数据，关联到用户表
    const teachers = await queryInterface.bulkInsert(
      'teachers',
      [
        {
          userId: users[1].id,
          realName: '张老师',
          email: 'teacher1@csisp.edu',
          phone: '13800138001',
          department: '计算机科学与技术系',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: null, // 可以后续关联
          realName: '王老师',
          email: 'teacher2@csisp.edu',
          phone: '13800138003',
          department: '网络工程系',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: ['id'] }
    );

    console.log('教师创建成功');

    // 创建课程数据
    const courses = await queryInterface.bulkInsert(
      'courses',
      [
        {
          name: '程序设计基础',
          code: 'CS101',
          semester: '2025-1',
          academicYear: 2025,
          description: '计算机专业基础课程',
          credit: 3,
          availableMajors: JSON.stringify(['计算机科学与技术', '网络工程']),
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '数据结构',
          code: 'CS201',
          semester: '2025-2',
          academicYear: 2025,
          description: '算法与数据结构课程',
          credit: 4,
          availableMajors: JSON.stringify(['计算机科学与技术', '网络工程']),
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: ['id'] }
    );

    // 创建班级数据
    const classes = await queryInterface.bulkInsert(
      'classes',
      [
        {
          courseId: courses[0].id,
          teacherId: teachers[0].id,
          className: '计算机科学与技术1班',
          classCode: 'CS2025-1-01',
          studentCount: 30,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          courseId: courses[1].id,
          teacherId: teachers[1].id,
          className: '网络工程1班',
          classCode: 'NE2025-1-01',
          studentCount: 25,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: ['id'] }
    );

    console.log('课程和班级创建成功');

    // 创建用户角色关联
    await queryInterface.bulkInsert(
      'userRoles',
      [
        { userId: users[0].id, roleId: roles[0].id }, // 管理员角色
        { userId: users[1].id, roleId: roles[1].id }, // 教师角色
        { userId: users[2].id, roleId: roles[2].id }, // 学生角色
      ],
      {}
    );

    // 创建课程教师关联
    await queryInterface.bulkInsert(
      'courseTeachers',
      [
        { courseId: courses[0].id, teacherId: teachers[0].id },
        { courseId: courses[1].id, teacherId: teachers[1].id },
      ],
      {}
    );

    // 创建用户班级关联
    await queryInterface.bulkInsert(
      'userClasses',
      [{ userId: users[2].id, classId: classes[0].id }],
      {}
    );

    console.log('✅ 基础种子数据插入成功');
  },

  async down(queryInterface, Sequelize) {
    // 按依赖关系逆序删除数据
    await queryInterface.bulkDelete('userClasses', null, {});
    await queryInterface.bulkDelete('courseTeachers', null, {});
    await queryInterface.bulkDelete('userRoles', null, {});
    await queryInterface.bulkDelete('classes', null, {});
    await queryInterface.bulkDelete('courses', null, {});
    await queryInterface.bulkDelete('teachers', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('roles', null, {});

    console.log('✅ 基础种子数据回滚成功');
  },
};
