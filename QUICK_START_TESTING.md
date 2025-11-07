# 🚀 Quick Start - Testing TeleMedCare V11.0

## Per Roberto - Come Testare Tutto il Sistema

### 📝 Recap dei Fix Implementati

Tutti i 6 fix critici che hai segnalato sono stati implementati:

1. ✅ **Email notifica info@** - Include TUTTI i campi (condizioniSalute, urgenzaRisposta, giorniRisposta, note)
2. ✅ **Contratto indirizzato correttamente** - Usa intestatario (richiedente o assistito) non solo assistito
3. ✅ **Placeholder email sostituiti** - Tutti i {{TIPO_SERVIZIO}}, {{NOME_CLIENTE}}, etc. vengono sostituiti
4. ✅ **Campo intestazioneContratto** - Implementata la logica di swap richiedente/assistito
5. ✅ **Campi completi per Stripe** - CAP, città, provincia, indirizzo, telefono, email
6. ✅ **Campi completi per DocuSign** - Email intestatario (CRITICO), telefono, nome completo

### 🧪 Test Automatici - Come Eseguirli

#### Step 1: Avvia il Server
```bash
cd /home/user/webapp
npm run dev
```

Attendi che il server sia pronto su http://localhost:3000

#### Step 2: Esegui i Test (in un altro terminale)
```bash
cd /home/user/webapp
./run_comprehensive_tests.sh
```

Questo script eseguirà automaticamente:
- ✅ TEST 1: Workflow BASE con contratto intestato al RICHIEDENTE
- ✅ TEST 2: Workflow AVANZATO con contratto intestato all'ASSISTITO
- ✅ TEST 3: Flussi lead da partner (IRBEMA, Luxottica, Pirelli, FAS)
- ✅ TEST 4: Verifica di tutti i 6 template email

### 📊 Cosa Verificare Manualmente

#### 1. Email Notifica Info@
Controlla che l'email a **info@telemedcare.it** contenga:
- Nome e cognome RICHIEDENTE
- Nome e cognome ASSISTITO (se diverso)
- **Condizioni salute** del paziente
- **Urgenza risposta** (Alta/Media/Bassa)
- **Giorni per risposta**
- Note aggiuntive
- **Intestazione contratto** scelta (richiedente o assistito)

#### 2. Contratto PDF
Controlla che il contratto PDF sia indirizzato alla persona corretta:

**TEST 1 - BASE**: 
- Contratto intestato a: **Roberto Poggi** (richiedente)
- Non deve essere intestato a Rosaria Ressa (assistito)
- Email per DocuSign: roberto.poggi@test.com

**TEST 2 - AVANZATO**:
- Contratto intestato a: **Anna Verdi** (assistito)
- Non deve essere intestato a Marco Bianchi (richiedente)
- Email per DocuSign: anna.verdi@test.com

Verifica che NON ci sia "DA FORNIRE" per:
- Codice Fiscale
- Indirizzo completo (Via, CAP, Città, Provincia)
- Telefono
- Email

#### 3. Email con Placeholder
Controlla tutte le email ricevute e verifica che:
- ❌ NON ci siano placeholder tipo {{TIPO_SERVIZIO}}
- ✅ Tutti i placeholder siano sostituiti con dati reali
- ✅ I dati siano corretti (nome giusto, servizio giusto, importo giusto)

#### 4. Proforma
Dopo la firma del contratto, verifica:
- ✅ Proforma generata automaticamente
- ✅ Email proforma inviata
- ✅ Importo corretto (BASE: €585.60, AVANZATO: €1025.60)

### 🎯 Scenari di Test

#### Scenario A: Richiedente Paga per l'Assistito (TEST 1)
```
Richiedente: Roberto Poggi (paga e firma)
Assistito: Rosaria Ressa (riceve il servizio)
Contratto intestato a: RICHIEDENTE
Email DocuSign: roberto.poggi@test.com
Stripe billing: Dati di Roberto Poggi
```

#### Scenario B: Assistito Paga per Sé Stesso (TEST 2)
```
Richiedente: Marco Bianchi (fa la richiesta)
Assistito: Anna Verdi (riceve il servizio, paga e firma)
Contratto intestato a: ASSISTITO
Email DocuSign: anna.verdi@test.com
Stripe billing: Dati di Anna Verdi
```

### 📧 I 6 Template Email da Verificare

1. **email_notifica_info** → info@telemedcare.it
   - Quando: Subito dopo creazione lead
   - Verifica: Tutti i campi presenti (condizioniSalute, urgenzaRisposta, etc.)

2. **email_documenti_informativi** → Email cliente
   - Quando: Se richiesti brochure/manuale
   - Verifica: Link ai documenti, nome cliente corretto

3. **email_invio_contratto** → Email intestatario
   - Quando: Dopo generazione contratto
   - Verifica: Nome cliente, tipo servizio, piano servizio

4. **email_invio_proforma** → Email intestatario
   - Quando: Dopo firma contratto
   - Verifica: Importo totale, scadenza pagamento, tipo servizio

5. **email_benvenuto** → Email cliente
   - Quando: Dopo pagamento confermato
   - Verifica: Codice cliente, link form configurazione

6. **email_conferma_attivazione** → Email cliente
   - Quando: Dopo associazione dispositivo
   - Verifica: Codice dispositivo, IMEI, numero SIM

### 🔍 Checklist Verifica Completa

Dopo aver eseguito i test, spunta:

- [ ] Server avviato senza errori
- [ ] Test script eseguito senza crash
- [ ] TEST 1 completato (workflow BASE richiedente)
- [ ] TEST 2 completato (workflow AVANZATO assistito)
- [ ] TEST 3 completato (partner sources)
- [ ] Email notifica info@ ricevuta con tutti i campi
- [ ] Contratto TEST 1 intestato a Roberto Poggi
- [ ] Contratto TEST 2 intestato a Anna Verdi
- [ ] Nessun "DA FORNIRE" nei contratti
- [ ] Tutti i placeholder email sostituiti
- [ ] Proforma generata dopo firma
- [ ] Email proforma ricevuta
- [ ] Tutti i 6 template email funzionanti
- [ ] Partner lead sources funzionanti

### 🐛 Se Qualcosa Non Funziona

#### Il server non parte
```bash
# Pulisci la porta 3000
npm run clean-port
# Riavvia
npm run dev
```

#### I test falliscono
```bash
# Controlla i log del server
# Guarda l'output colorato dei test per capire dove fallisce
# Controlla il file test_results_*.json per dettagli
```

#### Email non arrivano
- Verifica che le API key email siano configurate (SENDGRID_API_KEY o RESEND_API_KEY)
- Controlla i log del server per errori di invio email
- Verifica che i template email esistano nel database

#### Contratto indirizzato male
- Controlla il campo `intestazioneContratto` nel lead
- Verifica i log per vedere quale logica di swap è stata usata
- Leggi FIXES_ROBERTO_CRITICAL.md per i dettagli del fix

### 📁 File Importanti

- `test_comprehensive_roberto.py` - Script test principale
- `run_comprehensive_tests.sh` - Launcher script con checks
- `TEST_SUITE_DOCUMENTATION.md` - Documentazione completa
- `FIXES_ROBERTO_CRITICAL.md` - Dettagli dei 6 fix critici

### 🎉 Prossimi Step

Una volta che tutti i test passano:

1. **Pulire dati mock** dal database
2. **Integrare DocuSign** per firma elettronica reale
3. **Integrare Stripe** per pagamenti reali (test mode prima)
4. **Testare con dati reali** (non simulati)
5. **Deploy in produzione** quando tutto OK

---

**Domande?** Controlla TEST_SUITE_DOCUMENTATION.md per guida completa!
