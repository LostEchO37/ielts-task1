-- 用户账号（用户名 + 密码）
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(32) PRIMARY KEY,
  username VARCHAR(32) NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户学习记录（JSON，跨设备同步）
CREATE TABLE IF NOT EXISTS user_records (
  user_id VARCHAR(32) PRIMARY KEY,
  data JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_records_account FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS visits (
  id VARCHAR(64) PRIMARY KEY,
  ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  event_type VARCHAR(32) NOT NULL DEFAULT 'pageview',
  page VARCHAR(220) NOT NULL DEFAULT '/',
  referrer VARCHAR(320) DEFAULT '',
  ua VARCHAR(180) DEFAULT '',
  lang VARCHAR(32) DEFAULT '',
  user_name VARCHAR(32) DEFAULT '',
  session_id VARCHAR(64) DEFAULT '',
  vw SMALLINT UNSIGNED DEFAULT 0,
  vh SMALLINT UNSIGNED DEFAULT 0,
  module VARCHAR(24) DEFAULT '',
  extra JSON,
  INDEX idx_ts (ts),
  INDEX idx_page (page(100)),
  INDEX idx_event (event_type),
  INDEX idx_user (user_name),
  INDEX idx_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
