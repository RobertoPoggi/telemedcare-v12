# 🚀 Ambiente di Sviluppo GitHub + Sandbox - TeleMedCare V11

## ✅ **CONFIGURAZIONE COMPLETATA**

### 📊 **Specifiche Sandbox Ad Alte Prestazioni**
- **CPU:** 4 cores
- **RAM:** 7.8 GB
- **Node.js:** v20.19.5
- **NPM:** 10.8.2
- **Git:** 2.39.5

### 🔗 **Repository GitHub**
- **URL:** https://github.com/RobertoPoggi/telemedcare-v11
- **Branch principale:** `main`
- **Branch disponibili:**
  - `main` (attuale)
  - `genspark_ai_developer` (development)
  - `fix/email-workflow-data-mapping`
  - `fix/email-working-clean`

### 👤 **Configurazione Git**
- **User:** RobertoPoggi
- **Email:** Configurato automaticamente
- **Autenticazione:** ✅ Configurata con token GitHub

---

## 🔧 **COMANDI ESSENZIALI**

### **1. 📥 Sincronizzazione Repository**

```bash
# Aggiorna dal repository remoto
cd /home/user/webapp && git fetch origin

# Controlla stato
cd /home/user/webapp && git status

# Pull modifiche (se necessario)
cd /home/user/webapp && git pull origin main
```

### **2. 🔄 Gestione Branch**

```bash
# Switch al branch di sviluppo
cd /home/user/webapp && git checkout genspark_ai_developer

# Crea nuovo branch per feature
cd /home/user/webapp && git checkout -b feature/nome-feature

# Torna al main
cd /home/user/webapp && git checkout main

# Lista tutti i branch
cd /home/user/webapp && git branch -a
```

### **3. 💾 Commit e Push**

```bash
# Aggiungi modifiche
cd /home/user/webapp && git add .

# Commit con messaggio
cd /home/user/webapp && git commit -m "feat: descrizione modifica"

# Push su GitHub
cd /home/user/webapp && git push origin nome-branch

# Push forzato (dopo rebase)
cd /home/user/webapp && git push -f origin nome-branch
```

### **4. 🔀 Workflow Pull Request**

```bash
# 1. Sincronizza con main
cd /home/user/webapp && git fetch origin main

# 2. Rebase sul main
cd /home/user/webapp && git rebase origin/main

# 3. Risolvi eventuali conflitti
cd /home/user/webapp && git status
# (edita file con conflitti)
cd /home/user/webapp && git add file-risolti
cd /home/user/webapp && git rebase --continue

# 4. Squash commits (combina N commit in uno)
cd /home/user/webapp && git reset --soft HEAD~N
cd /home/user/webapp && git commit -m "feat: descrizione completa"

# 5. Push e crea PR
cd /home/user/webapp && git push -f origin nome-branch
# Poi vai su GitHub e crea la Pull Request
```

---

## 🛠️ **WORKFLOW COMPLETO SVILUPPO**

### **Scenario 1: Iniziare Nuova Feature**

```bash
# 1. Assicurati di essere aggiornato
cd /home/user/webapp && git checkout main
cd /home/user/webapp && git pull origin main

# 2. Crea branch per feature
cd /home/user/webapp && git checkout -b feature/nuova-funzione

# 3. Lavora sul codice
# (modifica file, sviluppa feature)

# 4. Test locale
cd /home/user/webapp && npm run build
cd /home/user/webapp && npm run dev

# 5. Commit modifiche
cd /home/user/webapp && git add .
cd /home/user/webapp && git commit -m "feat: aggiunta nuova funzione"

# 6. Push su GitHub
cd /home/user/webapp && git push origin feature/nuova-funzione

# 7. Crea Pull Request su GitHub
```

### **Scenario 2: Correzione Bug Urgente**

```bash
# 1. Branch hotfix da main
cd /home/user/webapp && git checkout main
cd /home/user/webapp && git checkout -b hotfix/descrizione-bug

# 2. Correggi bug
# (modifica codice)

# 3. Test e commit
cd /home/user/webapp && npm run build
cd /home/user/webapp && git add .
cd /home/user/webapp && git commit -m "fix: risolto bug critico"

# 4. Push e PR
cd /home/user/webapp && git push origin hotfix/descrizione-bug
```

### **Scenario 3: Sync con Branch Development**

```bash
# 1. Switch a genspark_ai_developer
cd /home/user/webapp && git checkout genspark_ai_developer

# 2. Pull ultime modifiche
cd /home/user/webapp && git pull origin genspark_ai_developer

# 3. Merge da main (se necessario)
cd /home/user/webapp && git merge origin/main

# 4. Risolvi conflitti se presenti
cd /home/user/webapp && git status
# (edita file conflittuali)
cd /home/user/webapp && git add .
cd /home/user/webapp && git commit -m "merge: sync con main"

# 5. Push
cd /home/user/webapp && git push origin genspark_ai_developer
```

---

## 🧪 **TESTING E VALIDAZIONE**

### **Test Locale Prima di Push**

```bash
# 1. Build completo
cd /home/user/webapp && npm run build

# 2. Test unitari (se configurati)
cd /home/user/webapp && npm test

# 3. Test email workflow
cd /home/user/webapp && ./test_complete_workflow.py

# 4. Verifica linting
cd /home/user/webapp && npm run lint
```

### **Verifica Modifiche Prima di Commit**

```bash
# Vedi file modificati
cd /home/user/webapp && git status

# Vedi differenze nel codice
cd /home/user/webapp && git diff

# Vedi differenze solo file staged
cd /home/user/webapp && git diff --staged

# Log delle modifiche recenti
cd /home/user/webapp && git log --oneline -10
```

---

## 🔐 **BEST PRACTICES SICUREZZA**

### **File da NON Committare Mai**

Questi file sono già nel `.gitignore`:
- `.env` - Variabili ambiente locali
- `.dev.vars` - API keys di sviluppo
- `node_modules/` - Dipendenze
- `.wrangler/` - Cache Wrangler
- `dist/` - Build output

### **Verifica Prima di Commit**

```bash
# Controlla che non ci siano secrets
cd /home/user/webapp && git diff | grep -E "(API_KEY|SECRET|PASSWORD)"

# Controlla file tracked
cd /home/user/webapp && git status

# Se hai committato per errore un secret:
cd /home/user/webapp && git reset HEAD file-con-secret
cd /home/user/webapp && git checkout -- file-con-secret
```

---

## 📋 **CONVENTIONAL COMMITS**

Usa questi prefissi per i commit:

```bash
feat:     # Nuova feature
fix:      # Bug fix
docs:     # Solo documentazione
style:    # Formattazione, no logic change
refactor: # Refactoring codice
test:     # Aggiunta test
chore:    # Maintenance, dipendenze
```

**Esempi:**
```bash
cd /home/user/webapp && git commit -m "feat: aggiungi dashboard dispositivi"
cd /home/user/webapp && git commit -m "fix: correggi email failover"
cd /home/user/webapp && git commit -m "docs: aggiorna README con istruzioni API"
cd /home/user/webapp && git commit -m "refactor: ottimizza query database"
```

---

## 🚨 **TROUBLESHOOTING COMUNE**

### **Problema: "Your branch is behind origin/main"**
```bash
cd /home/user/webapp && git pull origin main
```

### **Problema: Conflitti durante merge**
```bash
# 1. Vedi file in conflitto
cd /home/user/webapp && git status

# 2. Edita manualmente i file (rimuovi <<<<<<, ======, >>>>>>)
# 3. Aggiungi file risolti
cd /home/user/webapp && git add file-risolto.ts

# 4. Continua merge/rebase
cd /home/user/webapp && git rebase --continue
# oppure
cd /home/user/webapp && git merge --continue
```

### **Problema: Commit sbagliato**
```bash
# Annulla ultimo commit (mantieni modifiche)
cd /home/user/webapp && git reset --soft HEAD~1

# Annulla ultimo commit (rimuovi modifiche)
cd /home/user/webapp && git reset --hard HEAD~1
```

### **Problema: Push rejected**
```bash
# Pull prima di pushare
cd /home/user/webapp && git pull --rebase origin nome-branch
cd /home/user/webapp && git push origin nome-branch
```

---

## 🎯 **LINKS UTILI**

- **Repository:** https://github.com/RobertoPoggi/telemedcare-v11
- **Issues:** https://github.com/RobertoPoggi/telemedcare-v11/issues
- **Pull Requests:** https://github.com/RobertoPoggi/telemedcare-v11/pulls
- **Actions (CI/CD):** https://github.com/RobertoPoggi/telemedcare-v11/actions

---

## ⚡ **VANTAGGI SANDBOX AD ALTE PRESTAZIONI**

### **Performance Ottimizzate**
- ✅ Build 2-3x più veloce
- ✅ `npm install` ridotto da 60s a ~20s
- ✅ Hot reload <300ms
- ✅ Git operations istantanee
- ✅ 4 CPU cores per build parallelo

### **Resource Availability**
- ✅ 7.8GB RAM per progetti large
- ✅ Multi-tasking fluido (build + test + dev server)
- ✅ Database operations più veloci

---

## 📞 **SUPPORTO E DOCUMENTAZIONE**

### **Documentazione Progetto**
- `README.md` - Panoramica generale
- `SETUP-NEW-SANDBOX.md` - Setup sandbox
- `STRUCTURE.md` - Architettura modulare
- `SECURITY.md` - Best practices sicurezza
- Questo file - Workflow GitHub

### **Ultimo Commit**
```
5d3f017 fix(templates): correggi query lookup template da WHERE name a WHERE id
```

---

**🎉 Ambiente Pronto!**  
Puoi iniziare a sviluppare con:
```bash
cd /home/user/webapp && git checkout genspark_ai_developer
cd /home/user/webapp && npm run dev
```

*Creato: 2025-11-07*  
*Versione: TeleMedCare V11.0*  
*Sandbox: High Performance BETA PLUS*
