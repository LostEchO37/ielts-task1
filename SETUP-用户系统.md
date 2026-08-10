# 用户系统 · 从零部署（约 15 分钟）

> ⚠️ **Render 要绑信用卡**。推荐用 **Koyeb**（免费、通常不用卡）→ 详见 **`SETUP-Koyeb.md`**  
> ⚠️ **不要用 db4free.net** — 域名已失效。

---

## 路线概览

```
Aiven 免费 MySQL  →  Koyeb 部署 server/  →  site-config.js 填 apiBase
```

---

## 第 1 步：Aiven MySQL（你应该已完成）

1. https://aiven.io/free-mysql-database → GitHub 登录  
2. Create service → MySQL → **Free** → 等 **Running**  
3. 记下 Host、Port、User、Password、Database  

Koyeb / Render 都要设 **`MYSQL_SSL=1`**。

---

## 第 2 步：Koyeb 部署 API

**完整步骤见 → [`SETUP-Koyeb.md`](./SETUP-Koyeb.md)**

摘要：

1. https://www.koyeb.com/ → GitHub 登录  
2. Create Web Service → 仓库 `ielts-task1`  
3. **Root directory = `server`**  
4. Instance = **Free**  
5. 填 MySQL 6 项 + `ADMIN_STATS_TOKEN` + `JWT_SECRET`  
6. Deploy → 记下 `https://xxx.koyeb.app`  
7. 打开 `/health` 确认 `ok: true`

---

## 第 3 步：前端

`js/site-config.js`：

```javascript
apiBase: "https://你的服务.koyeb.app"
```

Push → GitHub Pages 自动更新。

---

## 常见问题

**`/health` db error** → MySQL 变量错、或忘了 `MYSQL_SSL=1`、或 Aiven 未 Running  

**第一次请求很慢** → Koyeb / Aiven 免费档冷启动，等 30 秒  

**管理页口令** → 环境变量里的 `ADMIN_STATS_TOKEN`
