# 计算机学院综合服务平台(CSISP)

## 快速开始

### 安装依赖

```bash
pnpm i

# 也可以只安装一个子项目的依赖
pnpm --filter [sub-application-name] i
```

### 运行子项目

```bash
pnpm --filter [sub-application-name] dev
```

### 开发依赖数据库的后端子项目

对于 `apps/backend` 等需要连接数据库的后端项目，推荐在本地通过 Docker 启动数据库与 Redis 后再启动服务：

```bash
# 启动数据库基础设施（以 macOS 为例）
bash infra/database/scripts/init_mac.sh

# 初始化数据库结构与种子数据
pnpm --filter @csisp/db-schema run migrate
pnpm --filter @csisp/db-schema run seed

# 启动 backend
pnpm --filter @csisp/backend dev
```

### 开发前端项目

项目中前端项目依赖于 BFF 项目，因此在开发前端项目时，需要先启动 BFF 项目。

```bash
# 启动 BFF 项目
pnpm --filter @csisp/bff dev
```

```bash
# 启动前端项目
pnpm --filter @csisp/frontend-admin dev
pnpm --filter @csisp/frontend-portal dev
```

### 构建子项目

```bash
pnpm --filter [sub-application-name] build
```

## 环境配置说明

- `/.env.example`：示例模板，列出项目需要的环境变量键与典型取值，不参与运行，仅供参考和同步到 GitHub Environments 使用。
- `/.env`：本地通用默认配置，供后端、BFF 以及 `infra/database` 的 Docker Compose 读取。多人协作时应保持为“可运行但不含真实敏感信息”的默认值。
- `/.env.local`：开发者个人覆盖配置（已被 Git 忽略），用于在本地覆盖 `/.env` 中的默认值，例如连接远程数据库、调整本地端口等。
- `/.env.test`：测试环境配置（已被 Git 忽略），供本地或 CI 测试使用，不用于正常开发与生产部署。
- `apps/*/.env`：子项目级默认值（若存在），用于少量与该子应用强相关的配置，一般不放敏感信息。
- `apps/*/.env.local`：子项目级个人覆盖配置（已被 Git 忽略），优先级高于同目录 `.env` 和根目录 `/.env`，可按需覆写某个子项目的行为。

> 运行时优先级大致为：操作系统环境变量 > 子项目 `.env.local` > 子项目 `.env` > 根目录 `/.env`。示例：本地开发 `apps/backend`，若需要连接远程数据库，可以在 `apps/backend/.env.local` 中设置 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD` 等变量，而无需修改 `/.env`。

## 文档

文档位于 `docs/`，入口为 `docs/index.md`。本地预览与构建：

```bash
pnpm -C docs dev
pnpm -C docs build
```

## 贡献

- 分支与提交：遵循 Conventional Commits；功能在 feature 分支完成并发起 PR，关联 Issue。
- 代码质量：PR 必须通过类型检查、lint 与基础测试；保持一致的编码风格与目录结构。
- 文档与脚本：涉及接口、数据库或部署流程的改动须同步更新 `docs/` 与相关脚本。
- 数据库演进：所有 Schema 变更通过 `packages/db-schema` 的迁移脚本管理；禁止直接手改生产库结构。
- 安全与合规：严禁提交密钥、凭证等敏感信息；使用 CI/CD 平台的 Secrets 管理连接与令牌。
