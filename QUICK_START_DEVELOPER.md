# ⚡ Quick Start Developer - TeleMedCare V11

## 🎯 **SETUP COMPLETATO - PRONTO ALL'USO!**

### ✅ **Ambiente Configurato**
- ✅ GitHub: Connesso a `https://github.com/RobertoPoggi/telemedcare-v11`
- ✅ User: RobertoPoggi
- ✅ Branch: `main` (puoi switchare a `genspark_ai_developer`)
- ✅ Node.js: v20.19.5
- ✅ NPM: 10.8.2
- ✅ Sandbox: 4 CPU cores, 7.8GB RAM

---

## 🚀 **START IN 30 SECONDI**

### **Opzione 1: Helper Interattivo (RACCOMANDATO)**
```bash
cd /home/user/webapp
./git-helper.sh
```

Segui il menu per:
- ✅ Vedere status
- ✅ Creare commit
- ✅ Fare push
- ✅ Preparare Pull Request

### **Opzione 2: Comandi Manuali**
```bash
# 1. Vai alla directory
cd /home/user/webapp

# 2. Controlla stato
git status

# 3. Switch a development branch (opzionale)
git checkout genspark_ai_developer

# 4. Inizia a sviluppare!
npm run dev
```

### **Opzione 3: Con Aliases (Ultra Veloce)**
```bash
# Carica gli aliases
source /home/user/webapp/.bash_aliases_telemedcare

# Ora puoi usare:
tele          # vai a /home/user/webapp
gs            # git status
gdev          # switch a genspark_ai_developer
dev           # npm run dev
build         # npm run build
status        # overview completo
ghelp         # apri helper interattivo
```

---

## 💻 **COMANDI ESSENZIALI**

### **Sviluppo Quotidiano**
```bash
# Status generale
cd /home/user/webapp && git status

# Pull ultime modifiche
cd /home/user/webapp && git pull origin main

# Crea feature branch
cd /home/user/webapp && git checkout -b feature/nome-feature

# Sviluppa e testa
cd /home/user/webapp && npm run build
cd /home/user/webapp && npm run dev

# Commit modifiche
cd /home/user/webapp && git add .
cd /home/user/webapp && git commit -m "feat: descrizione"

# Push
cd /home/user/webapp && git push origin feature/nome-feature
```

### **Preparare Pull Request**
```bash
# 1. Sync con main
cd /home/user/webapp && git fetch origin main
cd /home/user/webapp && git rebase origin/main

# 2. Squash commits (opzionale, combina 3 commit)
cd /home/user/webapp && git reset --soft HEAD~3
cd /home/user/webapp && git commit -m "feat: descrizione completa"

# 3. Push
cd /home/user/webapp && git push -f origin nome-branch

# 4. Crea PR su GitHub
# https://github.com/RobertoPoggi/telemedcare-v11/pulls
```

### **Testing**
```bash
# Build test
cd /home/user/webapp && npm run build

# Email workflow test
cd /home/user/webapp && ./test_complete_workflow.py

# Test specifici
cd /home/user/webapp && ./test_email_simple.sh
```

---

## 🌿 **BRANCH WORKFLOW**

### **Branch Disponibili**
- `main` - Branch principale (production)
- `genspark_ai_developer` - Development branch
- Altri feature/fix branches

### **Workflow Tipico**
```bash
# 1. Parti da main aggiornato
cd /home/user/webapp && git checkout main
cd /home/user/webapp && git pull origin main

# 2. Crea feature branch
cd /home/user/webapp && git checkout -b feature/nuova-funzione

# 3. Sviluppa
# (modifica codice)

# 4. Commit progressivi
cd /home/user/webapp && git add .
cd /home/user/webapp && git commit -m "feat: step 1"
# (continua sviluppo)
cd /home/user/webapp && git commit -m "feat: step 2"

# 5. Prepara PR (squash commits)
cd /home/user/webapp && git fetch origin main
cd /home/user/webapp && git rebase origin/main
cd /home/user/webapp && git reset --soft HEAD~2  # combina 2 commit
cd /home/user/webapp && git commit -m "feat: nuova funzione completa"

# 6. Push e crea PR
cd /home/user/webapp && git push -f origin feature/nuova-funzione
```

---

## 📝 **CONVENTIONAL COMMITS**

Usa sempre questi prefissi:

```bash
feat:      # Nuova feature
fix:       # Bug fix  
docs:      # Solo documentazione
style:     # Formattazione
refactor:  # Refactoring
test:      # Test
chore:     # Maintenance
```

**Esempi:**
```bash
git commit -m "feat: aggiungi dashboard dispositivi"
git commit -m "fix: correggi invio email"
git commit -m "docs: aggiorna README"
git commit -m "refactor: ottimizza query database"
```

---

## 🎯 **SCENARI COMUNI**

### **Scenario 1: Fix Bug Veloce**
```bash
cd /home/user/webapp
git checkout main
git checkout -b fix/nome-bug
# (correggi bug)
git add .
git commit -m "fix: risolto bug critico"
git push origin fix/nome-bug
# Crea PR su GitHub
```

### **Scenario 2: Nuova Feature**
```bash
cd /home/user/webapp
git checkout main
git pull origin main
git checkout -b feature/nome-feature
# (sviluppa feature)
npm run build  # test
git add .
git commit -m "feat: aggiunta nuova feature"
git push origin feature/nome-feature
# Crea PR su GitHub
```

### **Scenario 3: Continua Lavoro Esistente**
```bash
cd /home/user/webapp
git checkout genspark_ai_developer
git pull origin genspark_ai_developer
# (continua sviluppo)
git add .
git commit -m "feat: continuazione feature X"
git push origin genspark_ai_developer
```

---

## 🛠️ **TOOLS DISPONIBILI**

### **1. Git Helper (Interattivo)**
```bash
cd /home/user/webapp && ./git-helper.sh
```
Menu completo per tutte le operazioni Git.

### **2. Bash Aliases**
```bash
source /home/user/webapp/.bash_aliases_telemedcare
```
Shortcuts per comandi frequenti.

### **3. Test Scripts**
```bash
./test_complete_workflow.py       # Test workflow completo
./test_email_simple.sh            # Test email veloce
./test_document_generation.py     # Test generazione documenti
```

---

## 📚 **DOCUMENTAZIONE**

### **Guide Disponibili**
- `AMBIENTE_SVILUPPO_GITHUB.md` - Guida completa GitHub (⭐ LEGGI PRIMA)
- `README.md` - Overview progetto
- `SETUP-NEW-SANDBOX.md` - Setup sandbox
- `STRUCTURE.md` - Architettura
- `SECURITY.md` - Best practices sicurezza
- Questo file - Quick start

### **Links Utili**
- **Repo:** https://github.com/RobertoPoggi/telemedcare-v11
- **Issues:** https://github.com/RobertoPoggi/telemedcare-v11/issues
- **Pull Requests:** https://github.com/RobertoPoggi/telemedcare-v11/pulls
- **Actions:** https://github.com/RobertoPoggi/telemedcare-v11/actions

---

## 🚨 **TROUBLESHOOTING RAPIDO**

### **Problema: "Your branch is behind"**
```bash
cd /home/user/webapp && git pull origin main
```

### **Problema: Conflitti**
```bash
cd /home/user/webapp && git status  # vedi file in conflitto
# Edita file, rimuovi <<<<<<, ======, >>>>>>
cd /home/user/webapp && git add file-risolto
cd /home/user/webapp && git rebase --continue
```

### **Problema: Commit sbagliato**
```bash
# Annulla ultimo commit (mantieni modifiche)
cd /home/user/webapp && git reset --soft HEAD~1
```

### **Problema: Push rejected**
```bash
cd /home/user/webapp && git pull --rebase origin nome-branch
cd /home/user/webapp && git push origin nome-branch
```

---

## ⚡ **PERFORMANCE TIPS**

### **Build Veloce**
```bash
# Parallelo (usa 4 CPU cores)
cd /home/user/webapp && npm run build

# Aspetta: ~1-2 secondi (vs 3-4 secondi sandbox standard)
```

### **Hot Reload Ottimizzato**
```bash
cd /home/user/webapp && npm run dev
# Reload: <300ms (vs 500-1000ms sandbox standard)
```

### **Git Operations**
```bash
# Le operazioni Git sono quasi istantanee
cd /home/user/webapp && time git status
# Tipicamente: ~0.01s
```

---

## 🎉 **SEI PRONTO!**

### **Per Iniziare Subito:**

```bash
# Metodo rapido con helper
cd /home/user/webapp && ./git-helper.sh
```

### **O con aliases:**

```bash
source /home/user/webapp/.bash_aliases_telemedcare
tele        # vai al progetto
status      # overview
gdev        # switch a development branch
dev         # avvia dev server
```

### **Primo Commit:**

```bash
cd /home/user/webapp
git checkout -b feature/mio-primo-commit
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "feat: mio primo commit"
git push origin feature/mio-primo-commit
```

---

**🚀 Buon Coding!**

*L'ambiente è configurato e pronto.*  
*Per qualsiasi dubbio, consulta `AMBIENTE_SVILUPPO_GITHUB.md`*

---

**Creato:** 2025-11-07  
**Progetto:** TeleMedCare V11.0  
**Sandbox:** High Performance (4 cores, 7.8GB RAM)
