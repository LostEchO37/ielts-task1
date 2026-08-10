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

前端在 `js/site-config.js` 填写 `apiBase` 后，会自动启用云端账号；未配置时退化为本地昵称模式。

## 1. 免费 MySQL

任选其一（注册后创建数据库，执行 `schema.sql`）：

| 服务 | 说明 |
|------|------|
| [db4free.net](https://www.db4free.net/) | 免费 MySQL，适合小流量 |
| [Aiven MySQL free](https://aiven.io/) | 有免费套餐 |

```bash
mysql -h YOUR_HOST -u YOUR_USER -p YOUR_DATABASE < schema.sql
```

## 2. 部署 API 到 Render（免费）

1. 推送代码到 GitHub  
2. [Render Dashboard](https://dashboard.render.com/) → New → Blueprint 或 Web Service  
3. 连接仓库，`Root Directory` = **`server`**  
4. 环境变量（参考 `.env.example`）：
   - `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
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
- **MySQL 免费库**：db4free 等，注意容量与休眠策略  
- **不使用 Netlify**，不消耗 Netlify credits
