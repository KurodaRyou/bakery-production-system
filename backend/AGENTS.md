# Backend - AI Agent Context

**Parent:** ../AGENTS.md  
**Location:** backend/ (modular structure)  
**Last Updated:** 2026-04-27

---

## 📚 相关文档

| 文件 | 内容 |
|------|------|
| `../AGENTS.md` | 项目总览、数据库 Schema、API 路由 |
| `./AGENTS.md` | 本文件 - 后端架构、认证流程 |
| `../MEMO.md` | 技术备忘录、数据库设计 |
| `../CONVENTIONS.md` | 代码规范 |

---

## Architecture

Modular Express backend:
- `server.js` - Bootstrap (~50 lines)
- `config/db.js` - MySQL pool
- `config/crypto.js` - MASTER_KEY, encrypt/decrypt
- `config/versioning.js` - Version utilities
- `middleware/session.js` - Session management
- `middleware/auth.js` - Auth middleware (getSession, requireAuth, requireAdmin, requireApiToken)
- `middleware/rateLimit.js` - Rate limiters
- `routes/` - Route modules (auth, records, preparations, recipes, materials, lookups, users, workClock, products)

---

## Auth Flow

```
1. POST /api/auth/login
   - Check login attempts (5 max / 15 min lockout)
   - bcrypt.compare password
   - Generate 32-byte random token
   - Store in sessions Map
   - Set httpOnly cookie: authToken=xxx; SameSite=Lax
   - Return { token, username, name, role, canViewRecipes }

2. All API calls
   - getSession() extracts token from Authorization header OR cookie
   - If Authorization: Bearer <token> → queries users.api_token column (async)
   - If Cookie: authToken=xxx → looks up in-memory sessions Map
   - requireAuth() / requireAdmin() check session

3. POST /api/auth/logout
   - Delete from sessions Map
   - Clear cookie

4. PUT /api/auth/profile (password change)
   - Invalidate ALL sessions for that user
```

---

## Key Functions

### Session Management
```javascript
sessions = new Map()  // token → { userId, username, name, role, canViewRecipes, createdAt }
SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000  // 7 days
```

### getSession(req) - NOW ASYNC
Checks `Authorization` header first, then `req.cookies?.authToken`
- **Bearer Token**: Detects `Bearer` prefix → queries `users.api_token` column (async)
- **Cookie**: Looks up in-memory `sessions` Map (sync fallback)

### requireAuth(req, res, next)
Calls `getSession()` and sets `req.session` if valid, returns 401 otherwise

### requireAdmin(req, res, next)
Same as requireAuth but checks `session.role === 'admin'`

### requireApiToken(req, res, next)
Middleware for Bearer Token only auth (not used in current routes, kept for reference)

### generateVersionNumber(connection, recipeId)
Creates `v{YYYYMMDD}{NN}` format versions, auto-increments NN for same day

### getTimezone()
Returns `Intl.DateTimeFormat().resolvedOptions().timeZone`

---

## Critical Security Notes

### Cookie Settings
```javascript
res.cookie('authToken', token, {
    httpOnly: true,
    secure: isHttps,  // Based on X-Forwarded-Proto header
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_MS
});
```

### Error Handling
ALL catch blocks now:
1. `console.error('Server error:', error)` - log internally
2. `res.status(500).json({ error: '服务器内部错误' })` - generic message

NEVER return `error.message` to client.

### Rate Limiting
```javascript
globalLimiter:  200 requests / 15 minutes
authLimiter:     20 requests / 15 minutes (on /api/auth/login)
```

---

## Database Conventions

### Foreign Key Pattern
All ingredient tables use `material_id` FK to `materials.id`:
- `dough_recipe_ingredients_current.material_id` → `materials.id`
- `dough_recipe_ingredients_archive.material_id` → `materials.id`
- `preparation_ingredients_current.material_id` → `materials.id`
- `preparation_ingredients_archive.material_id` → `materials.id`

### Join Pattern for Ingredients
```sql
SELECT a.*, m.name as material_name, m.type as material_type
FROM some_ingredients_current a
LEFT JOIN materials m ON a.material_id = m.id
WHERE ...
```

### Version Archiving Pattern
When updating a recipe:
1. Copy current ingredients to `*_archive` table with version_id
2. Insert new ingredients to `*_current` table
3. Update `current_version` on main recipe table

---

## LLM User (API Token Auth)

| Field | Value |
|-------|-------|
| username | llm |
| role | manager |
| can_view_recipes | 1 |
| api_token | `<your-llm-token>` |

### 创建 LLM 用户：
```bash
node setup-api-token.js
```

脚本会：
1. 添加 `api_token` 列到 `users` 表（如不存在）
2. 创建 LLM 用户并生成 Token
3. 输出 Token 到控制台

### Bearer Token 认证流程：
```
客户端 → Authorization: Bearer <token>
getSession() → 检测 Bearer 前缀
getSession() → SELECT * FROM users WHERE api_token = ?
getSession() → 返回 session-like 对象
requireAuth() → 验证 session，调用 next()
```

---

## Bug History (2026-04-27)

### preparation_ingredients_current schema bug
- API query used `material_id` but table had `ingredient_name`
- Fixed via ALTER TABLE migration (table was empty)

### dough_recipe_ingredients_archive query bug
- Code tried to SELECT `ingredient_name` (doesn't exist)
- Fixed to SELECT `material_id` + JOIN materials table

### Version number validation bug
- `isNaN(parseInt(versionNumber))` rejected valid versions like `v2026032607`
- Fixed by removing versionNumber isNaN check

### Bearer Token authentication bug (2026-04-27)
- `requireApiToken` middleware existed but was never called
- All routes used `requireAuth` which only checked in-memory sessions
- **Fixed**: Made `getSession()` async to support Bearer Token via `users.api_token`

---

## Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| DB_HOST | Yes | TiDB Cloud host |
| DB_PORT | No | Default 4000 |
| DB_USER | Yes | |
| DB_PASSWORD | Yes | |
| DB_NAME | No | Default bakery |
| BAKERY_MASTER_KEY | **YES** | 64-char hex. Process exits if missing! |
| ALLOWED_ORIGINS | No | Comma-separated CORS whitelist |
| NODE_ENV | No | If=production, Secure cookie flag enabled |

---

## Route File Reference

| Lines | Route Group |
|-------|-------------|
| 196-243 | Auth (login, logout, me) |
| 245-398 | Records CRUD |
| 399-650 | Preparations CRUD |
| 651-790 | Ingredients + Materials CRUD |
| 791-1177 | Recipes (dough) CRUD + versions |
| 1178-1230 | Users + Profile |
| 1232-1405 | Work Clock API (mostly stubs) |
| 1406+ | Products API (stub) |

---

## Setup Scripts

| Script | Purpose |
|--------|---------|
| `setup-auth.js` | Create users table, roles table, admin user |
| `setup-ingredients.js` | Create ingredients table, insert common ingredients |
| `setup-api-token.js` | Add api_token column, create LLM user |

### Run migrations:
```bash
node setup-api-token.js
```

---

## Missing/Broken Features

1. **Redis for sessions** - Current in-memory Map fails with multiple instances
2. **HTTPS enforcement** - Cookie Secure flag depends on X-Forwarded-Proto
3. **CORS in production** - Need to set ALLOWED_ORIGINS env var
4. **Input length validation** - No maxLength on text inputs