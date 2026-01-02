# 📋 Database Migrations - TeleMedCare V12

```
=====================================================
REGISTRO MIGRATIONS
=====================================================
Database: telemedcare-leads
Ultimo Aggiornamento: 02 Gennaio 2026 - 09:40
=====================================================
```

## 🗂️ Elenco Migrations (in ordine cronologico):

| # | File | Data Creazione | Stato | Descrizione |
|---|------|----------------|-------|-------------|
| 0001 | `0001_clean_schema.sql` | 30 Ottobre 2025 | ✅ Da verificare | Schema pulito iniziale |
| 0001 | `0001_initial_schema.sql` | 30 Ottobre 2025 | ✅ Da verificare | Schema iniziale alternativo |
| 0002 | `0002_add_missing_tables.sql` | 30 Ottobre 2025 | ⚠️ **DA APPLICARE** | Crea `document_templates` + 2 template |
| 0003 | `0003_add_proformas_table.sql` | 30 Ottobre 2025 | ✅ Da verificare | Tabella proformas |
| 0004 | `0004_create_assistiti_table.sql` | 30 Ottobre 2025 | ✅ Da verificare | Tabella assistiti |
| 0005 | `0005_fix_contracts_schema.sql` | 01 Gennaio 2026 | ✅ Da verificare | Fix schema contracts |
| 0006 | `0006_add_piano_and_servizio_to_leads.sql` | 01 Gennaio 2026 | ✅ **APPLICATA** | Aggiunge colonne piano/servizio |
| **0007** | **`0007_add_email_documenti_template.sql`** | **02 Gennaio 2026** | 🆕 **NUOVA** | Template `email_documenti_informativi` |

## 📝 Note Importanti:

### Migration 0002 - CRITICA ⚠️
**Crea la tabella `document_templates`** necessaria per il funzionamento del sistema email.

**Template inclusi**:
- `email_notifica_info` - Notifica nuovo lead
- `email_invio_contratto` - Invio contratto

**Se questa migration NON è stata applicata**:
- ❌ Sistema email NON funziona
- ❌ Errore: "no such table: document_templates"

### Migration 0007 - NUOVA 🆕
**Aggiunge template mancante**: `email_documenti_informativi`

**Necessario per**:
- ✉️ Invio brochure PDF al cliente
- ✉️ Invio documenti informativi

**Timestamp**: `2026-01-02 09:35:00`

## 🔍 Come Verificare Stato Migrations:

```sql
-- 1. Verifica tabelle presenti
SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;

-- 2. Verifica template email
SELECT id, name, created_at, updated_at 
FROM document_templates 
ORDER BY created_at DESC;

-- 3. Conta template presenti
SELECT COUNT(*) as total FROM document_templates;
```

## ✅ Verifica Applicazione Migration 0007:

Dopo aver applicato la migration 0007, verifica:

```sql
SELECT id, name, created_at 
FROM document_templates 
WHERE id = 'email_documenti_informativi';
```

Dovrebbe tornare:
- **id**: `email_documenti_informativi`
- **name**: `Invio Documenti Informativi`
- **created_at**: `2026-01-02 09:35:00`

## 📅 Convenzioni Date:

Tutte le migrations create **dopo il 01 Gennaio 2026** devono avere:

1. **Header con data esplicita**:
```sql
-- =====================================================
-- Migration XXXX: Descrizione
-- =====================================================
-- Data Creazione: DD Mese YYYY - HH:MM
-- =====================================================
```

2. **Timestamp espliciti nelle INSERT**:
```sql
INSERT INTO tabella (..., created_at, updated_at) 
VALUES (..., '2026-01-02 09:35:00', '2026-01-02 09:35:00');
```

3. **NO date generiche** come `2001-12-30` o `1970-01-01`

---

**Documento creato**: 02 Gennaio 2026 - 09:40  
**Responsabile**: Sistema Automatico  
**Database**: `telemedcare-leads`
