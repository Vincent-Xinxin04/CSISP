import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取当前文件路径（ESM模式）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取当前环境配置
const env = process.env.NODE_ENV || 'development';
// 动态导入配置文件以避免TypeScript编译错误
let dbConfig: any;
try {
  const configPath = path.resolve(__dirname, '../config/config.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configData);
  dbConfig = config[env];
} catch (error) {
  console.error('Failed to load database config:', error);
  process.exit(1);
}

// 创建 Sequelize 实例
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'postgres',
  logging: false,
});

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}

// 同步数据库模型（开发环境下使用）
async function syncModels(force = false) {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database models have been synchronized successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to synchronize database models:', error);
    return false;
  }
}

// 关闭数据库连接
async function closeConnection() {
  try {
    await sequelize.close();
    console.log('✅ Database connection has been closed successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to close database connection:', error);
    return false;
  }
}

// 导出数据库连接和工具函数
export { sequelize, testConnection, syncModels, closeConnection };
