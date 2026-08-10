# 部署 API · Zeabur（免费 · 不用绑卡）

> **Koyeb 已不行** — 被 Mistral 收购后，新用户必须付费，免费档没了。  
> **Render 要绑卡。**  
> **推荐 Zeabur**：GitHub 登录，免费档不绑卡（首次建项目可能要手机验证）。

Aiven MySQL 你已经有了 ✅，下面只部署 API。

---

## 第 1 步：注册 Zeabur

1. 打开 https://zeabur.com/
2. 点 **Sign in** → **Continue with GitHub**
3. 授权 Zeabur

若提示验证账号：选 **手机号验证**（不要选信用卡）。

---

## 第 2 步：创建项目

1. 登录后点 **Create Project**（创建项目）
2. 名字随便，例如 `ielts-api`
3. 区域选 **Global** 或离你近的（默认即可）

---

## 第 3 步：从 GitHub 部署

1. 在项目里点 **Add Service**（添加服务）
2. 选 **GitHub**
3. 第一次会提示授权 GitHub → 允许访问 **`ielts-task1`** 仓库
4. 选仓库：**`LostEchO37/ielts-task1`**
5. 分支：**`main`**
6. Zeabur 会自动识别 Node.js

### 指定后端目录（重要）

部署后点进这个 **Service** → **Settings**（设置）→ 找到 **Root Directory**：

填：**`server`**

（仓库里也有 `zbpack.json` 指向 `server`，但 Settings 里再填一次最稳。）

---

## 第 4 步：环境变量

Service → **Variable**（变量）→ 添加：

| Key | Value |
|-----|--------|
| `MYSQL_HOST` | `mysql-e7ca944-leow037-ielts.k.aivencloud.com` |
| `MYSQL_PORT` | `19272` |
| `MYSQL_USER` | `avnadmin` |
| `MYSQL_PASSWORD` | Aiven 里的 Password |
| `MYSQL_DATABASE` | `defaultdb` |
| `MYSQL_SSL` | `1` |
| `ADMIN_STATS_TOKEN` | 自拟一长串 |
| `JWT_SECRET` | 同上或另设 |
| `CORS_ORIGINS` | `https://lostecho37.github.io,http://localhost:8765` |

---

## 第 5 步：部署 & 拿域名

1. 点 **Deploy** / 等自动构建完成（约 3–5 分钟）
2. 进 **Networking** / **Domains** 标签
3. 点 **Generate Domain**（生成域名），会得到类似：  
   **`https://ielts-task1-xxxxx.zeabur.app`**

---

## 第 6 步：验证

浏览器打开：

```
https://你的域名.zeabur.app/health
```

应看到：`{"ok":true,"db":"connected"}`

---

## 第 7 步：网站接上 API

改 `js/site-config.js`：

```javascript
apiBase: "https://你的域名.zeabur.app",
```

Push 到 GitHub → 等 Pages 更新。

---

## 注意

| 情况 | 说明 |
|------|------|
| 免费档休眠 | 一段时间没人访问会睡，第一次打开慢几秒 |
| Aiven 关机 | 去 console.aiven.io 点 Power on |
| `/health` 报错 | 检查 MySQL 变量 + `MYSQL_SSL=1` |
| 建错了目录 | Settings → Root Directory 改成 `server` 再 Redeploy |

---

## 为什么不用 Koyeb / Render

| 平台 | 现状 |
|------|------|
| Render | 新账号要绑信用卡 |
| Koyeb | 被 Mistral 收购，**新用户只能付费**，你看到的空白页就是这个原因 |
| Zeabur | 免费档可用，国内开发者常用 |
