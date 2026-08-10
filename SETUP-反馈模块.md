# 评价反馈 · 部署指南（跟着做就行）

代码已经写好。按下面 **4 步** 做完，用户就能提交评价，你能在管理页挑选上墙。

---

## 第 0 步：你现在有什么

| 组件 | 状态 |
|------|------|
| 右上角「馈」按钮 | ✅ 已有（赏下面） |
| 评价弹窗 + 展示墙 | ✅ 已有 |
| 后端 API `/api/feedback` | ✅ 代码在 `server/` |
| 管理页 | ✅ `feedback-admin.html` |

**还没做的话：** MySQL + Render 部署 + `site-config.js` 填 API 地址。

---

## 第 1 步：MySQL（和统计/用户系统共用）

如果 **已经部署过** Render API，跳过这步，只要 **重新 Deploy 一次**（让新表 `feedback` 自动创建）。

如果 **还没部署过**，按 `SETUP-用户系统.md` 注册 db4free，记下：

- `MYSQL_HOST`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

---

## 第 2 步：Render 部署 / 更新后端

1. 把最新代码 **Push 到 GitHub**
2. 打开 [Render Dashboard](https://dashboard.render.com/)
3. 若已有 `ielts-analytics-api` 服务 → 点 **Manual Deploy → Deploy latest commit**
4. 若没有 → **New + → Blueprint** → 连仓库（读 `render.yaml`）
5. Environment 里填 MySQL 四个变量 +：
   - `ADMIN_STATS_TOKEN` — 管理口令（stats 和 feedback 管理页共用）
   - `JWT_SECRET` — 用户登录用
   - `CORS_ORIGINS` — 默认含 GitHub Pages，一般不用改

6. 部署完成后访问：

```
https://你的服务.onrender.com/health
```

应看到：`{"ok":true,"db":"connected"}`

**验证反馈接口（可选）：**

```bash
curl https://你的服务.onrender.com/api/feedback/wall
```

应返回：`{"items":[]}`（空墙是正常的）

---

## 第 3 步：前端接上 API

编辑 **`js/site-config.js`**：

```javascript
apiBase: "https://ielts-analytics-api.onrender.com",  // 换成你的真实 URL
```

Push 到 GitHub，等 Pages 更新（1–2 分钟）。

---

## 第 4 步：用起来

### 用户侧

1. 打开网站任意页
2. 右上角点 **馈**
3. 上方看精选评价，下方写评价提交

> 没配 `apiBase` 时：只能看 `js/feedback-wall.json` 里的示例，不能提交。

### 你（作者）审核上墙

1. 打开：  
   `https://lostecho37.github.io/ielts-task1/feedback-admin.html`
2. 输入 **ADMIN_STATS_TOKEN** 口令 → 加载
3. 默认看 **待审核** 列表
4. 填好 **展示名**（可改匿名）→ 点 **上墙**
5. 用户再开「馈」弹窗，就能在「大家怎么说」里看到

| 操作 | 效果 |
|------|------|
| 上墙 | 出现在公开评价墙 |
| 下架 | 回到待审核，墙上看不到 |
| 隐藏 | 不再展示，也不出现在待审列表（选「已隐藏」可找回） |

---

## 本地先试（可选）

```bash
# 终端 1
cd server
cp .env.example .env   # 填 MySQL
npm install && npm start

# 终端 2
cd ..   # 项目根目录
python3 -m http.server 8765
```

`site-config.js` 临时设 `apiBase: "http://localhost:3000"`，浏览器打开 `http://localhost:8765`。

---

## 常见问题

**提交后提示 storage_unavailable**  
→ Render 连不上 MySQL，检查环境变量；或 db4free 休眠，等一会再试。

**管理页 401**  
→ 口令和 Render 里 `ADMIN_STATS_TOKEN` 不一致。

**CORS 报错**  
→ `CORS_ORIGINS` 要包含 `https://lostecho37.github.io`。

**Render 第一次请求很慢**  
→ 免费档休眠，等 30 秒。

---

## 相关文件

| 文件 | 作用 |
|------|------|
| `server/src/routes/feedback.js` | 提交 / 墙 / 管理 API |
| `js/feedback.js` | 用户弹窗 |
| `feedback-admin.html` | 你审核上墙 |
| `js/feedback-wall.json` | 未接 API 时的示例墙 |

更完整的后端说明见 `server/README.md`。
