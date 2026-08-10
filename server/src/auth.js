const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_STATS_TOKEN || "dev-secret-change-me";
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const attempt = hashPassword(password, salt);
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(attempt, "hex"));
  } catch {
    return false;
  }
}

function signToken(userId, username) {
  const payload = {
    sub: userId,
    name: username,
    exp: Date.now() + TOKEN_TTL_MS
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!payload.sub || !payload.exp || Date.now() > payload.exp) return null;
  return payload;
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "unauthorized" });
  }
  req.auth = { userId: payload.sub, username: payload.name };
  next();
}

function newUserId() {
  return `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function validateUsername(username) {
  const u = String(username || "").trim();
  if (u.length < 3 || u.length > 16) return null;
  if (!/^[\w\u4e00-\u9fff\u3400-\u4dbf-]+$/.test(u)) return null;
  return u;
}

function validatePassword(password) {
  const p = String(password || "");
  if (p.length < 6 || p.length > 64) return null;
  return p;
}

function defaultUserData() {
  return {
    history: [],
    wrongBook: {},
    mastered: {},
    masteredModules: {},
    badges: [],
    badgeWall: [],
    simulations: {}
  };
}

module.exports = {
  createPasswordRecord,
  verifyPassword,
  signToken,
  verifyToken,
  authMiddleware,
  newUserId,
  validateUsername,
  validatePassword,
  defaultUserData
};
