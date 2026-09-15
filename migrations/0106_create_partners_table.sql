-- =============================================
-- TeleMedCare V12 - Migration 0106
-- Dataset PARTNER: tabella partners dedicata
-- Data: 2026-09-15
-- =============================================
-- I Partner eCura sono professionisti (fisioterapisti, badanti, medici, etc.)
-- che promuovono i servizi eCura/TeleMedCare tramite codice referral personale.
-- Flusso: Richiesta (pending) → Approvazione → Attivo → Commissioni
-- =============================================

-- =====================================
-- TABELLA PARTNERS
-- =====================================
CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,                        -- PART-XXXX-XXXXX formato

    -- Dati anagrafici
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefono TEXT NOT NULL,

    -- Ruolo / professione
    ruolo TEXT NOT NULL,                        -- Fisioterapista, Badante, Medico, Infermiere, Caregiver, Farmacista, Altro
    specializzazione TEXT,                      -- Specializzazione opzionale
    citta TEXT,
    provincia TEXT,
    cap TEXT,

    -- Codice referral
    referral_code TEXT UNIQUE,                  -- ECU-XXXX (no ambiguity charset)
    referral_url TEXT,                          -- https://www.ecura.it/?ref=ECU-XXXX

    -- Stato partner e workflow
    status TEXT NOT NULL DEFAULT 'pending',     -- pending, active, suspended, rejected
    approvato_da TEXT,                          -- Username operatore che ha approvato
    note_interne TEXT,                          -- Note operative (non visibili al partner)
    motivo_rifiuto TEXT,                        -- Compilato se status = rejected

    -- Commissioni e performance
    commission_pct REAL NOT NULL DEFAULT 5.0,  -- Percentuale commissione (default 5%)
    referrals_count INTEGER NOT NULL DEFAULT 0, -- Totale lead portati
    referrals_attivi INTEGER NOT NULL DEFAULT 0,-- Lead convertiti in contratto attivo
    commissioni_maturate REAL NOT NULL DEFAULT 0.0,  -- EUR totali maturati
    commissioni_pagate REAL NOT NULL DEFAULT 0.0,    -- EUR totali già pagati

    -- Messaggi / note del partner (dalla form)
    messaggio TEXT,                             -- Messaggio iniziale dal form di adesione

    -- Consensi
    privacy_consent INTEGER NOT NULL DEFAULT 0, -- 1 = accettato

    -- UTM e tracciamento acquisizione
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    page_url TEXT,
    referrer TEXT,

    -- IP e metadata tecnico
    ip_address TEXT,
    user_agent TEXT,

    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    approvato_at TEXT,                          -- Quando è stato approvato
    sospeso_at TEXT                             -- Quando è stato sospeso
);

-- =====================================
-- TABELLA PARTNER_REFERRALS
-- Traccia ogni lead portato da un partner
-- =====================================
CREATE TABLE IF NOT EXISTS partner_referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id TEXT NOT NULL,                   -- FK → partners.id
    lead_id TEXT NOT NULL,                      -- FK → leads.id
    referral_code TEXT NOT NULL,                -- Codice usato (snapshot storico)

    -- Stato della referral
    status TEXT NOT NULL DEFAULT 'nuovo',       -- nuovo, contattato, convertito, perso
    commissione_pct REAL,                       -- % al momento della referral
    commissione_eur REAL,                       -- EUR maturati (calcolato alla conversione)
    commissione_pagata INTEGER DEFAULT 0,       -- 0/1

    -- Metadata
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- =====================================
-- INDICI PER PERFORMANCE
-- =====================================
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_partners_referral_code ON partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_ruolo ON partners(ruolo);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON partners(created_at);

CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner_id ON partner_referrals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_lead_id ON partner_referrals(lead_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_status ON partner_referrals(status);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_code ON partner_referrals(referral_code);

-- =====================================
-- TRIGGER updated_at AUTOMATICO
-- =====================================
CREATE TRIGGER IF NOT EXISTS partners_updated_at
    AFTER UPDATE ON partners
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE partners SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS partner_referrals_updated_at
    AFTER UPDATE ON partner_referrals
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE partner_referrals SET updated_at = datetime('now') WHERE id = NEW.id;
END;
