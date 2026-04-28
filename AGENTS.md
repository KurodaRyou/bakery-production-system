# Bakery App - AI Agent Knowledge Base

**Parent:** None (root knowledge file)  
**Last Updated:** 2026-04-28  
**Stack:** React + Vite, Node.js + Express, TiDB Cloud, Docker

---

## 📚 相关文档 (LLM 请按需阅读)

| 文件 | 内容 |
|------|------|
| `AGENTS.md` | 本文件 - 项目总览、数据库 Schema、API 路由 |
| `backend/AGENTS.md` | 后端架构、认证流程、关键函数、环境变量 |
| `bakery-web/src/components/AGENTS.md` | 前端组件、导航规则、UI 模式 |
| `MEMO.md` | 技术备忘录、数据库设计、开发流程 |
| `CONVENTIONS.md` | 代码规范、命名约定、Git 规则 |
| `mcp-server/README.md` | MCP Server 文档、工具列表、客户端配置 |

---

## Quick Context

Bakery production management app. Core entities: **recipes** (dough), **preparations** (semi-finished), **materials** (unified registry), **mixing records**, **users**, **LLM users** (API Token auth).

### Key Distinctions
- `doughs` = final product formulas (e.g., "甜面团")
- `preparations` = shared intermediate items (e.g., "原味奶酥")
- `materials` = unified registry ALL items link to (dough/ingredient/preparation type)

### Test Accounts
| Username | Password | Role |
|---------|----------|------|
| test | test | staff |
| admin | admin123 | admin |

---

## Security Posture (2026-04-27)

### Fixed Issues ✅
- Error messages sanitized (no internal DB errors leaked)
- MASTER_KEY fail-fast (process exits if env var missing)
- IDOR fixed on DELETE /api/records (admin/manager only)
- Helmet.js security headers (CSP, X-Frame-Options, HSTS, etc.)
- CORS whitelist via ALLOWED_ORIGINS env var
- Rate limiting: 200/min global, 20/min on /api/auth/login
- Token in httpOnly SameSite=Lax cookie (NOT localStorage)
- Session invalidated on password change
- X-Forwarded-Proto check for Secure cookie flag
- Bearer Token authentication for MCP Server

### Current Auth Flow
```
Login → Server sets httpOnly cookie: authToken=xxx; SameSite=Lax
Frontend → All API calls use credentials: 'include'
Backend → getSession() checks both Authorization header AND cookie

#### Bearer Token Auth (for MCP Server)
MCP Server → sends Authorization: Bearer <token>
Backend → getSession() detects Bearer prefix → queries users.api_token column
Backend → returns session-like object with user data
```

---

## Database Schema (VERIFIED - 2026-04-27)

### materials (UNIFIED REGISTRY)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| type | ENUM('dough','ingredient','preparation') | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### doughs (合并 doughs + dough_recipes)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(255) | NOT NULL |
| material_id | INT | FK → materials.id |
| author | VARCHAR(100) | |
| current_version | VARCHAR(20) | e.g., v2026032701 |
| loss_rate | DECIMAL(5,2) | DEFAULT 1.00 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### dough_versions (was dough_recipe_versions)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| dough_id | INT | FK → doughs.id |
| version_number | VARCHAR(20) | NOT NULL |
| expected_temp | DECIMAL(4,1) | °C |
| author | VARCHAR(100) | |
| created_at | DATETIME | |

### dough_ingredients_current (was dough_recipe_ingredients_current)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT (顺序) |
| dough_id | INT | FK → doughs.id |
| material_id | INT | FK → materials.id (配料原料) |
| version | VARCHAR(20) | |
| stage | ENUM('preferment','base','late') | DEFAULT 'base' |
| percentage | DECIMAL(5,2) | |
| note | VARCHAR(1000) | |
| unit | VARCHAR(20) | |
| loss_rate | DECIMAL(5,2) | DEFAULT 1.00 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### dough_ingredients_archive (was dough_recipe_ingredients_archive)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| version_id | INT | FK → dough_versions.id |
| material_id | INT | FK → materials.id |
| stage | ENUM('preferment','base','late') | DEFAULT 'base' |
| percentage | DECIMAL(5,2) | |
| note | VARCHAR(1000) | |
| unit | VARCHAR(20) | |
| loss_rate | DECIMAL(5,2) | DEFAULT 1.00 |

### preparations (合并 preparations + preparation_recipes)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(255) | NOT NULL |
| material_id | INT | FK → materials.id |
| type | VARCHAR(50) | |
| notes | TEXT | |
| author | VARCHAR(100) | |
| current_version | VARCHAR(20) | |
| loss_rate | DECIMAL(5,2) | DEFAULT 1.00 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### preparation_versions
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| preparation_id | INT | FK → preparations.id |
| version_number | VARCHAR(20) | NOT NULL |
| author | VARCHAR(100) | |
| created_at | DATETIME | |

### preparation_ingredients_current
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| preparation_id | INT | FK → preparations.id |
| material_id | INT | FK → materials.id (配料原料) |
| version | VARCHAR(20) | |
| percentage | DECIMAL(5,2) | |
| stage | VARCHAR(20) | DEFAULT 'base' |
| note | VARCHAR(1000) | |
| unit | VARCHAR(20) | |
| loss_rate | DECIMAL(5,2) | DEFAULT 1.00 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### preparation_ingredients_archive
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| version_id | INT | FK → preparation_versions.id |
| material_id | INT | FK → materials.id |
| stage | VARCHAR(20) | DEFAULT 'base' |
| percentage | DECIMAL(5,2) | |
| note | VARCHAR(1000) | |
| unit | VARCHAR(20) | |
| loss_rate | DECIMAL(5,2) | DEFAULT 1.00 |
### ingredients (原材料)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| material_id | INT | FK → materials.id |
| type | ENUM('flour','lipids','sugar','salt','leavening','dairy','protein','water','additive','others') | DEFAULT 'others' |
| is_preparation | TINYINT(1) | DEFAULT 0 |
| default_unit | VARCHAR(20) | DEFAULT '%' |
| spec | VARCHAR(50) | |
| price | DECIMAL(10,2) | |
| manufacturer | VARCHAR(100) | |

### mixing_records (打面记录)
| Column | Type | Constraints |
|--------|------|-------------|
| batch_number | VARCHAR(10) | PK (format: YYYYMMDDNN) |
| dough_name | VARCHAR(100) | NOT NULL |
| dry_temp | DECIMAL(4,1) | °C |
| room_temp | DECIMAL(4,1) | °C |
| ice_ratio | DECIMAL(3,2) | |
| water_temp | DECIMAL(4,1) | °C |
| flour_amount | DECIMAL(6,2) | kg |
| water_amount | DECIMAL(6,2) | kg |
| dough_weight | DECIMAL(6,2) | kg |
| machine_speed | VARCHAR(50) | |
| gluten_level | DECIMAL(3,2) | |
| output_temp | DECIMAL(4,1) | °C |
| machine | VARCHAR(50) | |
| operator | VARCHAR(50) | |
| bulk_ferment_temp | DECIMAL(4,1) | °C |
| bulk_ferment_time | INT | minutes |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| timezone | VARCHAR(20) | |

### mixing_machines (打面机)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(50) | NOT NULL |

### users (用户)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| username | VARCHAR(50) | NOT NULL, UNIQUE |
| name | VARCHAR(100) | |
| password | VARCHAR(255) | NOT NULL (bcrypt) |
| role | VARCHAR(20) | DEFAULT 'staff' |
| can_view_recipes | TINYINT(1) | DEFAULT 0 |
| api_token | VARCHAR(64) | NULL |
| created_at | DATETIME | |
| timezone | VARCHAR(20) | |

### products (产品)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(255) | NOT NULL |
| dough_id | INT | FK → doughs.id |
| other_ingredients | JSON | |
| description | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### workflow_templates (工作流程模板)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| user_id | INT | FK → users.id (NULL = 通用模板) |
| steps | JSON | NOT NULL |
| is_active | TINYINT(1) | DEFAULT 1 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### workday_slots (工作日程槽)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| date | DATE | NOT NULL |
| user_id | INT | NOT NULL, FK → users.id |
| slot_index | INT | NOT NULL (0-287, 每5分钟一槽) |
| task_type | VARCHAR(50) | |
| product_id | INT | FK → products.id |
| description | VARCHAR(255) | |
| duration_slots | INT | DEFAULT 1 |
| is_temporary | TINYINT(1) | DEFAULT 0 |
| status | VARCHAR(20) | DEFAULT 'pending' |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| timezone | VARCHAR(20) | |

---

## Bug Fixes (2026-04-07)

### 1. preparation_ingredients_current schema 修复
- **问题**: 表用 `ingredient_name` (VARCHAR) 而不是 `material_id` (FK)
- **影响**: `/api/preparations` 查询报错 "Unknown column 'pic.material_id'"
- **修复**: 
  ```sql
  ALTER TABLE preparation_ingredients_current 
    ADD COLUMN material_id INT AFTER preparation_recipe_id;
  ALTER TABLE preparation_ingredients_current 
    ADD CONSTRAINT fk_prep_mat FOREIGN KEY (material_id) REFERENCES materials(id);
  ALTER TABLE preparation_ingredients_current DROP COLUMN ingredient_name;
  ```

### 2. dough_recipe_ingredients_archive 查询修复
- **问题**: 查询用 `ingredient_name` 列（不存在），尝试解密不存在的加密字段
- **影响**: 查看配方版本历史失败
- **修复**: 改用 `material_id` + JOIN `materials` 表获取材料名称

### 3. 版本号验证修复
- **问题**: `isNaN(parseInt(versionNumber))` 对 `v2026032607` 返回 true
- **影响**: `/api/recipes/:id/versions/:versionNumber` 始终返回 "无效的ID或版本号"
- **修复**: 移除 versionNumber 的 isNaN 检查

### 4. UI统一化 (2026-04-08)
- **问题**: 组件内嵌 `<style>` 块，hardcoded 颜色
- **修复**: 
  - 移除所有组件内嵌样式（RecipeListView, RecordListView, MixingView, UserManagementView, IngredientListView, MixingCalculator）
  - 全局 CSS 变量统一管理颜色
  - 添加 `.result-summary`, `.calculator-table`, `.calculator-table-header`, `.calculator-table-row` 等样式

### 5. 重复 topbar 修复 (2026-04-08)
- **问题**: RecordListView 嵌入 RecordDetailView 时出现双 header
- **修复**: RecordDetailView 添加 `showHeader` prop（默认 true），被嵌入时传 `showHeader={false}`
- **影响文件**: `RecordDetailView.jsx`, `RecordListView.jsx`

### 6. preparation_ingredients_current 列名修复
- **问题**: SELECT/INSERT 使用 `recipe_id` 列，但表实际用 `preparation_recipe_id`
- **影响**: 配方计算器无法正确保存半成品数据
- **修复**: 
  ```sql
  -- server.js line 451, 494: SELECT 改用 preparation_recipe_id
  -- server.js line 538, 632: INSERT 改用 preparation_recipe_id
  ```

### 7. 配方计算器 loss_rate 计算修复
- **问题**: 计算公式错误 `weight / (1 - lossRate/100)`
- **修复**: `weight / lossRate`（loss_rate 存为小数如 0.95）
- **显示**: 损耗率 = `(loss_rate || 1) * 100`%

### 8. Bearer Token 认证修复 (2026-04-27)
- **问题**: MCP Server 无法通过 API 认证，`requireApiToken` 未被调用
- **影响**: MCP Server 发送 Bearer Token 但返回 401
- **修复**: 修改 `getSession()` 支持 Bearer Token（异步查询 `users.api_token`）

---

## API Routes

### Auth
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /api/auth/login | - | Returns httpOnly cookie |
| POST | /api/auth/logout | - | Clears cookie |
| GET | /api/auth/me | Required | |
| PUT | /api/auth/profile | Required | Invalidates sessions if password changed |

### Dough (doughs)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/dough | Required | List all |
| GET | /api/dough/:id | Required | Full recipe with ingredients |
| GET | /api/dough/by-material/:materialId | Required | Get by material_id |
| POST | /api/dough | Admin | |
| PUT | /api/dough/:id | Admin | |
| DELETE | /api/dough/:id | Admin | |
| GET | /api/dough/:id/versions | Required | |
| GET | /api/dough/:id/versions/:versionNumber | Required | |
| POST | /api/dough/:id/restore/:version | Admin | |

### Preparations (preparations)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/preparations | Required | List all preparation recipes with ingredients |
| GET | /api/preparations/:id | Required | Get preparation recipe details |
| GET | /api/preparations/by-material/:materialId | Required | Get by material_id |
| POST | /api/preparations | Admin | Create preparation (auto-creates materials) |
| PUT | /api/preparations/:id | Admin | Update preparation |
| DELETE | /api/preparations/:id | Admin | Delete preparation |
| GET | /api/preparations/:id/versions | Required | |
| GET | /api/preparations/:id/versions/:version | Required | |
| POST | /api/preparations/:id/restore/:version | Admin | |
| GET | /api/dough-types | - | List dough types |
| GET | /api/preparations-types | - | List preparation types |

### Materials
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/materials | Required | |
| POST | /api/materials | Admin | |
| PUT | /api/materials/:id | Admin | |
| DELETE | /api/materials/:id | Admin | |

### Mixing Records
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/records | Required | |
| POST | /api/records | Admin/Manager | |
| PUT | /api/records/:batchNumber | Admin/Manager | |
| DELETE | /api/records/:batchNumber | Admin/Manager | |

---

## Version Naming

Format: `v{YYYYMMDD}{NN}`  
Example: `v2026032701` (2026-03-27 first version)

---

## Dev Commands

```bash
cd ~/Docker/bakery

# 首次部署或代码修改后
docker compose build && docker compose up -d

# 仅重启
docker compose restart

# 查看日志
docker compose logs backend -f
```

---

## Database Setup & Migrations

所有数据库设置通过 `backend/setup-*.js` 脚本执行：

| Script | Purpose |
|--------|---------|
| `setup-auth.js` | 创建 users 表、roles 表、admin 用户 |
| `setup-ingredients.js` | 创建 ingredients 表、插入常用原料 |
| `setup-api-token.js` | 添加 api_token 列、创建 LLM 用户 |

### 执行迁移：
```bash
cd backend
node setup-api-token.js  # 添加 api_token 支持 + 创建 LLM 用户
```

### LLM 用户（用于 MCP Server）
| Field | Value |
|-------|-------|
| username | llm |
| role | manager |
| can_view_recipes | 1 |
| api_token | `<your-llm-token>` |

> Token 由 `setup-api-token.js` 自动生成并输出到控制台

---

## MCP Server

Model Context Protocol server，供 LLM 通过标准协议查询和操作数据。位于 `mcp-server/`。

### 构建
```bash
cd mcp-server
npm install
npm run build
```

### 环境变量
| Variable | Description | Required |
|----------|-------------|----------|
| BAKERY_API_TOKEN | LLM 用户的 API Token | Yes |
| BAKERY_API_URL | Backend URL (default: http://localhost:8080) | No |

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

### 客户端配置
配置示例在 `mcp-server/examples/` 目录，支持：
- Claude Desktop
- Cursor
- VS Code
- OpenCode

---

## Style Guidelines (2026-04-08)

### CSS 变量（index.css）
```css
:root {
  --color-bg: #FBF7F4;
  --color-primary: #8B5A2B;
  --color-primary-light: #A67C52;
  --color-primary-dark: #6B4423;
  --color-secondary: #D4A574;
  --color-accent: #2D5016;
  --color-text: #1F1410;
  --color-text-muted: #8B7355;
  --color-border: #E8DDD4;
  --color-surface: #FFFFFF;
  --color-surface-hover: #FDF9F6;
  --color-success: #16A34A;
  --color-danger: #DC2626;
  --color-warning: #EA580C;
  --color-info: #2563EB;
  --shadow-hover: 0 6px 16px rgba(139, 90, 43, 0.12);
  --shadow-active: 0 2px 6px rgba(139, 90, 43, 0.1);
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  --transition-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 通用样式类
- `.menu-grid`, `.menu-item`, `.menu-icon`
- `.recipe-grid`, `.recipe-card`
- `.timeline-container`, `.timeline-item`, `.timeline-dot`
- `.user-list`, `.user-item`, `.user-role-badge`
- `.ingredient-dropdown`, `.ingredient-dropdown-item`
- `.result-summary`, `.calculator-table`, `.calculator-table-header`, `.calculator-table-row`

### 避免 Hardcoded 颜色
- ❌ `#8E8E93`, `#ff3b30`, `#DC2626` → ✅ `var(--color-text-muted)`, `var(--color-danger)`
- ❌ `#f5f5f5` → ✅ `var(--color-bg)`

---

## Anti-Patterns (NEVER DO)

- ❌ `as any`, `@ts-ignore`, `@ts-expect-error`
- ❌ Empty catch blocks `catch(e) {}`
- ❌ `error.message` in API responses
- ❌ Token in localStorage
- ❌ String concatenation in SQL
- ❌ Validate version numbers with `isNaN(parseInt())`
- ❌ 内嵌 `<style>` 块（使用全局 CSS 变量）
- ❌ 密码/密钥写入代码或 md 文件