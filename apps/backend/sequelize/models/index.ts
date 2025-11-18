import { Sequelize, DataTypes } from 'sequelize';
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
} catch {
  process.stderr.write('Failed to load database config\n');
  process.exit(1);
}

// 创建 Sequelize 实例
let sequelize: Sequelize;
if (dbConfig.use_env_variable) {
  // 支持环境变量配置的情况
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable] as string, {
    dialect: 'postgres',
    logging: false,
    ...dbConfig,
  });
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: false,
    ...dbConfig,
  });
}

// 定义模型类型
interface Models {
  [key: string]: any;
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
}

// 加载所有模型
const models: Models = {
  sequelize,
  Sequelize,
};

// 动态导入所有模型文件
const loadModels = async () => {
  const modelFiles = fs
    .readdirSync(__dirname)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts');

  for (const file of modelFiles) {
    const modelModule = await import(`./${file}`);
    const factory = modelModule.default;
    const model = factory(sequelize, DataTypes);
    models[model.name] = model;
  }

  // 建立模型关联
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });
};

// 导出一个就绪Promise，供外部等待模型加载完成
export const modelsReady = loadModels().catch(() => {
  process.stderr.write('Failed to load models\n');
  process.exit(1);
});

export { sequelize, Sequelize };
export default models;
