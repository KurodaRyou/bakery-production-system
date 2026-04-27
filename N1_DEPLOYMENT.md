# Bakery App 部署计划

## 目标平台

**N1 盒子**（Amlogic S905X/M, ARM 架构，运行 Armbian）

---

## 部署架构

```
                    ┌─────────────────────────────────────┐
                    │            N1 盒子 (Armbian)          │
                    │                                     │
┌─────────┐          │  ┌──────────┐    ┌──────────────┐  │
│  客户端  │──HTTP(S)──▶│  Nginx   │───▶│  React App   │  │
│(浏览器)  │          │  (:80/443)    │  (静态文件)   │  │
└─────────┘          │              └──────────────┘  │
                    │                    ▲          │
                    │              ┌────┴────┐       │
                    │              │ proxy   │       │
                    │              │ /api    │       │
                    │              └────┬────┘       │
                    │                   │            │
                    │  ┌──────────────┴──▼─────────┐  │
                    │  │     Node.js Backend      │  │
                    │  │       (:8080)            │  │
                    │  └──────────────┬───────────┘  │
                    │                 │              │
                    └─────────────────┼──────────────┘
                                      │
                                      │ HTTPS
                                      ▼
                          ┌─────────────────────┐
                          │    TiDB Cloud       │
                          │   (MySQL 兼容)      │
                          │  gateway01.eu-      │
                          │  central-1.prod      │
                          └─────────────────────┘
```

---

## 部署方式

**Docker Compose** - 两个服务：
1. `backend` - Node.js Express API
2. `frontend` - Nginx 托管静态文件 + 反向代理

---

## 文件清单

```
BakeryApp/
├── docker-compose.yml      # 容器编排
├── Dockerfile.backend       # 后端镜像
├── Dockerfile.frontend     # 前端镜像
├── nginx.conf              # Nginx 配置
├── .dockerignore           # Docker 忽略文件
└── .env                    # 环境变量（不提交 git）
```

---

## 详细配置

### 1. docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    container_name: bakery-backend
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    env_file:
      - ./backend/.env
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/machines"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./bakery-web
      dockerfile: Dockerfile.frontend
    container_name: bakery-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro  # 可选：SSL 证书
```

### 2. Dockerfile.backend

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server.js ./
COPY setup-auth.js ./
COPY setup-ingredients.js ./

EXPOSE 8080

CMD ["node", "server.js"]
```

### 3. Dockerfile.frontend

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

### 4. nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # 前端路由支持（SPA）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://bakery-backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. .dockerignore (backend)

```
node_modules
.env
*.log
.DS_Store
```

### 6. .dockerignore (frontend)

```
node_modules
dist
.DS_Store
*.log
```

---

## 部署步骤

### 1. N1 盒子准备

```bash
# 安装 Docker 和 Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose

# 启用 Docker 服务
sudo systemctl enable docker
sudo systemctl start docker

# 添加当前用户到 docker 组（免 sudo）
sudo usermod -aG docker $USER
newgrp docker
```

### 2. 上传代码

```bash
# 方式一：git clone
git clone <your-repo-url> /opt/bakery-app
cd /opt/bakery-app

# 方式二：scp 上传
scp -r ./BakeryApp user@n1-box:/opt/bakery-app
```

### 3. 配置环境变量

```bash
cd /opt/bakery-app/backend

# 创建 .env 文件
cat > .env << EOF
DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_tidb_user
DB_PASSWORD=your_tidb_password
DB_NAME=bakery

BAKERY_MASTER_KEY=generate_a_64_char_hex_key

DEFAULT_ADMIN_PASSWORD=your_secure_password
PORT=8080
EOF
```

### 4. 构建并启动

```bash
cd /opt/bakery-app

# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

### 5. 初始化数据库（首次）

```bash
# 初始化用户和原材料
docker exec bakery-backend node setup-auth.js
docker exec bakery-backend node setup-ingredients.js
```

### 6. 验证部署

```bash
# 检查后端 API
curl http://localhost:8080/api/machines

# 检查前端
curl http://localhost/

# 查看容器状态
docker-compose ps
```

---

## SSL/HTTPS 配置（可选）

### 使用 Let's Encrypt

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书（需要域名解析已配置）
sudo certbot --nginx -d yourdomain.com

# 证书会自动续期
```

### 自签名证书（仅内网）

```bash
# 生成自签名证书
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/selfsigned.key \
  -out ssl/selfsigned.crt
```

---

## 运维命令

```bash
# 重启服务
docker-compose restart

# 更新代码后重部署
git pull
docker-compose build
docker-compose up -d

# 查看日志
docker-compose logs -f

# 进入容器调试
docker exec -it bakery-backend sh
docker exec -it bakery-frontend sh

# 备份数据库（TiDB Cloud 控制台或 mysqldump）
```

---

## 故障排查

### 1. 后端无法连接数据库
```bash
# 检查 .env 配置
docker exec bakery-backend env | grep DB_

# 测试连接
docker exec bakery-backend node -e "require('dotenv').config(); console.log(process.env.DB_HOST)"
```

### 2. 前端无法访问 API
```bash
# 检查 Nginx 日志
docker-compose logs frontend

# 检查代理是否正常
curl -I http://localhost/api/machines
```

### 3. 容器不断重启
```bash
# 查看详细错误
docker-compose logs backend

# 检查端口占用
netstat -tlnp | grep 8080
```

---

## 数据备份

### TiDB Cloud（推荐）

- 使用 TiDB Cloud 提供的自动备份
- 登录 TiDB Cloud Console > 您的 Cluster > Backup & Restore

### 本地备份脚本

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD bakery > backup_$DATE.sql
```

---

## 性能优化

### Nginx 缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Node.js 生产模式

- Express 已内置性能优化
- 可添加 `process.env.NODE_ENV=production`

---

## 目录结构（部署后）

```
/opt/bakery-app/
├── backend/
│   ├── .env              # 环境变量（手动创建）
│   ├── Dockerfile.backend
│   ├── server.js
│   └── ...
├── bakery-web/
│   ├── Dockerfile.frontend
│   ├── nginx.conf        # 已移到根目录
│   ├── dist/             # 构建产物
│   └── ...
├── docker-compose.yml
└── nginx.conf
```

---

## 版本信息

| 日期 | 更新内容 |
|------|----------|
| 2026-03-26 | 初始部署计划 |
