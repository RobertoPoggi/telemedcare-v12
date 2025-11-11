# 🌐 TeleMedCare V11.0 - Link Sistema

## 📍 URL Pubblici

### 🏠 Landing Page (Home)
**URL**: https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/

**Descrizione**: Pagina principale del sistema con form di registrazione lead

**Funzionalità**:
- ✅ Form completo acquisizione lead
- ✅ Selezione pacchetto (BASE/AVANZATO)
- ✅ Richiesta contratto / brochure
- ✅ Invio automatico email
- ✅ Generazione contratti e documenti

---

### 📊 Admin Dashboard
**URL**: https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/admin-dashboard

**Descrizione**: Dashboard amministratore per gestione leads, contratti, proforma e dispositivi

**Sezioni**:
1. **📈 Statistiche**: Overview generale del sistema
2. **👥 Leads**: Elenco e gestione leads
3. **📄 Contratti**: Elenco contratti con azioni
4. **💰 Proforma**: Gestione proforma e pagamenti
5. **📱 Dispositivi**: Gestione dispositivi SiDLY

**Novità Dashboard**:
- ✅ Codici contratti semplificati: `CTR_2025/0001`, `CTR_2025/0002`, ...
- ✅ Pulsante **"📄 Visualizza Contratto"** per ogni contratto
- ✅ Pulsante unico **"✅ Conferma Firma"** (genera proforma automaticamente)
- ✅ Tabella semplificata (6 colonne invece di 7)
- ✅ Status in italiano: "Inviato" → "Firmato"

---

## 🔗 Link Diretti Utili

### Visualizza Contratto Specifico
```
https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/contratti/{CONTRACT_ID}/view
```

**Esempio** (Contratto CTR_2025/0001):
```
https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/contratti/CTR1762694419437/view
```

### Download Contratto PDF
```
https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/contratti/{CONTRACT_ID}/download
```

---

## 🔌 API Endpoints

### Base API
```
https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api
```

### Admin API
```
https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/admin
```

### Utility Endpoints (Conversione Codici)

**Aggiorna Codici Contratti**:
```bash
curl -X POST https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/admin/utils/simplify-contract-codes
```

**Aggiorna Codici Proforma**:
```bash
curl -X POST https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/admin/utils/simplify-proforma-codes
```

---

## 📋 Contratti Esistenti

| Codice | ID Sistema | Link Visualizza |
|--------|------------|-----------------|
| CTR_2025/0001 | CTR1762694419437 | [Visualizza](https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/contratti/CTR1762694419437/view) |
| CTR_2025/0002 | CTR1762715760418 | [Visualizza](https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/contratti/CTR1762715760418/view) |
| CTR_2025/0003 | CTR1762716857323 | [Visualizza](https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/contratti/CTR1762716857323/view) |
| CTR_2025/0004 | CTR1762717593973 | [Visualizza](https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/contratti/CTR1762717593973/view) |
| CTR_2025/0005 | CTR1762718212807 | [Visualizza](https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/contratti/CTR1762718212807/view) |
| CTR_2025/0006 | CTR1762718215917 | [Visualizza](https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/contratti/CTR1762718215917/view) |

---

## ✅ Modifiche Implementate (09/11/2025)

### 1. 🔢 Codifica Contratti e Proforma
- **Contratti**: `CTR_2025/0001`, `CTR_2025/0002`, ... (formato anno/sequenza)
- **Proforma**: `PFM_2025/0001`, `PFM_2025/0002`, ... (formato anno/sequenza)

### 2. 🇮🇹 Status in Italiano
- `DOCUMENTS_SENT` → `DOCUMENTI_INVIATI`
- Tutte le traduzioni aggiornate nel dashboard

### 3. 📊 Dashboard Semplificato
- ❌ Rimossa colonna "Firmato"
- ❌ Rimosso pulsante "Conferma Ricezione Olografa"
- ✅ Un solo pulsante: **"Conferma Firma"**
- ✅ Aggiunto pulsante: **"📄 Visualizza Contratto"** per ogni contratto

### 4. 🔗 Visualizzazione Contratti
- ✅ Ogni contratto ha link diretto per visualizzazione
- ✅ Apre in nuova tab
- ✅ Formato HTML completo del contratto

---

## 🚀 Test Rapidi

### Test Landing Page
```bash
curl https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/ | grep "TeleMedCare"
```

### Test Dashboard
```bash
curl https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/admin-dashboard | grep "Visualizza Contratto"
```

### Test Visualizza Contratto
```bash
curl https://4005-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/contratti/CTR1762694419437/view | grep "CTR_2025/0001"
```

---

## 📝 Note Tecniche

- **Server**: Wrangler Pages Dev su porta 4005
- **Database**: D1 locale (miniflare) con binding `telemedcare_db`
- **Build**: Vite SSR bundle per Cloudflare Workers
- **Status**: ✅ Operativo e testato

---

**Data Aggiornamento**: 09 Novembre 2025, 22:15  
**Versione**: TeleMedCare V11.0  
**Build**: Production Ready 🎉
