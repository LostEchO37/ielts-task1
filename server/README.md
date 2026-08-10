# 访问统计 & 用户同步 API（MySQL）

GitHub Pages 只能托管静态前端；本目录提供 **Node.js + MySQL** 后端，免费部署方案如下。

## 架构

```
浏览器 (GitHub Pages)  --POST /api/auth/*-->  Render API  -->  MySQL
                      --PUT  /api/auth/data-->
                      --POST /api/track-->   Render API  -->  MySQL
管理页 stats.html      --GET  /api/stats-->  Render API  -->  MySQL
```

## 用户系统

| 接口 | 说明 |
|------|------|
| `POST /api/auth/register` | 注册（用户名 + 密码） |
| `POST /api/auth/login` | 登录，返回 JWT token |
| `GET /api/auth/data` | 拉取用户学习记录（需 Bearer token） |
| `PUT /api/auth/data` | 保存学习记录（勋章、错题本、练习历史等） |
| `POST /api/feedback` | 用户提交评价 |
| `GET /api/feedback/wall` | 公开精选评价墙 |
| `GET /api/feedback/admin` | 管理：查看待审/已上墙（需 Token） |
| `PATCH /api/feedback/:id` | 管理：上墙 / 下架 / 隐藏 |

前端在 `js/site-config.js` 填写 `apiBase` 后，会自动启用云端账号；未配置时退化为本地昵称模式。

## 1. 免费 MySQL

任选其一（注册后创建数据库，执行 `schema.sql`）：

| 服务 | 说明 |
|------|------|
| [Aiven MySQL free](https://aiven.io/free-mysql-database) | 免费托管 MySQL，1GB，需设 `MYSQL_SSL=1` |

> ⚠️ 勿用 db4free.net — 域名已失效。

```bash
mysql -h YOUR_HOST -P YOUR_PORT -u YOUR_USER -p YOUR_DATABASE < schema.sql
```

## 2. 部署 API（推荐 Zeabur，不用绑卡）

**逐步教程 → [`SETUP-Zeabur.md`](../SETUP-Zeabur.md)**

Koyeb 新用户已需付费；Render 需绑卡。

### Zeabur 摘要

1. https://zeabur.com/ → GitHub 登录  
2. Create Project → Add Service → GitHub → `ielts-task1`  
3. Settings → **Root Directory = `server`**  
4. 环境变量：`MYSQL_*`、`MYSQL_SSL=1`、`ADMIN_STATS_TOKEN`、`JWT_SECRET`  
5. Generate Domain → 验证 `/health`

## 2b. 部署 API 到 Render（需绑卡，可选）

1. 推送代码到 GitHub  
2. [Render Dashboard](https://dashboard.render.com/) → New → Blueprint 或 Web Service  
3. 连接仓库，`Root Directory` = **`server`**  
4. 环境变量（参考 `.env.example`）：
   - `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT`
   - `MYSQL_SSL` — 连 Aiven 填 `1`
   - `ADMIN_STATS_TOKEN` — 管理口令（stats.html 使用）
   - `JWT_SECRET` — 用户登录 token 签名密钥
   - `CORS_ORIGINS` — `https://lostecho37.github.io,http://localhost:8765`
5. 部署完成后得到 URL，如 `https://ielts-analytics-api.onrender.com`

验证：`curl https://YOUR-API.onrender.com/health`

## 3. 配置前端

编辑仓库根目录 **`js/site-config.js`**：

```javascript
apiBase: "https://ielts-analytics-api.onrender.com"
```

推送到 GitHub 后 Pages 自动更新。

## 4. 查看统计

打开：`https://lostecho37.github.io/ielts-task1/stats.html`  
输入 `ADMIN_STATS_TOKEN` 口令 → 加载数据。

## 5. 评价反馈上墙

打开：`https://lostecho37.github.io/ielts-task1/feedback-admin.html`  
同一口令 → 待审核 → 点上墙。详见 **`SETUP-反馈模块.md`**。

## 采集的事件

| event | 说明 |
|-------|------|
| `pageview` | 页面访问 |
| `quiz_complete` | 完成一轮我会了练习 |
| `sim_review` | 提交综合模拟批改 |

## 本地联调

```bash
cd server
cp .env.example .env   # 填 MySQL 信息
npm install
npm start              # http://localhost:3000
```

`js/site-config.js` 设 `apiBase: "http://localhost:3000"`，另开终端：

```bash
python3 -m http.server 8765
```

## 费用说明

- **GitHub Pages**：免费  
- **Render 免费档**：Web Service 有休眠，首次请求可能慢几秒  
- **MySQL 免费库**：Aiven 免费档，注意休眠策略  
- **不使用 Netlify**，不消耗 Netlify credits
