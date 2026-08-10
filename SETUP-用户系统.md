# 用户系统 · 从零部署（约 15 分钟）

代码已经写好，**你不需要写任何代码**。按下面步骤注册 **Aiven 免费 MySQL** + **Render** 即可。

> ⚠️ **不要用 db4free.net** — 该域名已失效并被劫持，打开会看到无关内容。

---

## 第 1 步：免费 MySQL（Aiven）

1. 打开 https://aiven.io/free-mysql-database  
2. 点 **Get started** / **Sign up** → 用 **GitHub** 或 **Google** 登录（无需信用卡）  
3. 进入控制台 https://console.aiven.io/  
4. **Create service** → 选 **MySQL** → 选 **Free plan**  
5. 选一个离用户近的区域（如 **Asia-Pacific** 或 **Europe**）→ **Create service**  
6. 等 2–3 分钟，状态变为 **Running**  
7. 点进该服务 → 左侧 **Overview** → 找到 **Connection information**  
8. 记下下面 5 项（Aiven 的端口**不是** 3306，以控制台显示的为准）：

| 变量 | Aiven 里叫什么 |
|------|----------------|
| `MYSQL_HOST` | Host |
| `MYSQL_PORT` | Port（常见是 1xxxx） |
| `MYSQL_USER` | User（通常是 `avnadmin`） |
| `MYSQL_PASSWORD` | Password |
| `MYSQL_DATABASE` | Database name（通常是 `defaultdb`） |

9. 另记：Render 连 Aiven **必须开 SSL**，后面要设 `MYSQL_SSL=1`

**不用手动建表** — 后端启动时会自动执行 `schema.sql`。

---

## 第 2 步：Render 部署后端

1. 打开 https://dashboard.render.com/ 用 GitHub 登录  
2. **New +** → **Blueprint**  
3. 连接仓库 `LostEchO37/ielts-task1`（若看不到，先 Push 代码到 GitHub）  
4. Render 会读取根目录的 `render.yaml`，创建 Web Service  
5. 在 **Environment** 里填上一步的 MySQL 信息，再加：

| 变量 | 填什么 |
|------|--------|
| `MYSQL_HOST` | Aiven Host |
| `MYSQL_PORT` | Aiven Port |
| `MYSQL_USER` | Aiven User |
| `MYSQL_PASSWORD` | Aiven Password |
| `MYSQL_DATABASE` | Aiven Database |
| `MYSQL_SSL` | `1`（连 Aiven 必填） |
| `ADMIN_STATS_TOKEN` | 随便一长串密码，例如 `ielts-stats-2026-你的生日` |
| `JWT_SECRET` | 同上即可，或另填一串 |
| `CORS_ORIGINS` | 已有默认值，确认含 `https://lostecho37.github.io` |

6. 点 **Deploy**，等 2–5 分钟  
7. 部署成功后，记下服务 URL，形如：  
   **`https://ielts-analytics-api.onrender.com`**

验证：浏览器打开 `https://你的URL/health`，应看到 `{"ok":true,"db":"connected"}`

---

## 第 3 步：前端填 API 地址

编辑 `js/site-config.js`：

```javascript
apiBase: "https://ielts-analytics-api.onrender.com"
```

（换成你 Render 上的真实 URL）

然后 Push 到 GitHub，GitHub Pages 会自动更新。

---

## 完成

打开网站 → 注册用户名 + 密码 → 换设备用同一账号登录即可同步进度。  
评价反馈：点 **馈** 提交 → 打开 `feedback-admin.html` 审核上墙。

---

## 常见问题

**`/health` 显示 db error**  
→ Render 里 MySQL 变量填错；或忘了设 `MYSQL_SSL=1`；或 Aiven 服务还在启动中

**注册时「服务器连接失败」**  
→ `site-config.js` 的 `apiBase` 没填或填错；或 Render 免费档休眠，等 30 秒再试

**Aiven 服务被自动关机**  
→ 免费档长期不用会休眠，到 Aiven 控制台点 **Power on** 即可

**stats.html / feedback-admin.html**  
→ 输入你在 `ADMIN_STATS_TOKEN` 里设的那串密码
