# 部署 API · Koyeb（免费 · 不用绑卡）

Render 要绑信用卡；**Koyeb** 免费档通常 **不用卡**，适合我们这个 Node + Aiven MySQL 的后端。

> 你已完成 **Aiven MySQL** ✅，下面只部署 API。

---

## 第 1 步：注册 Koyeb

1. 打开 https://www.koyeb.com/
2. 点 **Get Started** → 选 **Continue with GitHub**
3. 授权 Koyeb 访问 GitHub
4. **不要选付费方案**，用默认的 **Free / Hobby** 即可

---

## 第 2 步：创建 Web Service

1. 登录后点 **Create Web Service**（或 **Create Service** → **Web Service**）
2. **Deployment method** → 选 **GitHub**
3. 第一次会提示 **Install GitHub App** → 授权，并勾选仓库 **`ielts-task1`**
4. 选仓库：**`LostEchO37/ielts-task1`**
5. 分支：**`main`**

### 构建设置（重要）

| 项 | 填什么 |
|----|--------|
| **Root directory**（工作目录） | `server` |
| **Builder** | Buildpack（默认） |
| **Run command** | 留空（用 `package.json` 的 `npm start`） |
| **Instance** | **Free** / **Nano**（512MB 那个） |
| **Region** | 选 **Singapore** 或 **Washington**（离用户近一点） |

---

## 第 3 步：环境变量

在 **Environment variables** 里添加（Aiven 控制台里的值）：

| Key | Value |
|-----|--------|
| `MYSQL_HOST` | `mysql-e7ca944-leow037-ielts.k.aivencloud.com` |
| `MYSQL_PORT` | `19272` |
| `MYSQL_USER` | `avnadmin` |
| `MYSQL_PASSWORD` | （Aiven 里的 Password，自己粘贴） |
| `MYSQL_DATABASE` | `defaultdb` |
| `MYSQL_SSL` | `1` |
| `ADMIN_STATS_TOKEN` | 自拟一长串，如 `ielts-admin-2026-xxxx` |
| `JWT_SECRET` | 同上或另设一串 |
| `CORS_ORIGINS` | `https://lostecho37.github.io,http://localhost:8765` |

**记下 `ADMIN_STATS_TOKEN`** — `stats.html` 和 `feedback-admin.html` 要用。

---

## 第 4 步：部署

1. 点 **Deploy**
2. 等 3–5 分钟，看 **Logs** 里出现：`Analytics API listening on :xxxx`
3. 顶部会给你一个地址，形如：  
   **`https://ielts-task1-xxxxx.koyeb.app`**

---

## 第 5 步：验证

浏览器打开（换成你的地址）：

```
https://你的服务.koyeb.app/health
```

应看到：

```json
{"ok":true,"db":"connected"}
```

再试：

```
https://你的服务.koyeb.app/api/feedback/wall
```

应看到：`{"items":[]}`

---

## 第 6 步：网站接上 API

编辑 **`js/site-config.js`**：

```javascript
apiBase: "https://你的服务.koyeb.app",
```

Push 到 GitHub，等 Pages 更新 1–2 分钟。

---

## 完成 ✅

| 功能 | 怎么测 |
|------|--------|
| 云端登录 | 网站注册 / 登录 |
| 评价反馈 | 点 **馈** → 提交 |
| 审核上墙 | `feedback-admin.html` + 管理口令 |
| 访问统计 | `stats.html` + 同一口令 |

---

## 注意事项

**冷启动**  
Koyeb 免费档 **1 小时没访问会休眠**，第一次打开可能等 **10–30 秒**，属正常。

**Aiven 休眠**  
Aiven 免费 MySQL 长期不用也可能关机 → 到 [console.aiven.io](https://console.aiven.io) 点 **Power on**。

**`/health` 报 db error**  
检查 6 个 MySQL 变量、`MYSQL_SSL=1`、端口是否为 Aiven 的 `19272`（不是 3306）。

**Koyeb 突然要绑卡**  
极少数账号会要求验证；若出现，可换 **Zeabur**（zeabur.com，GitHub 登录，免费档通常也不绑卡，可能要手机验证）。

---

## 和 Render 的区别

| | Koyeb 免费 | Render 免费 |
|--|-----------|-------------|
| 绑卡 | 通常不要 | 要 |
| 休眠 | 1h 无流量 | 15min 左右 |
| 本项目 | Root = `server` | Blueprint `render.yaml` |
