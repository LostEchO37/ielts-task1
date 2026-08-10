const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { getPool, pingDb } = require("./db");
const { migrate } = require("./migrate");
const trackRouter = require("./routes/track");
const statsRouter = require("./routes/stats");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

const origins = (process.env.CORS_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || origins.includes("*") || origins.some((o) => origin === o || origin.startsWith(o))) {
        cb(null, true);
        return;
      }
      cb(null, false);
    },
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "32kb" }));

app.get("/health", async (_req, res) => {
  try {
    await pingDb();
    res.json({ ok: true, db: "connected" });
  } catch (e) {
    res.status(503).json({ ok: false, db: "error", message: e.message });
  }
});

app.use("/api/track", trackRouter);
app.use("/api/stats", statsRouter);
app.use("/api/auth", authRouter);

async function start() {
  try {
    await migrate();
  } catch (e) {
    console.error("Database migration failed:", e.message);
    console.error("Check MYSQL_* env vars on Render.");
  }

  app.listen(PORT, () => {
    console.log(`Analytics API listening on :${PORT}`);
  });
}

start();
