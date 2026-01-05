-- Tabella per statistiche globali
CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    emails_sent_30days INTEGER DEFAULT 0,
    last_reset_date TEXT DEFAULT (date('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Inserisci valore iniziale (32 email inviate finora)
INSERT OR REPLACE INTO stats (id, emails_sent_30days, last_reset_date, updated_at)
VALUES (1, 32, date('now'), datetime('now'));
