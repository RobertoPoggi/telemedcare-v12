# 🚀 DEPLOY MIGRATION 0050 - Nuovo Template Email Contratto

## 📋 Cosa fa questa migration

Aggiorna il template `email_invio_contratto` nel database con:
- **Ordine box**: brochure PRIMA, contratto DOPO
- **Nuovo testo introduttivo**: focus su dispositivo prescelto e caratteristiche
- **Prossimi passi aggiornati**: 
  - Opzione 1: Firma elettronica (online)
  - Opzione 2: Firma cartacea (stampa e invio)
  - Proforma dopo firma
  - Consegna entro 10 giorni lavorativi

---

## ⚡ DEPLOY IMMEDIATO

### Opzione A: Dashboard Cloudflare (PIÙ VELOCE)

1. Vai su https://dash.cloudflare.com/
2. **Workers & Pages** → **D1**
3. Database: **telemedcare-db** → **Console**
4. Copia TUTTO il contenuto del file `migrations/0050_update_contract_email_template.sql`
5. Incolla nella console D1
6. Clicca **Execute**
7. Verifica: dovresti vedere `Query executed successfully`

### Opzione B: Wrangler CLI (se configurato)

```bash
cd /path/to/telemedcare-v12
git pull origin main
npx wrangler d1 execute telemedcare-db --file=./migrations/0050_update_contract_email_template.sql --remote
```

---

## ✅ VERIFICA DEPLOY

Dopo aver eseguito la migration, verifica che il template sia aggiornato:

```sql
SELECT 
  id, 
  name, 
  LENGTH(html_content) as html_length,
  variables,
  updated_at
FROM document_templates
WHERE id = 'email_invio_contratto';
```

**Risultato atteso:**
- `html_length`: circa 5000-6000 caratteri (molto più lungo del vecchio)
- `variables`: deve includere `DISPOSITIVO`, `LINK_BROCHURE`, `LINK_FIRMA`
- `updated_at`: timestamp di oggi (2026-02-11)

---

## 🔧 FIX AGGIUNTIVO: Link Firma Contratto

**Problema risolto nel codice**: il link firma aveva `.html` che causava 404.

**Fix applicato** (commit 21fc3c0):
- Vecchio: `https://telemedcare-v12.pages.dev/contract-signature.html?contractId=...`
- Nuovo: `https://telemedcare-v12.pages.dev/contract-signature?contractId=...`

Cloudflare Pages rimuove automaticamente l'estensione `.html`, quindi ora il link funziona.

---

## 🎯 RISULTATO FINALE

Dopo deploy migration + attesa deploy Cloudflare Pages (3-5 minuti):

### ✅ Email Contratto Automatica
- **Invio automatico**: dopo completamento form lead
- **Ordine corretto**: box brochure → box contratto
- **Testo aggiornato**: dispositivo prescelto, prossimi passi chiari
- **Link firma funzionante**: nessun 404

### ✅ Pulsante Manuale Dashboard
- **Invio contratto manuale**: usa lo stesso template `email_invio_contratto`
- **Stessa email**: identica a quella automatica
- **Coerenza totale**: processo manuale = processo automatico

---

## 📊 STATO ATTUALE

- ✅ Migration 0050 creata
- ✅ Fix link firma pushato (commit 21fc3c0)
- ⏳ Migration 0050 da deployare su D1
- ⏳ Deploy Cloudflare Pages in corso (~3-5 min)

---

## 🚨 PROSSIMI PASSI

1. **ADESSO**: Deploya migration 0050 su D1 (Opzione A o B)
2. **Attendi 3-5 minuti**: Deploy Cloudflare Pages completi
3. **Testa**: 
   - Completa form lead (automatico)
   - Invia contratto da dashboard (manuale)
   - Verifica email ricevuta (brochure prima, contratto dopo)
   - Clicca link firma (deve funzionare, no 404)

---

## 📞 SUPPORTO

Se hai problemi:
- Verifica che la migration sia stata eseguita (query di verifica sopra)
- Controlla i log Cloudflare Workers (per l'invio email)
- Verifica che il deploy Cloudflare Pages sia completato
- Controlla che il file `public/contract-signature.html` sia presente

---

**File migration**: `migrations/0050_update_contract_email_template.sql`  
**Commit fix link**: `21fc3c0`  
**Branch**: `main`  
**Data**: 2026-02-11
