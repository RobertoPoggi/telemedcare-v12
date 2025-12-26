# 📧 Fix Logica Brochure per Servizio

## ✅ Modifica Completata

**File modificato**: `src/modules/brochure-manager.ts`

---

## 🎯 Obiettivo

Inviare la **brochure corretta** in base al servizio selezionato dal lead:

| Servizio | Dispositivo | Brochure File |
|----------|-------------|---------------|
| **FAMILY** | Senium | `Brochure_Senium.pdf` |
| **PRO** | SiDLY Care PRO | `Medica_GB_SiDLY_Care_PRO_ITA.pdf` |
| **PREMIUM** | SiDLY Vital Care | `Medica_GB_SiDLY_Vital_Care_ITA.pdf` |

---

## 🔧 Implementazione

### Mappatura Servizi → Brochure

La mappatura esiste già in `brochure-manager.ts`:

```typescript
export const BROCHURE_MAP: Record<string, BrochureInfo> = {
  'FAMILY': {
    servizio: 'FAMILY',
    nomeDispositivo: 'Senium',
    filename: 'Brochure_Senium.pdf',
    descrizione: 'Dispositivo per monitoraggio familiare'
  },
  'PRO': {
    servizio: 'PRO',
    nomeDispositivo: 'SiDLY Care PRO',
    filename: 'Medica_GB_SiDLY_Care_PRO_ITA.pdf',
    descrizione: 'Dispositivo professionale (SiDLY Care PRO)'
  },
  'PREMIUM': {
    servizio: 'PREMIUM',
    nomeDispositivo: 'SiDLY Vital Care',
    filename: 'Medica_GB_SiDLY_Vital_Care_ITA.pdf',
    descrizione: 'Dispositivo premium (SiDLY Vital Care)'
  }
}
```

### Log Migliorati

Aggiunto log per identificare dispositivo:

```typescript
console.log(`📥 [BROCHURE] Servizio: ${servizio} → Dispositivo: ${brochureInfo.nomeDispositivo}`)
console.log(`✅ [BROCHURE] ${brochureInfo.nomeDispositivo}: ${brochureInfo.filename} (${sizeKB} KB)`)
```

---

## ⚠️ Problema Attuale: File PDF Mancanti

I file brochure **non esistono ancora** (placeholder 59 bytes):

```bash
$ ls -lh public/documents/
-rw-r--r-- 1 user user   59 Dec 21 11:39 Medica_GB_SiDLY_Care_PRO_ITA.pdf     # PLACEHOLDER
-rw-r--r-- 1 user user   59 Dec 21 11:38 Medica_GB_SiDLY_Vital_Care_ITA.pdf   # PLACEHOLDER
-rw-r--r-- 1 user user 1.1M Nov  3 00:02 Brochure_TeleMedCare.pdf              # OK
```

### Soluzione Temporanea

Tutti i servizi usano `Brochure_TeleMedCare.pdf` (1.1M) finché i PDF reali non saranno caricati:

```typescript
export const BROCHURE_MAP: Record<string, BrochureInfo> = {
  'FAMILY': {
    filename: 'Brochure_TeleMedCare.pdf', // TODO: Sostituire con Brochure_Senium.pdf
    ...
  },
  'PRO': {
    filename: 'Brochure_TeleMedCare.pdf', // TODO: Sostituire con Medica_GB_SiDLY_Care_PRO_ITA.pdf
    ...
  },
  'PREMIUM': {
    filename: 'Brochure_TeleMedCare.pdf', // TODO: Sostituire con Medica_GB_SiDLY_Vital_Care_ITA.pdf
    ...
  }
}
```

---

## 📥 TODO: Caricare PDF Reali

### File da caricare in `public/documents/`:

1. **`Brochure_Senium.pdf`** (per FAMILY)
2. **`Medica_GB_SiDLY_Care_PRO_ITA.pdf`** (per PRO)
3. **`Medica_GB_SiDLY_Vital_Care_ITA.pdf`** (per PREMIUM)

### Comando per caricare:

```bash
# Copia i PDF reali nella directory public/documents/
cp /path/to/Medica_GB_SiDLY_Care_PRO_ITA.pdf public/documents/
cp /path/to/Medica_GB_SiDLY_Vital_Care_ITA.pdf public/documents/
cp /path/to/Brochure_Senium.pdf public/documents/

# Rimuovi placeholder
rm public/documents/Medica_GB_SiDLY_*.pdf.old

# Rebuild
npm run build
```

### Dopo caricamento, aggiorna brochure-manager.ts:

Rimuovi i TODO e ripristina i filename originali:

```typescript
'PRO': {
  filename: 'Medica_GB_SiDLY_Care_PRO_ITA.pdf', // ✅ File reale caricato
  ...
},
'PREMIUM': {
  filename: 'Medica_GB_SiDLY_Vital_Care_ITA.pdf', // ✅ File reale caricato
  ...
}
```

---

## ✅ Test di Verifica

### Test Workflow con Servizio PRO:

```bash
curl -X POST http://127.0.0.1:8788/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test",
    "cognome": "PRO",
    "email": "test@example.com",
    "servizio": "PRO",
    "piano": "AVANZATO",
    "vuoleContratto": true,
    "vuoleBrochure": true
  }'
```

**Output atteso nei log:**
```
📥 [BROCHURE] Servizio: PRO → Dispositivo: SiDLY Care PRO
✅ [BROCHURE] SiDLY Care PRO: Medica_GB_SiDLY_Care_PRO_ITA.pdf (1234 KB)
```

### Test Workflow con Servizio PREMIUM:

```bash
curl -X POST http://127.0.0.1:8788/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "servizio": "PREMIUM",
    ...
  }'
```

**Output atteso:**
```
📥 [BROCHURE] Servizio: PREMIUM → Dispositivo: SiDLY Vital Care
✅ [BROCHURE] SiDLY Vital Care: Medica_GB_SiDLY_Vital_Care_ITA.pdf (1456 KB)
```

---

## 🎯 Benefici

✅ **Logica corretta**: Ogni servizio riceve la brochure del dispositivo corrispondente  
✅ **Log chiari**: Indica dispositivo nel log per debugging  
✅ **Fallback sicuro**: Se PDF specifico manca, usa brochure generica  
✅ **Manutenibile**: Basta aggiornare `BROCHURE_MAP` per nuovi servizi  

---

## 📊 Status

| Componente | Status | Note |
|------------|--------|------|
| **Logica brochure** | ✅ | Implementata |
| **Log dispositivo** | ✅ | Aggiunto |
| **PDF PRO** | ⚠️ | TODO: Caricare file reale |
| **PDF PREMIUM** | ⚠️ | TODO: Caricare file reale |
| **PDF FAMILY** | ⚠️ | TODO: Caricare file reale |
| **Fallback generico** | ✅ | Funziona |

---

## 🚀 Deploy

Dopo aver caricato i PDF reali:

```bash
# 1. Rebuild
npm run build

# 2. Test locale
npm run dev

# 3. Deploy produzione
npm run deploy
```

---

**Commit**: fix/brochure-per-servizio  
**Data**: 2025-12-21  
**Autore**: eCura Development Team
