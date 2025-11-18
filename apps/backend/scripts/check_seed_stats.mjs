import { Sequelize, QueryTypes } from 'sequelize';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const dbAll = require('../config/config.json');

const dbConfig = dbAll.development;

async function main() {
  const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect || 'postgres',
    logging: false,
  });
  try {
    await sequelize.authenticate();

    const q = (sql, repl = {}) =>
      sequelize.query(sql, { replacements: repl, type: QueryTypes.SELECT });

    const [usersCount] = await q('SELECT COUNT(*)::int AS count FROM "user"');
    const [studentsCount] = await q(
      'SELECT COUNT(*)::int AS count FROM "user" WHERE username LIKE \'student%\''
    );
    const [teachersCount] = await q('SELECT COUNT(*)::int AS count FROM teacher');
    const [coursesCount] = await q('SELECT COUNT(*)::int AS count FROM course');
    const [classesCount] = await q('SELECT COUNT(*)::int AS count FROM class');
    const [timeSlotsCount] = await q('SELECT COUNT(*)::int AS count FROM time_slot');
    const [tasksCount] = await q('SELECT COUNT(*)::int AS count FROM attendance_task');
    const [recordsCount] = await q('SELECT COUNT(*)::int AS count FROM attendance_record');

    const dist = await q(
      'SELECT enrollment_year, major, COUNT(*)::int AS count FROM "user" WHERE username LIKE \'student%\' GROUP BY enrollment_year, major ORDER BY enrollment_year, major'
    );

    console.log('=== 数据规模统计 ===');
    console.log(`总用户: ${usersCount.count}`);
    console.log(`学生总数: ${studentsCount.count}`);
    console.log(`教师总数: ${teachersCount.count}`);
    console.log(`课程总数: ${coursesCount.count}`);
    console.log(`班级总数: ${classesCount.count}`);
    console.log(`时间槽总数: ${timeSlotsCount.count}`);
    console.log(`考勤任务总数: ${tasksCount.count}`);
    console.log(`考勤记录总数: ${recordsCount.count}`);

    console.log('\n=== 学生分布（按年/专业） ===');
    for (const row of dist) {
      console.log(`年: ${row.enrollment_year} 专业: ${row.major} 数量: ${row.count}`);
    }

    await sequelize.close();
  } catch (err) {
    console.error('统计数据失败:', err.message || err);
    process.exit(1);
  }
}

main();
