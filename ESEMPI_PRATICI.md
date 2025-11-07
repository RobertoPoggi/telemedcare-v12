# 💡 Esempi Pratici - TeleMedCare V11

## 🎯 **ESEMPI REALI DI UTILIZZO**

Questa guida contiene esempi pratici e concreti di come utilizzare l'ambiente di sviluppo GitHub + Sandbox per scenari reali.

---

## 📝 **SCENARIO 1: Primo Giorno di Lavoro**

### **Cosa fare appena inizi**

```bash
# 1. Vai alla directory del progetto
cd /home/user/webapp

# 2. Verifica che tutto sia configurato
./git-helper.sh
# Seleziona: 1) Status

# 3. Carica gli aliases per comandi rapidi
source .bash_aliases_telemedcare

# 4. Verifica branch disponibili
branches

# 5. Switch al branch di sviluppo
gdev

# 6. Scarica ultime modifiche
gp

# 7. Vedi la struttura del progetto
ls -la src/

# 8. Leggi la documentazione principale
cat README.md
```

---

## 🆕 **SCENARIO 2: Creare Nuova Feature**

### **Esempio: Aggiungere Dashboard Statistiche**

```bash
# 1. Parti da main aggiornato
cd /home/user/webapp
git checkout main
git pull origin main

# 2. Crea branch per la feature
git checkout -b feature/dashboard-statistiche

# 3. Crea il nuovo componente
cat > src/components/StatisticheDashboard.tsx << 'EOF'
import React from 'react';

export const StatisticheDashboard = () => {
  return (
    <div className="stats-dashboard">
      <h2>Statistiche TeleMedCare</h2>
      {/* Implementa statistiche */}
    </div>
  );
};
EOF

# 4. Test locale
npm run build

# 5. Commit
git add src/components/StatisticheDashboard.tsx
git commit -m "feat: aggiungi componente dashboard statistiche"

# 6. Push
git push origin feature/dashboard-statistiche

# 7. Crea PR su GitHub
# Vai a: https://github.com/RobertoPoggi/telemedcare-v11/compare/feature/dashboard-statistiche
```

---

## 🐛 **SCENARIO 3: Fix Bug Urgente**

### **Esempio: Email non inviata correttamente**

```bash
# 1. Crea hotfix da main
cd /home/user/webapp
git checkout main
git checkout -b hotfix/email-invio-fallito

# 2. Identifica il problema (esempio: in email-service.ts)
cat src/modules/email-service.ts | grep "sendEmail"

# 3. Correggi il bug
nano src/modules/email-service.ts
# (oppure usa editor preferito)

# 4. Test il fix
npm run build
./test_email_simple.sh

# 5. Commit con messaggio descrittivo
git add src/modules/email-service.ts
git commit -m "fix: correggi invio email con failover provider

- Aggiunto controllo null su response
- Migliorata gestione errori timeout
- Test verificato con entrambi i provider"

# 6. Push
git push origin hotfix/email-invio-fallito

# 7. Crea PR urgente
# Etichetta PR come "urgent" e "bug"
```

---

## 🔄 **SCENARIO 4: Sincronizzare Branch con Main**

### **Esempio: Il tuo branch è dietro al main**

```bash
# 1. Vai al tuo branch
cd /home/user/webapp
git checkout feature/mia-feature

# 2. Verifica quanto sei indietro
git fetch origin main
git log --oneline main..origin/main

# 3. Opzione A: Merge (mantiene storia)
git merge origin/main

# 4. Opzione B: Rebase (storia lineare) - RACCOMANDATO
git rebase origin/main

# 5. Se ci sono conflitti
git status  # vedi file in conflitto

# Edita i file per risolvere
nano file-in-conflitto.ts
# Rimuovi <<<<<<, ======, >>>>>>

git add file-in-conflitto.ts
git rebase --continue

# 6. Push (usa -f dopo rebase)
git push -f origin feature/mia-feature
```

---

## 📦 **SCENARIO 5: Preparare Pull Request Professionale**

### **Esempio: PR con commit puliti e ben documentati**

```bash
cd /home/user/webapp

# 1. Hai fatto 5 commit durante lo sviluppo
git log --oneline -5
# Output:
# abc123 WIP: fix typo
# def456 test
# ghi789 feat: add validation
# jkl012 feat: add form
# mno345 feat: initial dashboard

# 2. Squash in un unico commit pulito
git reset --soft HEAD~5

# 3. Crea commit finale ben documentato
git commit -m "feat: aggiungi dashboard gestione pazienti

Implementazioni:
- Form validazione dati paziente
- Integrazione API backend
- Test unitari completi
- Documentazione componente

Fixes: #123
Co-authored-by: Team TeleMedCare <team@telemedcare.it>"

# 4. Assicurati di essere allineato con main
git fetch origin main
git rebase origin/main

# 5. Push
git push -f origin feature/dashboard-pazienti

# 6. Crea PR su GitHub con template
# Descrizione completa:
# - Cosa fa
# - Come testare
# - Screenshot (se UI)
# - Breaking changes (se presenti)
```

---

## 🧪 **SCENARIO 6: Testing Prima di Commit**

### **Esempio: Workflow completo di test**

```bash
cd /home/user/webapp

# 1. Build test
echo "=== BUILD TEST ===" 
npm run build

# 2. Test email workflow
echo "=== EMAIL TEST ==="
./test_email_simple.sh

# 3. Test completo workflow
echo "=== WORKFLOW TEST ==="
./test_complete_workflow.py

# 4. Verifica nessun file secrets
echo "=== SECURITY CHECK ==="
git diff | grep -E "(API_KEY|SECRET|PASSWORD)" && echo "⚠️ SECRETS FOUND!" || echo "✅ No secrets"

# 5. Se tutti i test passano, procedi con commit
if [ $? -eq 0 ]; then
    git add .
    git commit -m "feat: nuova funzionalità testata"
    echo "✅ Commit creato con successo"
else
    echo "❌ Test falliti - non committare"
fi
```

---

## 🔍 **SCENARIO 7: Ricerca e Modifica Codice**

### **Esempio: Trovare e modificare tutti i riferimenti a una API**

```bash
cd /home/user/webapp

# 1. Cerca dove viene usata una API
grep -r "sendEmail" src/

# 2. Cerca con contesto (3 linee prima e dopo)
grep -r -C 3 "sendEmail" src/

# 3. Cerca solo in file TypeScript
find src/ -name "*.ts" -o -name "*.tsx" | xargs grep "sendEmail"

# 4. Sostituisci in tutti i file (esempio: renaming)
find src/ -name "*.ts" -o -name "*.tsx" -exec sed -i 's/sendEmail/sendEmailV2/g' {} +

# 5. Verifica modifiche
git diff

# 6. Commit
git add .
git commit -m "refactor: rename sendEmail to sendEmailV2"
```

---

## 🚀 **SCENARIO 8: Deploy Veloce**

### **Esempio: Deploy su Cloudflare Pages dopo PR approvata**

```bash
cd /home/user/webapp

# 1. Switch a main e aggiorna
git checkout main
git pull origin main

# 2. Verifica che tutto buildi
npm run build

# 3. Test produzione locale
npx wrangler pages dev dist --port 3000

# 4. Deploy su Cloudflare
npx wrangler pages deploy dist --project-name telemedcare-v11

# 5. Verifica deploy
curl https://telemedcare-v11.pages.dev/api/health

# 6. Tag versione
git tag -a v11.2.0 -m "Release v11.2.0 - Dashboard pazienti"
git push origin v11.2.0
```

---

## 📊 **SCENARIO 9: Debug Performance**

### **Esempio: Trovare bottleneck nelle API**

```bash
cd /home/user/webapp

# 1. Avvia server con profiling
npm run dev &
SERVER_PID=$!

# 2. Test performance endpoint
time curl http://localhost:3000/api/data/dashboard

# 3. Test 10 richieste consecutive
for i in {1..10}; do
    time curl -s http://localhost:3000/api/data/dashboard > /dev/null
done

# 4. Analizza bundle size
npm run build
du -h dist/assets/*.js | sort -h

# 5. Ottimizza se necessario
# Esempio: lazy loading componenti pesanti

# 6. Commit ottimizzazioni
git add .
git commit -m "perf: ottimizza caricamento dashboard con lazy loading"

# 7. Stop server
kill $SERVER_PID
```

---

## 🔐 **SCENARIO 10: Gestione Environment Variables**

### **Esempio: Setup API keys per testing locale**

```bash
cd /home/user/webapp

# 1. Copia template
cp .dev.vars.example .dev.vars

# 2. Edita con API keys reali
nano .dev.vars

# Aggiungi:
# SENDGRID_API_KEY=SG.your-key
# RESEND_API_KEY=re_your-key
# EMAIL_FROM=noreply@telemedcare.it

# 3. Verifica che .dev.vars sia in .gitignore
grep ".dev.vars" .gitignore

# 4. Test con environment
npx wrangler pages dev dist --local

# 5. Verifica variabili caricate
curl http://localhost:3000/api/debug/env | grep EMAIL_FROM
```

---

## 🎓 **SCENARIO 11: Code Review**

### **Esempio: Review PR di un collega**

```bash
cd /home/user/webapp

# 1. Fetch il branch PR
git fetch origin pull/42/head:pr-42

# 2. Checkout il branch
git checkout pr-42

# 3. Build e test
npm run build
npm test

# 4. Review codice
git diff main...pr-42

# 5. Commenta specifiche linee
# Usa GitHub UI per commenti inline

# 6. Se OK, torna a main
git checkout main
git branch -D pr-42
```

---

## 📈 **SCENARIO 12: Monitoraggio Progetto**

### **Esempio: Dashboard stato progetto**

```bash
cd /home/user/webapp

# 1. Status Git completo
git status
git log --oneline --graph -10

# 2. Branch attivi
git branch -a

# 3. Commit non pushati
git log origin/main..HEAD

# 4. Statistiche contributi
git shortlog -sn --all

# 5. File più modificati
git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -10

# 6. Build size trend
npm run build && du -h dist/assets/*.js
```

---

## 🛠️ **COMANDI HELPER CUSTOM**

### **Crea i tuoi aliases personalizzati**

```bash
# Aggiungi a ~/.bashrc o source ogni volta
cat >> ~/.bash_aliases << 'EOF'
# TeleMedCare Custom Aliases

# Quick commit
qc() {
    cd /home/user/webapp
    git add .
    git commit -m "$1"
    git push origin $(git branch --show-current)
}

# Feature branch veloce
feature() {
    cd /home/user/webapp
    git checkout main
    git pull origin main
    git checkout -b "feature/$1"
}

# Hotfix veloce
hotfix() {
    cd /home/user/webapp
    git checkout main
    git checkout -b "hotfix/$1"
}

# PR ready (squash e push)
prready() {
    cd /home/user/webapp
    git fetch origin main
    git rebase origin/main
    read -p "Quanti commit squashare? " n
    git reset --soft HEAD~$n
    read -p "Messaggio commit: " msg
    git commit -m "$msg"
    git push -f origin $(git branch --show-current)
}

EOF

source ~/.bash_aliases

# Usa:
feature nuova-dashboard
qc "feat: implementato dashboard"
prready
```

---

## 🎯 **BEST PRACTICES RECAP**

### **Workflow Quotidiano Ideale**

```bash
# Morning routine
cd /home/user/webapp
git checkout main
git pull origin main
git checkout genspark_ai_developer
git pull origin genspark_ai_developer

# Durante sviluppo
# - Commit piccoli e frequenti
# - Test dopo ogni modifica significativa
# - Push regolarmente

# Prima di PR
# - Squash commit
# - Rebase su main
# - Test completo
# - Review self-review

# End of day
git add .
git commit -m "chore: save work in progress"
git push origin current-branch
```

---

## 📞 **SERVE AIUTO?**

### **Risorse Rapide**

```bash
# Helper interattivo
./git-helper.sh

# Documentazione completa
cat AMBIENTE_SVILUPPO_GITHUB.md

# Quick start
cat QUICK_START_DEVELOPER.md

# Status overview
source .bash_aliases_telemedcare && status
```

---

**🎉 Buon Lavoro!**

*Questi esempi coprono i casi d'uso più comuni.*  
*Adattali alle tue esigenze specifiche!*

---

**Creato:** 2025-11-07  
**Progetto:** TeleMedCare V11.0  
**Target:** Sviluppatori che usano GitHub + Sandbox
