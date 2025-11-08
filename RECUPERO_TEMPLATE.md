# 🔧 GUIDA AL RECUPERO DEI TEMPLATE EMAIL

## 📅 Data Backup: 8 Novembre 2025, ore 11:55 AM

Questa guida spiega come ripristinare i template email funzionanti che erano in uso alle 11:55 del 8 novembre 2025.

---

## 📦 File Disponibili

### 1. `RESTORE_WORKING_TEMPLATES.sql` (74 KB)
**Contenuto**: Script SQL completo per ripristinare tutti i 10 template email con i placeholders corretti.

**Utilizzo**:
- Per database locale (sviluppo)
- Per database Cloudflare D1 (produzione)

### 2. `BACKUP_WORKING_DATABASE_11-55AM.sqlite` (1.7 MB)
**Contenuto**: Copia completa del database SQLite locale funzionante delle 11:55 AM.

**Utilizzo**:
- Backup di sicurezza
- Analisi e verifica template
- Ripristino completo del database locale

---

## 🎯 Template Ripristinati

Tutti i 10 template email con **101 placeholders totali**:

### 1. **Benvenuto Cliente** (6 placeholders)
- `{{NOME_CLIENTE}}`, `{{CODICE_CLIENTE}}`, `{{PIANO_SERVIZIO}}`, ecc.

### 2. **Conferma Attivazione Servizio** (5 placeholders)
- `{{NOME_CLIENTE}}`, `{{CODICE_DISPOSITIVO}}`, `{{DATA_ATTIVAZIONE}}`, ecc.

### 3. **Conferma Generica** (5 placeholders)
- `{{NOME_CLIENTE}}`, `{{PIANO_SERVIZIO}}`, `{{DATA_ATTIVAZIONE}}`, ecc.

### 4. **Documenti Informativi** (4 placeholders)
- `{{NOME_CLIENTE}}`, `{{COGNOME_CLIENTE}}`, `{{BROCHURE_HTML}}`, `{{MANUALE_HTML}}`

### 5. **Invio Contratto** (6 placeholders)
- `{{NOME_CLIENTE}}`, `{{PIANO_SERVIZIO}}`, `{{PREZZO_PIANO}}`, `{{CODICE_CLIENTE}}`, ecc.

### 6. **Invio Proforma** (4 placeholders)
- `{{NOME_CLIENTE}}`, `{{NUMERO_PROFORMA}}`, `{{PIANO_SERVIZIO}}`, `{{PREZZO_PIANO}}`

### 7. **Notifica Configurazione Ricevuta** (12 placeholders)
- Dati richiedente, assistito, servizio, sistema

### 8. **Notifica Nuovo Lead** (41 placeholders) 🏆
- **IL PIÙ COMPLETO**: Tutti i dati lead, richiedente, assistito, contratto, preferenze

### 9. **Promemoria Generico** (10 placeholders)
- `{{NOME_CLIENTE}}`, `{{PIANO_SERVIZIO}}`, `{{DATA_SCADENZA}}`, `{{IBAN_AZIENDALE}}`, ecc.

### 10. **Promemoria Pagamento** (8 placeholders)
- `{{NOME_CLIENTE}}`, `{{IMPORTO_DOVUTO}}`, `{{DATA_SCADENZA}}`, `{{URL_PAGAMENTO}}`, ecc.

---

## 🔄 Come Ripristinare i Template

### Metodo 1: Database Locale (Sviluppo)

#### Opzione A - Usando Python (CONSIGLIATO)
```bash
cd /home/user/webapp

python3 << 'EOF'
import sqlite3

# Percorsi
db_backup = './BACKUP_WORKING_DATABASE_11-55AM.sqlite'
db_current = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/fefe357b0d78a8ad7bf1258d7c2ab0cf7acae5732cacf8116cc3090278c88fca.sqlite'

# Connessioni
conn_backup = sqlite3.connect(db_backup)
conn_current = sqlite3.connect(db_current)

# Elimina template correnti
conn_current.execute("DELETE FROM document_templates")

# Copia template da backup
templates = conn_backup.execute("SELECT * FROM document_templates").fetchall()
for t in templates:
    conn_current.execute("""
        INSERT INTO document_templates VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, t)

conn_current.commit()
print(f"✅ Ripristinati {len(templates)} template!")

conn_backup.close()
conn_current.close()
EOF
```

#### Opzione B - Usando il file SQL
```bash
# NON FUNZIONA con wrangler (non supporta stdin)
# Ma puoi copiare il contenuto di RESTORE_WORKING_TEMPLATES.sql
# e incollarlo manualmente in uno strumento SQLite
```

---

### Metodo 2: Database Cloudflare D1 (Produzione)

#### Passo 1: Accedi a Cloudflare Dashboard
1. Vai su https://dash.cloudflare.com
2. Naviga in **Workers & Pages** → **D1**
3. Seleziona il database **telemedcare-leads** (ID: `e6fd921d-06df-4b65-98f9-fce81ef78825`)

#### Passo 2: Apri Console SQL
4. Clicca su **"Console"** in alto
5. Si aprirà l'editor SQL

#### Passo 3: Copia e Incolla SQL
6. Apri il file `RESTORE_WORKING_TEMPLATES.sql`
7. Copia **TUTTO** il contenuto (1995 righe)
8. Incolla nella Console SQL di Cloudflare
9. Clicca **"Execute"**

#### Passo 4: Verifica
```sql
SELECT COUNT(*) as total FROM document_templates;
-- Deve restituire: total = 10

SELECT id, name, created_at FROM document_templates ORDER BY name;
-- Deve mostrare tutti i 10 template
```

---

## ⚠️ Note Importanti

### Formato Placeholders
Tutti i placeholder usano la sintassi **doppia graffa**:
```
{{NOME_VARIABILE}}
```

**NON** usare:
- `{NOME_VARIABILE}` ❌
- `$NOME_VARIABILE` ❌
- `%NOME_VARIABILE%` ❌

### Sostituzione Placeholders nel Codice
Il codice backend sostituisce i placeholder con valori reali usando:
```typescript
let content = template.html_content;
content = content.replace(/{{NOME_CLIENTE}}/g, leadData.nomeRichiedente);
content = content.replace(/{{COGNOME_CLIENTE}}/g, leadData.cognomeRichiedente);
// ... ecc per ogni placeholder
```

---

## 🧪 Come Testare i Template

### 1. Verifica Template nel Database
```bash
cd /home/user/webapp

python3 << 'EOF'
import sqlite3
import re

db = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/fefe357b0d78a8ad7bf1258d7c2ab0cf7acae5732cacf8116cc3090278c88fca.sqlite'
conn = sqlite3.connect(db)

templates = conn.execute("SELECT name, html_content FROM document_templates").fetchall()

for name, html in templates:
    placeholders = re.findall(r'{{([A-Z_]+)}}', html)
    print(f"\n{name}: {len(placeholders)} placeholders")
    print(f"  {', '.join(sorted(set(placeholders)))}")

conn.close()
EOF
```

### 2. Test Invio Email
1. Accedi all'Admin Dashboard: https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/admin-dashboard
2. Vai alla sezione **Lead**
3. Seleziona un lead di test
4. Clicca **"Invia Email Notifica"** o **"Invia Documenti Informativi"**
5. Controlla:
   - Email ricevuta
   - Placeholders sostituiti correttamente (NON devono apparire `{{...}}` nell'email)
   - HTML renderizzato correttamente

---

## 🚨 Troubleshooting

### Problema: Placeholders non sostituiti nell'email
**Sintomo**: Email contiene `{{NOME_CLIENTE}}` invece del nome reale

**Causa**: 
- Template non caricato correttamente dal database
- Codice di sostituzione non funzionante
- Variabile non passata al template

**Soluzione**:
1. Verifica template nel database con lo script di test
2. Controlla log del server per errori
3. Verifica che i dati lead siano completi

### Problema: Template non trovato
**Sintomo**: Errore "Template not found"

**Causa**: Template non presente nel database

**Soluzione**:
1. Esegui lo script di ripristino
2. Riavvia il server locale
3. Verifica con: `SELECT COUNT(*) FROM document_templates;`

### Problema: HTML non renderizzato
**Sintomo**: Email mostra codice HTML invece di pagina formattata

**Causa**: Email inviata come testo plain invece di HTML

**Soluzione**:
1. Verifica API Resend usa `html:` e non `text:`
2. Controlla header email (deve essere `Content-Type: text/html`)

---

## 📊 Statistiche Template

- **Totale template**: 10
- **Totale placeholders**: 101
- **Template più complesso**: Notifica Nuovo Lead (41 placeholders)
- **Template più semplice**: Documenti Informativi (4 placeholders)
- **Media placeholders**: 10.1 per template
- **Dimensione totale SQL**: 74 KB
- **Dimensione database backup**: 1.7 MB

---

## 🎯 Prossimi Passi

1. ✅ **Template ripristinati nel database locale**
2. ⏳ **Testare invio email in locale** 
3. ⏳ **Ripristinare template in produzione (Cloudflare D1)**
4. ⏳ **Testare invio email in produzione**
5. ⏳ **Verificare workflow completo Lead → Contract → Proforma → Payment**

---

## 📞 Supporto

In caso di problemi:
1. Controlla log del server: `tail -f /home/user/.config/.wrangler/logs/wrangler-*.log`
2. Verifica database: Script di test sopra
3. Verifica API Resend: https://resend.com/logs

---

**Ultimo aggiornamento**: 8 Novembre 2025, ore 22:17  
**Commit**: ee4196b  
**Repository**: https://github.com/RobertoPoggi/telemedcare-v11
