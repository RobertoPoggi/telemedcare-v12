-- 0109 - Registro delle consegne webhook Stripe
-- Una riga per ogni POST su /api/webhooks/stripe, scritta prima di rispondere.
-- Non contiene il payload né dati di pagamento: solo metadati per l'audit.

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id          TEXT,      -- Stripe event.id (NULL se firma non valida o payload illeggibile)
  event_type        TEXT,      -- Stripe event.type
  esito             TEXT NOT NULL,  -- ok | firma_non_valida | payload_non_valido | non_configurato | errore_handler
  http_status       INTEGER NOT NULL,
  signature_present INTEGER NOT NULL DEFAULT 0,
  message           TEXT,
  livemode          INTEGER,
  payload_bytes     INTEGER,
  received_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_received_at ON stripe_webhook_events (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id ON stripe_webhook_events (event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_esito ON stripe_webhook_events (esito, received_at DESC);
