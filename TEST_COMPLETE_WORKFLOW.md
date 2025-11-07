# TEST COMPLETO WORKFLOW TELEMEDCARE V11.0

## 🎯 Obiettivi Test (da Roberto)

1. ✅ Generare contratti BASE e ADVANCED usando template DOCX
2. ✅ Simulare firma contratto  
3. ✅ Generare proforma automaticamente dopo firma
4. ✅ Verificare che email templates usano placeholders corretti
5. ✅ Test workflow completo end-to-end

## 📝 Test Script

### STEP 1: Crea nuovo lead con contratto BASE

```bash
curl -X POST https://3000-sandbox-XXXXX.e2b.dev/api/lead/submit \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "nomeAssistito": "Maria",
    "cognomeAssistito": "Rossi",
    "etaAssistito": "75",
    "luogoNascitaAssistito": "Milano",
    "dataNascitaAssistito": "15/03/1948",
    "cfAssistito": "RSSMRA48C55F205X",
    "indirizzoAssistito": "Via Roma 123",
    "capAssistito": "20100",
    "cittaAssistito": "Milano",
    "provinciaAssistito": "MI",
    "telefonoAssistito": "+39 333 7654321",
    "emailAssistito": "maria.rossi@example.com",
    "pacchetto": "BASE",
    "vuoleContratto": true,
    "vuoleBrochure": true,
    "vuoleManuale": true,
    "fonte": "LANDING_PAGE",
    "cfRichiedente": "PGGRBR70A01F205Z",
    "indirizzoRichiedente": "Corso Buenos Aires 45",
    "capRichiedente": "20100",
    "cittaRichiedente": "Milano",
    "provinciaRichiedente": "MI"
  }'
```

**Risultato atteso:**
- Lead creato nel database
- Email notifica a info@medicagb.it
- Email contratto BASE a Roberto con:
  - PDF contratto generato da template DOCX
  - Brochure allegata
  - Manuale allegato
  - Placeholders sostituiti ({{NOME_CLIENTE}} → Roberto, etc.)

### STEP 2: Simula firma contratto BASE

```bash
# Prendi contractId dalla risposta dello STEP 1
export CONTRACT_ID="il_tuo_contract_id"

curl -X POST https://3000-sandbox-XXXXX.e2b.dev/api/contracts/sign \
  -H "Content-Type: application/json" \
  -d "{
    \"contractId\": \"$CONTRACT_ID\",
    \"firmaDigitale\": \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==\",
    \"ipAddress\": \"192.168.1.1\",
    \"userAgent\": \"Test Browser\"
  }"
```

**Risultato atteso:**
- Firma salvata nel database
- Contratto status → SIGNED
- Proforma generata automaticamente da template DOCX
- Email proforma a Roberto con:
  - PDF proforma allegato
  - Dettagli pagamento (IBAN, etc.)
  - Placeholder sostituiti

### STEP 3: Ripeti test con contratto ADVANCED

```bash
curl -X POST https://3000-sandbox-XXXXX.e2b.dev/api/lead/submit \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "nomeAssistito": "Giuseppe",
    "cognomeAssistito": "Verdi",
    "etaAssistito": "68",
    "luogoNascitaAssistito": "Roma",
    "dataNascitaAssistito": "22/10/1955",
    "cfAssistito": "VRDGPP55R22H501W",
    "indirizzoAssistito": "Piazza Navona 50",
    "capAssistito": "00186",
    "cittaAssistito": "Roma",
    "provinciaAssistito": "RM",
    "telefonoAssistito": "+39 333 9876543",
    "emailAssistito": "giuseppe.verdi@example.com",
    "pacchetto": "ADVANCED",
    "vuoleContratto": true,
    "vuoleBrochure": false,
    "vuoleManuale": false,
    "fonte": "LANDING_PAGE",
    "cfRichiedente": "PGGRBR70A01F205Z",
    "indirizzoRichiedente": "Corso Buenos Aires 45",
    "capRichiedente": "20100",
    "cittaRichiedente": "Milano",
    "provinciaRichiedente": "MI"
  }'
```

Poi firma il contratto ADVANCED come nello STEP 2.

## 🔍 Verifica

### Database Check

```sql
-- Verifica leads creati
SELECT id, nomeRichiedente, cognomeRichiedente, tipoServizio, status 
FROM leads 
ORDER BY created_at DESC 
LIMIT 5;

-- Verifica contratti generati
SELECT id, codice_contratto, contract_type, status, created_at
FROM contracts 
ORDER BY created_at DESC 
LIMIT 5;

-- Verifica firme
SELECT id, contract_id, signature_type, created_at
FROM signatures
ORDER BY created_at DESC
LIMIT 5;

-- Verifica proforma generate
SELECT id, numero_proforma, tipo_servizio, prezzo_totale, status
FROM proforma
ORDER BY created_at DESC
LIMIT 5;
```

### Email Check

Controllare rpoggi55@gmail.com per:

1. **Email "Richiesta ricevuta"** - con link documenti
2. **Email "Contratto TeleMedCare"** - con:
   - PDF contratto (BASE o ADVANCED)
   - Brochure (se richiesta)
   - Manuale (se richiesto)
3. **Email "Proforma per pagamento"** - con:
   - PDF proforma
   - Istruzioni pagamento

### PDF Check

Scaricare i PDF allegati e verificare:

**Contratto BASE:**
- [ ] Titolo "SCRITTURA PRIVATA"
- [ ] Dati Medica GB S.r.l. completi
- [ ] Dati cliente (Roberto Poggi)
- [ ] Dati assistito (Maria Rossi)
- [ ] Sezione "Servizio di TeleAssistenza base"
- [ ] Tutte le funzioni del dispositivo SiDLY
- [ ] Tariffa: €480.00 + IVA 22%
- [ ] IBAN: IT97L0503401727000000003519
- [ ] Footer Medica GB completo

**Contratto ADVANCED:**
- [ ] Come sopra ma con "Servizio di TeleAssistenza Avanzata"
- [ ] Tariffa: €840.00 + IVA 22%
- [ ] Riferimento a "familiari/Centrale Operativa"

**Proforma:**
- [ ] Titolo "PRO FORMA MEDICA GB SRL"
- [ ] Anagrafica paziente completa
- [ ] Descrizione SiDLY Care PRO con serial number
- [ ] Totale con IVA 22%
- [ ] Coordinate bancarie BANCA BPM
- [ ] IBAN: IT97L0503401727000000003519
- [ ] Nota legale art.6 DPR 633

### Placeholder Check

Verificare che nelle email i seguenti placeholder siano sostituiti:

- [ ] {{NOME_CLIENTE}} → Roberto
- [ ] {{COGNOME_CLIENTE}} → Poggi
- [ ] {{NOME_ASSISTITO}} → Maria / Giuseppe
- [ ] {{COGNOME_ASSISTITO}} → Rossi / Verdi
- [ ] {{TIPO_SERVIZIO}} → BASE / ADVANCED
- [ ] {{DATA_CONTRATTO}} → data corrente
- [ ] {{NUMERO_PROFORMA}} → PRF-2024-XXXXXX

## ✅ Criteri di Successo

1. ✅ Contratti BASE e ADVANCED generati con contenuto esatto da template DOCX
2. ✅ Firma contratto funziona e salva nel database
3. ✅ Proforma generata automaticamente dopo firma
4. ✅ Email inviate con allegati corretti
5. ✅ Tutti i placeholder sostituiti correttamente
6. ✅ Database aggiornato con tutti i record

## 🐛 Problemi Noti

Nessuno al momento - prima implementazione completa!

## 📊 Report per Roberto

Da compilare dopo i test:

- **Contratti generati**: [BASE: X, ADVANCED: Y]
- **Firme processate**: [X]
- **Proforma generate**: [X]
- **Email inviate**: [X]
- **Errori riscontrati**: [Nessuno / Lista errori]

---

**Creato**: 2025-11-07
**Versione**: V11.0 - Complete Workflow Implementation
**Autore**: Claude AI Assistant per Roberto Poggi
