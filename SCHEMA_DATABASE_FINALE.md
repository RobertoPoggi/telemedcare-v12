# 📊 SCHEMA DATABASE - DOCUMENTAZIONE COMPLETA

## 🎯 PROBLEMA RISOLTO

### Root Cause
Il progetto aveva **DUE schemi DB inconsistenti**:

1. **schema.sql** (base completa) - usa `email` e `telefono`
2. **migrations incrementali** (0001_clean_schema, 0020_align_leads) - usano `emailRichiedente` e `telefonoRichiedente`

Questo causava:
- NOT NULL constraint failed durante INSERT
- Inconsistenza tra campi popolati
- Bug nascosti in endpoint diversi (auto-import vs form completamento)

### Soluzione Implementata
**Migration 0040_unify_email_telefono_fields.sql**:
- Aggiunge ENTRAMBI i set di campi (email + emailRichiedente, telefono + telefonoRichiedente)
- Crea **trigger automatici** per sincronizzarli
- Migra dati esistenti
- Garantisce che INSERT con QUALSIASI campo funzionino

---

## 📋 TABELLA LEADS - SCHEMA FINALE

### Campi Email/Telefono (SINCRONIZZATI AUTOMATICAMENTE)
| Campo | Tipo | NOT NULL | Default | Note |
|-------|------|----------|---------|------|
| **email** | TEXT | No | - | Legacy, mantenuto per compatibilità |
| **emailRichiedente** | TEXT | No | - | Nuovo standard, sincronizzato con email |
| **telefono** | TEXT | No | - | Legacy, mantenuto per compatibilità |
| **telefonoRichiedente** | TEXT | No | - | Nuovo standard, sincronizzato con telefono |

**IMPORTANTE**: I trigger garantiscono che:
- Se popoli `email` → automaticamente popola `emailRichiedente`
- Se popoli `emailRichiedente` → automaticamente popola `email`
- Se popoli `telefono` → automaticamente popola `telefonoRichiedente`
- Se popoli `telefonoRichiedente` → automaticamente popola `telefono`

### Campi Richiedente
| Campo | Tipo | NOT NULL | Default | Note |
|-------|------|----------|---------|------|
| **id** | TEXT | Sì (PK) | - | LEAD-IRBEMA-XXXXX |
| **nomeRichiedente** | TEXT | Sì | - | |
| **cognomeRichiedente** | TEXT | No | - | |
| **cfRichiedente** | TEXT | No | - | Codice fiscale |
| **indirizzoRichiedente** | TEXT | No | - | |
| **capRichiedente** | TEXT | No | - | |
| **cittaRichiedente** | TEXT | No | - | |
| **provinciaRichiedente** | TEXT | No | - | |
| **dataNascitaRichiedente** | TEXT | No | - | Formato ISO: YYYY-MM-DD |
| **luogoNascitaRichiedente** | TEXT | No | - | |

### Campi Assistito
| Campo | Tipo | NOT NULL | Default | Note |
|-------|------|----------|---------|------|
| **nomeAssistito** | TEXT | No | - | |
| **cognomeAssistito** | TEXT | No | - | |
| **dataNascitaAssistito** | TEXT | No | - | Formato ISO: YYYY-MM-DD |
| **luogoNascitaAssistito** | TEXT | No | - | |
| **etaAssistito** | TEXT | No | - | Calcolato o inserito manualmente |
| **parentelaAssistito** | TEXT | No | - | |
| **cfAssistito** | TEXT | No | - | Codice fiscale assistito |
| **codiceFiscaleAssistito** | TEXT | No | - | Alias di cfAssistito |
| **indirizzoAssistito** | TEXT | No | - | |
| **capAssistito** | TEXT | No | - | |
| **cittaAssistito** | TEXT | No | - | |
| **provinciaAssistito** | TEXT | No | - | |
| **condizioniSalute** | TEXT | No | - | |

### Campi Servizio/Piano
| Campo | Tipo | NOT NULL | Default | Note |
|-------|------|----------|---------|------|
| **servizio** | TEXT | No | 'eCura PRO' | eCura PRO, eCura FAMILY, eCura PREMIUM |
| **piano** | TEXT | No | 'BASE' | BASE, AVANZATO |
| **pacchetto** | TEXT | No | 'NESSUNO' | DEPRECATED - usare servizio+piano |
| **tipoServizio** | TEXT | No | - | DEPRECATED - dovrebbe essere 'eCura' |
| **servizio_ecura** | TEXT | No | - | Custom HubSpot property |
| **piano_ecura** | TEXT | No | - | Custom HubSpot property |

### Campi Prezzi
| Campo | Tipo | NOT NULL | Default | Note |
|-------|------|----------|---------|------|
| **prezzo_anno** | REAL | No | - | Prezzo annuale (IVA esclusa) |
| **prezzo_rinnovo** | REAL | No | - | Prezzo rinnovo annuale (IVA esclusa) |
| **setupBase** | REAL | No | - | Prezzo setup base |
| **setupIva** | REAL | No | - | IVA su setup |
| **setupTotale** | REAL | No | - | Totale setup (con IVA) |
| **rinnovoBase** | REAL | No | - | Prezzo rinnovo base |
| **rinnovoIva** | REAL | No | - | IVA su rinnovo |
| **rinnovoTotale** | REAL | No | - | Totale rinnovo (con IVA) |

### Campi Workflow
| Campo | Tipo | NOT NULL | Default | Note |
|-------|------|----------|---------|------|
| **status** | TEXT | No | 'NEW' | NEW, CONTACTED, QUALIFIED, CONTRACT_SENT, CONTRACT_SIGNED, CONVERTED, LOST |
| **fonte** | TEXT | No | - | IRBEMA, LANDING_PAGE, LUXOTTICA, PIRELLI, FAS |
| **external_source_id** | TEXT | No | - | ID HubSpot o altra fonte esterna |
| **external_data** | TEXT | No | - | JSON con dati aggiuntivi |

### Campi Consensi/Preferenze
| Campo | Tipo | NOT NULL | Default | Note |
|-------|------|----------|---------|------|
| **vuoleContratto** | INTEGER | No | 0 | 0 o 1 |
| **vuoleBrochure** | INTEGER | No | 0 | 0 o 1 |
| **vuoleManuale** | INTEGER | No | 0 | 0 o 1 |
| **gdprConsent** | INTEGER | No | 0 | 0 o 1 |
| **consensoPrivacy** | BOOLEAN | No | FALSE | |
| **consensoMarketing** | BOOLEAN | No | FALSE | |
| **intestazioneContratto** | TEXT | No | 'richiedente' | richiedente o assistito |
| **preferenzaContatto** | TEXT | No | - | |

### Campi Timestamp
| Campo | Tipo | NOT NULL | Default | Note |
|-------|------|----------|---------|------|
| **timestamp** | TEXT | No | datetime('now') | Legacy |
| **created_at** | DATETIME | No | CURRENT_TIMESTAMP | Data creazione |
| **updated_at** | DATETIME | No | CURRENT_TIMESTAMP | Data ultimo aggiornamento |

### Campi Note
| Campo | Tipo | NOT NULL | Default | Note |
|-------|------|----------|---------|------|
| **note** | TEXT | No | - | Note generali |
| **priority** | TEXT | No | - | Alta urgenza, Media urgenza, Bassa urgenza |
| **versione** | TEXT | No | - | Versione sistema |

---

## 🔧 TRIGGER AUTOMATICI

### 1. Sincronizzazione Email
```sql
-- email → emailRichiedente
CREATE TRIGGER sync_email_to_emailRichiedente
AFTER INSERT ON leads
FOR EACH ROW
WHEN NEW.email IS NOT NULL AND NEW.emailRichiedente IS NULL
BEGIN
  UPDATE leads SET emailRichiedente = NEW.email WHERE id = NEW.id;
END;

-- emailRichiedente → email
CREATE TRIGGER sync_emailRichiedente_to_email
AFTER INSERT ON leads
FOR EACH ROW
WHEN NEW.emailRichiedente IS NOT NULL AND NEW.email IS NULL
BEGIN
  UPDATE leads SET email = NEW.emailRichiedente WHERE id = NEW.id;
END;
```

### 2. Sincronizzazione Telefono
```sql
-- telefono → telefonoRichiedente
CREATE TRIGGER sync_telefono_to_telefonoRichiedente
AFTER INSERT ON leads
FOR EACH ROW
WHEN NEW.telefono IS NOT NULL AND NEW.telefonoRichiedente IS NULL
BEGIN
  UPDATE leads SET telefonoRichiedente = NEW.telefono WHERE id = NEW.id;
END;

-- telefonoRichiedente → telefono
CREATE TRIGGER sync_telefonoRichiedente_to_telefono
AFTER INSERT ON leads
FOR EACH ROW
WHEN NEW.telefonoRichiedente IS NOT NULL AND NEW.telefono IS NULL
BEGIN
  UPDATE leads SET telefono = NEW.telefonoRichiedente WHERE id = NEW.id;
END;
```

### 3. updated_at Automatico
```sql
CREATE TRIGGER leads_updated_at 
AFTER UPDATE ON leads 
FOR EACH ROW 
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

---

## 📝 RACCOMANDAZIONI PER IL CODICE

### ✅ BEST PRACTICE - Usa emailRichiedente/telefonoRichiedente
```typescript
// ✅ CORRETTO - Usa il nuovo standard
await db.prepare(`
  INSERT INTO leads (
    id, nomeRichiedente, cognomeRichiedente, 
    emailRichiedente, telefonoRichiedente
  ) VALUES (?, ?, ?, ?, ?)
`).bind(id, nome, cognome, email, telefono).run()
```

### ⚠️ FUNZIONA MA NON RACCOMANDATO - Usa email/telefono legacy
```typescript
// ⚠️ FUNZIONA (grazie ai trigger) ma non raccomandato
await db.prepare(`
  INSERT INTO leads (
    id, nomeRichiedente, cognomeRichiedente, 
    email, telefono
  ) VALUES (?, ?, ?, ?, ?)
`).bind(id, nome, cognome, email, telefono).run()
```

### ✅ SOLUZIONE SICURA - Popola ENTRAMBI i campi
```typescript
// ✅ MASSIMA SICUREZZA - Popola entrambi esplicitamente
await db.prepare(`
  INSERT INTO leads (
    id, nomeRichiedente, cognomeRichiedente, 
    email, emailRichiedente,
    telefono, telefonoRichiedente
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`).bind(id, nome, cognome, email, email, telefono, telefono).run()
```

---

## 🚨 CAMPI CHE DEVONO ESSERE POPOLATI SEMPRE

### Obbligatori (NOT NULL)
1. **id** - PRIMARY KEY
2. **nomeRichiedente** - Nome del richiedente
3. **email** o **emailRichiedente** - Almeno uno dei due (trigger sincronizza l'altro)

### Fortemente Raccomandati
1. **servizio** - Default 'eCura PRO'
2. **piano** - Default 'BASE'
3. **tipoServizio** - Dovrebbe essere 'eCura' (fisso)
4. **fonte** - Tracciabilità (IRBEMA, LANDING_PAGE, etc.)
5. **status** - Default 'NEW'

---

## 📊 QUERY DI VERIFICA

### Verifica Sincronizzazione Email/Telefono
```sql
SELECT 
    id,
    email,
    emailRichiedente,
    telefono,
    telefonoRichiedente,
    CASE 
        WHEN email != emailRichiedente THEN '❌ MISMATCH'
        ELSE '✅ OK'
    END as email_status,
    CASE 
        WHEN telefono != telefonoRichiedente THEN '❌ MISMATCH'
        ELSE '✅ OK'
    END as telefono_status
FROM leads
WHERE email IS NOT NULL OR emailRichiedente IS NOT NULL;
```

### Conta Lead per Servizio/Piano
```sql
SELECT 
    servizio,
    piano,
    COUNT(*) as count,
    AVG(prezzo_anno) as avg_prezzo_anno,
    AVG(prezzo_rinnovo) as avg_prezzo_rinnovo
FROM leads
WHERE servizio IS NOT NULL
GROUP BY servizio, piano
ORDER BY servizio, piano;
```

### Trova Lead con Prezzi NULL
```sql
SELECT 
    id,
    nomeRichiedente,
    cognomeRichiedente,
    servizio,
    piano,
    prezzo_anno,
    prezzo_rinnovo,
    fonte
FROM leads
WHERE (prezzo_anno IS NULL OR prezzo_rinnovo IS NULL)
  AND fonte = 'IRBEMA'
ORDER BY created_at DESC;
```

---

## 🔄 MIGRATION HISTORY

| # | Nome | Data | Scopo |
|---|------|------|-------|
| 0001 | clean_schema | 2025-10-17 | Schema iniziale pulito |
| 0001 | initial_schema | 2025-10-17 | Schema iniziale completo |
| 0002 | add_missing_tables | - | Aggiunge tabelle mancanti |
| 0006 | add_piano_and_servizio | 2026-01-01 | Separa servizio e piano |
| 0020 | align_leads_schema | 2026-01-06 | Allinea schema con codice |
| 0025 | add_intestatario_fields | 2026-02-01 | Campi intestatario contratto |
| **0040** | **unify_email_telefono_fields** | **2026-02-11** | **RISOLVE inconsistenza email/telefono** |
| schema | schema.sql | 2025-10-17 | Schema completo operativo (master) |

---

## ✅ CHECKLIST POST-DEPLOY

- [ ] Esegui migration 0040 su DB produzione
- [ ] Verifica sincronizzazione campi con query di controllo
- [ ] Testa INSERT con email → verifica emailRichiedente popolato
- [ ] Testa INSERT con emailRichiedente → verifica email popolato
- [ ] Standardizza codice per usare emailRichiedente/telefonoRichiedente
- [ ] Aggiorna tutti gli endpoint per popolare entrambi i campi (massima sicurezza)
- [ ] Test auto-import HubSpot
- [ ] Test form completamento dati
- [ ] Test pulsante IRBEMA

---

## 📖 RIFERIMENTI

- **File Migration**: `/migrations/0040_unify_email_telefono_fields.sql`
- **Schema Master**: `/migrations/schema.sql`
- **Codice Auto-Import**: `/src/modules/hubspot-integration.ts`
- **Codice Form Completamento**: `/src/index.tsx` (endpoint /api/leads/:id/complete)
- **Codice IRBEMA**: `/src/index.tsx` (endpoint /api/hubspot/sync)
