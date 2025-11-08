-- Migration: Create DocuSign Tokens Table
-- Purpose: Store DocuSign OAuth access tokens for reuse
-- Version: 0020
-- Date: 2025-11-08

-- Create docusign_tokens table for storing OAuth tokens
CREATE TABLE IF NOT EXISTS docusign_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  access_token TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  expires_at TEXT NOT NULL,  -- ISO timestamp quando scade
  scope TEXT,
  refresh_token TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create index for efficient token lookup
CREATE INDEX IF NOT EXISTS idx_docusign_tokens_expires_at ON docusign_tokens(expires_at);

-- Only keep the most recent valid token (cleanup old tokens)
CREATE TRIGGER IF NOT EXISTS cleanup_old_docusign_tokens
AFTER INSERT ON docusign_tokens
BEGIN
  DELETE FROM docusign_tokens
  WHERE id NOT IN (
    SELECT id FROM docusign_tokens
    ORDER BY created_at DESC
    LIMIT 1
  );
END;
