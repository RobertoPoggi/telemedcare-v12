# 🚨 PROBLEMI AMBIENTE PREVIEW - Test E2E

## ❌ Problema 1: Brochure ancora rotta (4.9 KB)

**Test effettuato**: Preview environment (https://test-environment.telemedcare-v12.pages.dev)  
**Azione**: "Invia Contratto" da dashboard  
**Risultato**: Email ricevuta con brochure rotta 4.9 KB invece di 1.7/2.6 MB

**Causa**: Cloudflare Pages serve ancora la build vecchia (pre-fix `b1c6b30`)
- Codice aggiornato: ✅ Commit b1c6b30 pushed
- File PDF corretti: ✅ public/documents/ contiene PDF leggibili
- Build deployment: ❌ Preview environment non ha rebuild

**Soluzione**: Forzare redeploy con commit trigger

---

## ❌ Problema 2: Pagamento Stripe rifiutato

**Test effettuato**: Preview environment  
**Azione**: Pagamento con carta test Stripe  
**Risultato**: Errore "La tua carta è stata rifiutata. La richiesta era in modalità live, ma è stata utilizzata una carta di test conosciuta."

**Screenshot errore**: 
```
❌ Errore
La tua carta è stata rifiutata. La richiesta era in modalità live, ma è stata 
utilizzata una carta di test conosciuta.
```

**Causa**: Chiavi Stripe PRODUCTION configurate su Preview environment invece di TEST

**Variabili d'ambiente Cloudflare Pages**:
- ❌ Preview usa: `STRIPE_PUBLIC_KEY` = pk_live_... (PRODUCTION)
- ❌ Preview usa: `STRIPE_SECRET_KEY` = sk_live_... (PRODUCTION)

**Dovrebbe usare**:
- ✅ Preview: `STRIPE_PUBLIC_KEY` = pk_test_...
- ✅ Preview: `STRIPE_SECRET_KEY` = sk_test_...

---

## ✅ Soluzioni

### 1. Forzare Redeploy (Brochure Fix)

Creato file `.trigger-deploy` per forzare rebuild Cloudflare Pages.

**Steps manuali necessari**:
1. Vai su Cloudflare Dashboard
2. Pages → telemedcare-v12 → Deployments
3. Click "Retry deployment" sull'ultimo deployment
4. Oppure: attendi che il nuovo commit triggheri automaticamente

**Verifica dopo deploy**:
```bash
# Test brochure PREMIUM (1.7 MB)
curl -I https://test-environment.telemedcare-v12.pages.dev/documents/Medica_GB_SiDLY_Vital_Care_ITA.pdf

# Test brochure PRO (2.6 MB)
curl -I https://test-environment.telemedcare-v12.pages.dev/documents/Medica_GB_SiDLY_Care_PRO_ITA.pdf

# Verifica Content-Length > 1.5 MB
```

---

### 2. Configurare Chiavi Stripe TEST su Preview

**Cloudflare Dashboard → Pages → telemedcare-v12 → Settings → Environment Variables**

**Environment**: `Preview` (NON Production)

**Variabili da aggiornare**:
```
STRIPE_PUBLIC_KEY = pk_test_51QRb5pBhLZjOCuWK... (SOSTITUISCI)
STRIPE_SECRET_KEY = sk_test_51QRb5pBhLZjOCuWK... (SOSTITUISCI)
```

**⚠️ IMPORTANTE**: 
- Preview = TEST keys (pk_test_..., sk_test_...)
- Production = LIVE keys (pk_live_..., sk_live_...)

**Dopo modifica variabili**:
- Cloudflare rebuilda automaticamente il preview
- Oppure: Trigger manual redeploy

---

## 🧪 Test Completo E2E (Dopo Fix)

### Prerequisiti
1. ✅ Preview environment deployed con commit `b1c6b30`
2. ✅ Chiavi Stripe TEST configurate su Preview
3. ✅ File PDF corretti in public/documents/

### Steps Test
1. **Lead Creation**
   - Vai su: https://test-environment.telemedcare-v12.pages.dev
   - Crea lead "Mario Rossi" servizio "eCura PREMIUM AVANZATO"
   - Completa tutti i campi obbligatori

2. **Invio Contratto**
   - Dashboard → Lead "Mario Rossi"
   - Click "📄 Invia Contratto"
   - ✅ Verifica email con 2 allegati:
     - Contratto_CTR-ROSSI-2026.pdf (~30 KB)
     - **Medica_GB_SiDLY_Vital_Care_ITA.pdf (1.7 MB)** ← Verifica dimensione!

3. **Firma Contratto**
   - Apri email contratto
   - Click link firma DocuSign
   - Firma digitalmente
   - ✅ Webhook DocuSign → genera proforma

4. **Pagamento Stripe**
   - Ricevi email proforma
   - Click "PAGA ORA €1.207,80"
   - **Carta TEST Stripe**:
     - Numero: `4242 4242 4242 4242`
     - Scadenza: `12/34`
     - CVC: `123`
     - ZIP: `12345`
   - ✅ Pagamento accettato (con chiavi TEST)
   - ✅ Webhook Stripe → email configurazione

5. **Email Post-Pagamento**
   - ✅ Ricevi email "⚙️ Completa la Configurazione del tuo SiDLY Vital Care"
   - ✅ Layout professionale (gradient viola/blu)
   - ✅ Link form configurazione funzionante

---

## 📊 Checklist Verifica

- [ ] Preview deployed con commit `b1c6b30` o successivo
- [ ] Brochure PDF 1.7 MB o 2.6 MB (NON 4.9 KB)
- [ ] Chiavi Stripe TEST su Preview environment
- [ ] Pagamento carta test accettato
- [ ] Email configurazione post-pagamento ricevuta
- [ ] Layout email configurazione professionale

---

**Creato**: 08 Marzo 2026  
**Issue**: Preview environment con codice vecchio + chiavi Stripe LIVE  
**Status**: 🔄 In attesa di redeploy
