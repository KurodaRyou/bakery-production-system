# Bakery App 技术备忘录

**Last Updated:** 2026-04-27

---

## 当前架构

- **前端**: React + Vite (Docker)
- **后端**: Node.js + Express (Docker)
- **数据库**: TiDB Cloud
- **MCP Server**: Model Context Protocol (Node.js)
- **部署**: Docker Compose
- **远程访问**: Cloudflare Tunnel

---

## 开发流程

```bash
cd ~/Docker/bakery

# 修改代码后重建
docker compose build
docker compose up -d

# 仅重启
docker compose restart
```

---

## 数据库设计

### materials (核心统一表)
所有物料（原材料/半成品/面团/配方）统一通过 materials 表管理。

```
materials
├── id (主键)
├── name
├── type (dough/ingredient/preparation)
└── created_at
```

### 关联关系
```
materials.id
    ↑
    ├── ingredients.material_id
    ├── doughs.material_id (dough_recipes 已合并)
    ├── preparations.material_id (preparation_recipes 已合并)
    ├── dough_ingredients_current.material_id (dough_recipe_ingredients_current 已重命名)
    └── preparation_ingredients_current.material_id
```

### 创建流程 (2026-04-28 更新)
- **面团**: materials → doughs → dough_versions → dough_ingredients_current
- **半成品**: materials → preparations → preparation_versions → preparation_ingredients_current

### 表结构 (2026-04-28 合并后)

**doughs** (was doughs + dough_recipes): id, name, material_id, author, current_version, loss_rate, created_at, updated_at
**dough_versions** (was dough_recipe_versions): id, recipe_id, version_number, expected_temp, author, created_at
**dough_ingredients_current** (was dough_recipe_ingredients_current): 不变
**dough_ingredients_archive** (was dough_recipe_ingredients_archive): 不变

**preparations** (was preparations + preparation_recipes): id, name, material_id, type, notes, author, current_version, loss_rate, created_at, updated_at
**preparation_versions**: id, recipe_id, version_number, author, created_at
**preparation_ingredients_current**: preparation_recipe_id, version, material_id, percentage, stage, note, unit, loss_rate
**preparation_ingredients_archive**: version_id, material_id, stage, percentage, note, unit, loss_rate

已移除字段: timezone (所有表), source_id (doughs), preparation_id (preparations), description (doughs/preparations)

### 原料顺序
- 原料顺序由 INSERT 顺序决定（AUTO_INCREMENT id）
- 新版本创建时，复制所有原料生成新的 id

### users 表新增 api_token
- 用途：Bearer Token 认证（MCP Server）
- 类型：VARCHAR(64)
- 创建：`node setup-api-token.js`

---

## 数据库迁移

所有数据库变更通过 `backend/setup-*.js` 脚本执行。

| Script | Purpose |
|--------|---------|
| `setup-auth.js` | 创建 users 表、roles 表、admin 用户 |
| `setup-ingredients.js` | 创建 ingredients 表、插入常用原料 |
| `setup-api-token.js` | 添加 api_token 列、创建 LLM 用户 |

### 执行迁移：
```bash
cd backend
node setup-api-token.js
```

---

## 待开发功能

### 原材料删除保护（软拦截方案）

**问题**：删除某个原材料时，如果有配方引用了该原材料，应该如何处理？

**方案（讨论结论）**：

1. **后端软拦截**
   - 删除原材料前查询 `dough_ingredients_current` 和 `preparation_ingredients_current` 中是否有引用
   - 如有引用，返回被哪些配方使用，但仍是允许删除
   - 需处理 `preparation_ingredients_current` 的 FK 约束（`fk_prep_mat`），考虑是否去掉改为软约束

2. **前端确认弹窗**
   - 收到后端返回的引用列表后，弹窗告知用户「该原材料被 XX、YY 配方使用」
   - 用户确认后强制删除

3. **配方页孤配料提醒**
   - 配方详情页加载时，检查 ingredients 中 `material_id` 是否仍存在于 `materials` 表
   - 如不存在，标记为「已删除的原材料（id=XXX）」以示提醒

**待决定**：是否去掉 `fk_prep_mat` FK 约束改为纯代码软约束。

---

## MCP Server

Model Context Protocol server，供 LLM 通过标准协议查询和操作数据。

### 目录
```
mcp-server/
├── src/
│   ├── index.ts           # Entry point, stdio transport
│   ├── backend.ts         # Backend API client
│   ├── types.ts           # TypeScript types
│   └── tools/
│       ├── read.ts        # Read-only tools
│       └── write.ts       # Write tools (with confirm)
├── examples/              # Client configs
├── package.json
└── tsconfig.json
```

### 构建
```bash
cd mcp-server
npm install && npm run build
```

### 环境变量
| Variable | Description |
|----------|-------------|
| BAKERY_API_TOKEN | LLM 用户的 API Token |
| BAKERY_API_URL | Backend URL (default: http://localhost:8080) |

### Tools
| Tool | Type | Description |
|------|------|-------------|
| get_recipes | Read | 查询所有配方 |
| get_recipe_detail | Read | 根据 ID 查询配方详情 |
| get_records | Read | 查询打面记录 |
| get_materials | Read | 查询物料表 |
| get_preparations | Read | 查询半成品 |
| create_record | Write | 创建打面记录（需 confirm） |
| update_record | Write | 更新打面记录（需 confirm） |

### 配置示例
见 `mcp-server/examples/` 目录，支持：
- Claude Desktop
- Cursor
- VS Code
- OpenCode

---

## 认证系统

### Cookie 认证（前端）
```
Login → Server sets httpOnly cookie: authToken=xxx; SameSite=Lax
Frontend → All API calls use credentials: 'include'
Backend → getSession() checks cookie → looks up sessions Map
```

### Bearer Token 认证（MCP Server）
```
MCP Server → Authorization: Bearer <token>
Backend → getSession() detects Bearer prefix
Backend → queries users.api_token column (async)
Backend → returns session-like object
```

### LLM 用户
| Field | Value |
|-------|-------|
| username | llm |
| role | manager |
| can_view_recipes | 1 |
| api_token | `<your-llm-token>` |

---

## 上云注意事项

### 1. 环境变量 (.env)
```bash
DB_HOST=<your-tidb-host>
DB_PORT=4000
DB_USER=<your-user>
DB_PASSWORD=<your-password>
DB_NAME=bakery
BAKERY_MASTER_KEY=<64-char-hex-key>
```

### 2. Session 存储
内存 session 多实例部署会失效 → 使用 Redis

### 3. CORS
生产环境应限制允许的域名

### 4. HTTPS
生产环境必须启用

### 5. TiDB Cloud
将服务器 IP 加入允许列表

---

## 待实现

1. Redis Session 存储
2. CORS 限制
3. CI/CD 自动化部署

---

## 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-04-28 | 重构：合并 `doughs` + `dough_recipes` → `doughs`，合并 `preparations` + `preparation_recipes` → `preparations`；移除 `timezone`/`source_id`/`preparation_id` 列；重命名版本表 `dough_recipe_versions` → `dough_versions`，配料表 `dough_recipe_ingredients_*` → `dough_ingredients_*` |
| 2026-04-28 | 修复：新建配方选择"半成品"类型时，preparation 分支逻辑缺失（未创建 preparations/preparation_recipes/current_version/preparation_versions/preparation_ingredients_current），导致半成品 current_version 为 null |
| 2026-04-28 | 修复：MixingCalculator 下拉菜单 ID 冲突——后端新增 `/dough/by-material/{materialId}` 和 `/preparations/by-material/{materialId}` 端点，前端统一用 material_id 作为 select value |
| 2026-04-27 | 新增：Bearer Token 认证 |
| 2026-04-27 | 新增：users.api_token 列 |
| 2026-04-27 | 新增：LLM 用户 (username=llm) |
| 2026-04-27 | 修复：getSession() 支持异步 Bearer Token |
| 2026-04-27 | 新增：数据库迁移脚本 (`setup-api-token.js`) |
| 2026-04-08 | 更新：UI 统一化，CSS 变量 |
| 2026-04-08 | 修复：重复 topbar 问题 |
| 2026-04-07 | 修复：preparation_ingredients_current schema |
| 2026-04-07 | 修复：dough_recipe_ingredients_archive 查询 |
| 2026-04-07 | 修复：版本号验证 |
| 2026-03-30 | 更新：表名重命名（recipes→dough_recipes, preparations→preparation_recipes） |
| 2026-03-30 | 更新：数据库设计，反映新的表结构和关联关系 |