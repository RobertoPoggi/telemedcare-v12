-- TeleMedCare V12.0 - Migration 0105
-- Crea tabella users per autenticazione
-- Questa tabella era precedentemente creata solo via POST /api/admin/init-users;
-- ora viene creata con la migration in modo da essere disponibile su ogni deployment.
--
-- Nota: per inserire gli utenti default eseguire POST /api/admin/init-users
-- oppure configurare i Cloudflare Secrets USER_ROBERTO_PASSWORD,
-- USER_STEFANIA_PASSWORD, USER_OPERATOR_PASSWORD e richiamare l'endpoint.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('ADMIN', 'OPERATOR')),
  full_name TEXT,
  email TEXT,
  last_login TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
