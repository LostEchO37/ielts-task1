# 用户系统 · 从零部署（约 15 分钟）

代码已经写好，**你不需要写任何代码**。只需注册两个免费账号，填几行配置。

---

## 第 1 步：免费 MySQL（db4free）

1. 打开 https://www.db4free.net/signup.php 注册
2. 登录后 → **Create database**
   - Database name：随便填，例如 `ielts_analytics`
   - 记住页面上显示的 **Host / Username / Password**
3. **不用手动执行 SQL** — 后端启动时会自动建表

记下这 4 个值（后面填 Render）：

| 变量 | 示例 |
|------|------|
| MYSQL_HOST | `xxx.db4free.net` |
| MYSQL_USER | `你的用户名` |
| MYSQL_PASSWORD | `你的密码` |
| MYSQL_DATABASE | `ielts_analytics` |

---

## 第 2 步：Render 部署后端

1. 打开 https://dashboard.render.com/ 用 GitHub 登录
2. **New +** → **Blueprint**
3. 连接仓库 `LostEchO37/ielts-task1`（若看不到，先 Push 代码到 GitHub）
4. Render 会读取根目录的 `render.yaml`，创建 Web Service
5. 在 **Environment** 里填上一步的 MySQL 四个变量，再加：

| 变量 | 填什么 |
|------|--------|
| `ADMIN_STATS_TOKEN` | 随便一长串密码，例如 `ielts-stats-2026-你的生日` |
| `JWT_SECRET` | 同上即可，或另填一串 |
| `CORS_ORIGINS` | 已有默认值，不用改 |

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

---

## 常见问题

**`/health` 显示 db error**  
→ Render 里 MySQL 四个环境变量填错，或 db4free 账号未激活（查邮箱确认）

**注册时「服务器连接失败」**  
→ `site-config.js` 的 `apiBase` 没填或填错；或 Render 免费档休眠，等 30 秒再试

**stats.html 统计页**  
→ 输入你在 `ADMIN_STATS_TOKEN` 里设的那串密码
