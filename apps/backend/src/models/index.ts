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
  const configPath = path.resolve(__dirname, '../../config/config.json');
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

// 加载所有模型
const models: Record<string, any> = {};

// 动态导入所有模型文件
const loadModels = async () => {
  const modelFiles = fs
    .readdirSync(__dirname)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts');

  for (const file of modelFiles) {
    const modelModule = await import(`./${file}`);
    const model = modelModule.default(sequelize);
    models[model.name] = model;
  }

  // 建立模型关联
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });
};

// 立即执行模型加载
loadModels().catch(error => {
  console.error('Failed to load models:', error);
  process.exit(1);
});

export { sequelize };
export default models;
