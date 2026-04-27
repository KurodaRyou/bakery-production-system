# Bakery App

面包店管理 Web 应用，管理配方、打面记录、原材料和人员。

> **注意**：测试/调试时默认使用 test 账号，禁止使用 admin 账号。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + React Router |
| 后端 | Node.js + Express |
| 数据库 | TiDB Cloud (MySQL 兼容) |
| 部署 | Docker Compose |
| 内网穿透 | Cloudflare Tunnel |

## 目录结构

```
~/Docker/bakery/
├── docker-compose.yml    # Docker 容器编排
├── .env                  # 环境变量
├── backup.py             # 数据库备份脚本
├── backend/              # 后端 Node.js
│   ├── Dockerfile
│   └── server.js
└── bakery-web/          # 前端 React
    ├── Dockerfile
    ├── nginx.conf
    └── vite.config.js
```

## 数据库结构

### materials (统一编码表 - 核心)
所有物料（原材料/半成品/面团/配方）统一通过 materials 表管理。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR | 名称 |
| type | ENUM | dough/ingredient/preparation |
| created_at | DATETIME | 创建时间 |

### dough_recipes (配方主表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR | 配方名称 |
| material_id | INT | 关联 materials.id |
| author | VARCHAR | 创建人 |
| current_version | INT | 当前版本号 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| timezone | VARCHAR | 时区 |

### dough_recipe_versions (配方版本)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| recipe_id | INT | 关联 dough_recipes.id |
| version_number | INT | 版本号 |
| expected_temp | DECIMAL | 预期出缸温度 |
| created_at | DATETIME | 创建时间 |
| timezone | VARCHAR | 时区 |

### dough_recipe_ingredients_current (当前版本配方原料)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键（AUTO_INCREMENT，决定顺序） |
| recipe_id | INT | 关联 dough_recipes.id |
| version | INT | 版本号 |
| material_id | INT | 关联 materials.id |
| stage | VARCHAR | 阶段（pre-ferment/main dough/post-add） |
| percentage | DECIMAL | 百分比 |
| note | VARCHAR | 备注 |
| unit | VARCHAR | 单位 |
| loss_rate | DECIMAL | 损耗率（%），默认 1.00 |

### dough_recipe_ingredients_archive (历史版本配方原料)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| version_id | INT | 关联 dough_recipe_versions.id |
| material_id | INT | 关联 materials.id |
| stage | VARCHAR | 阶段 |
| percentage | DECIMAL | 百分比 |
| note | VARCHAR | 备注 |
| unit | VARCHAR | 单位 |
| loss_rate | DECIMAL | 损耗率（%） |

### preparation_recipes (半成品主表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR | 半成品名称 |
| material_id | INT | 关联 materials.id |
| author | VARCHAR | 创建人 |
| current_version | INT | 当前版本号 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| timezone | VARCHAR | 时区 |

### preparation_versions (半成品版本)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| recipe_id | INT | 关联 preparation_recipes.id |
| version_number | INT | 版本号 |
| created_at | DATETIME | 创建时间 |
| timezone | VARCHAR | 时区 |

### preparation_ingredients_current (当前版本半成品原料)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键（AUTO_INCREMENT，决定顺序） |
| recipe_id | INT | 关联 preparation_recipes.id |
| version | INT | 版本号 |
| material_id | INT | 关联 materials.id |
| stage | VARCHAR | 阶段 |
| percentage | DECIMAL | 百分比 |
| note | VARCHAR | 备注 |
| unit | VARCHAR | 单位 |
| loss_rate | DECIMAL | 损耗率（%），默认 1.00 |

### preparation_ingredients_archive (历史版本半成品原料)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| version_id | INT | 关联 preparation_versions.id |
| material_id | INT | 关联 materials.id |
| stage | VARCHAR | 阶段 |
| percentage | DECIMAL | 百分比 |
| note | VARCHAR | 备注 |
| unit | VARCHAR | 单位 |
| loss_rate | DECIMAL | 损耗率（%） |

## 待开发表

### 工作时钟 (work_clock)
```
shifts 表
├── id, name, start_slot, end_slot, color, is_active

products 表
├── id, name, material_id, description, is_active

work_tasks 表
├── id, user_id, shift_id, task_type, material_id
├── slot_index (0-287), duration_slots, work_date, notes, created_at
```

### 监控 (monitoring)
```
devices 表
├── id, name, type, location, battery, last_seen, is_active

temperature_logs 表
├── id, device_id, temperature, humidity, recorded_at

alerts 表
├── id, device_id, alert_type, message, acknowledged, created_at
```

## API 路由

### 认证
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 当前用户

### 配方 (dough_recipes)
- `GET /api/recipes` - 列表
- `GET /api/recipes/:id` - 详情
- `POST /api/recipes` - 新增（需admin）
- `PUT /api/recipes/:id` - 更新（需admin）
- `DELETE /api/recipes/:id` - 删除（需admin）
- `POST /api/recipes/:id/restore-version` - 恢复版本

### 半成品 (preparation_recipes)
- `GET /api/preparations` - 列表
- `GET /api/preparations/:id` - 详情
- `POST /api/preparations` - 新增（需admin）
- `PUT /api/preparations/:id` - 更新（需admin）
- `DELETE /api/preparations/:id` - 删除（需admin）
- `POST /api/preparations/:id/restore-version` - 恢复版本

### 统一编码 (materials)
- `GET /api/materials` - 列表
- `POST /api/materials` - 新增
- `PUT /api/materials/:id` - 更新
- `DELETE /api/materials/:id` - 删除

### 原材料/面团
- `GET /api/ingredients` - 原材料列表
- `POST /api/ingredients` - 新增原材料（需admin）
- `GET /api/doughs` - 面团列表
- `POST /api/doughs` - 新增面团（需admin）

### 其他
- `GET /api/dough-types` - 面团种类
- `GET /api/records` - 打面记录

## 快速开始

### 本地开发 (Docker)

```bash
cd ~/Docker/bakery

# 构建并启动
docker compose up -d

# 重建（修改代码后）
docker compose build
docker compose up -d
```

### 访问
- 前端: http://localhost:5173
- 后端: http://localhost:8080

### 测试账号
- test / test

## 数据库备份

```bash
# 备份
python backup.py backup

# 导出 Excel
python backup.py export

# 查看可用表
python backup.py tables

# 查看备份列表
python backup.py list

# 恢复
python backup.py restore <备份文件>
```

## Cloudflare Tunnel (远程访问)

Tunnel 已在 Docker 中运行，只需配置 token：

```bash
# 在 .env 中设置 token
CLOUDFLARE_TUNNEL_TOKEN=your-token

# 启动 tunnel
docker compose --profile tunnel up -d
```

获取 token: https://one.dash.cloudflare.com → Networks → Tunnels

## 部署到 N1 盒子

```bash
# 1. 在 Mac 上打包镜像
docker save bakery-backend bakery-frontend -o bakery-images.tar

# 2. 传到 N1
scp bakery-images.tar root@<N1的IP>:/root/

# 3. 在 N1 上加载镜像
docker load -i bakery-images.tar

# 4. 启动
cd ~/Docker/bakery
docker compose up -d
```

## 相关文档

- `MEMO.md` - 技术备忘录
- `FEATURE_ROADMAP.md` - 功能路线图