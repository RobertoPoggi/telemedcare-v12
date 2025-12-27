# 🚀 Deploy TeleMedCare V12

## ✅ Deploy Corretto (Cloudflare Pages)

### Flusso Automatico:
```bash
git add .
git commit -m "messaggio"
git push origin main
```

**Cosa succede:**
1. GitHub riceve il push
2. Webhook notifica Cloudflare Pages
3. Cloudflare Pages fa auto-deploy
4. Online in ~2 minuti su: https://telemedcare-v12.pages.dev/

---

## ❌ NON FARE MAI

### Comandi da NON eseguire:
```bash
# ❌ SBAGLIATO - Crea Workers indesiderati!
wrangler deploy

# ❌ SBAGLIATO - Vecchio comando deprecato
wrangler publish

# ❌ SBAGLIATO - Deploy manuale Pages non necessario
wrangler pages deploy
```

**Perché?**
- `wrangler deploy` → Crea Workers su `*.workers.dev` (NON vogliamo!)
- Il progetto usa **SOLO** Cloudflare Pages
- Deploy automatico via GitHub è più affidabile

---

## 🔍 Verifica Deploy

### URL Ufficiale:
- ✅ **Pages**: https://telemedcare-v12.pages.dev/

### URL da NON usare:
- ❌ **Workers**: `https://telemedcare-v12*.workers.dev/` (vecchi, deprecati)

### Test Deploy:
```bash
# Verifica Pages (deve rispondere 200)
curl -I https://telemedcare-v12.pages.dev/

# Verifica Workers NON esistano (deve rispondere 404)
curl -I https://telemedcare-v12-pages.telecareh24srl.workers.dev/
```

---

## 🛠️ Configurazione

### File Chiave:
- `wrangler.toml` - Configurazione Pages (NO Workers)
- `.github/workflows/` - NO GitHub Actions (non necessarie)
- Repository webhook → Cloudflare Pages

### Verifica Configurazione:
1. **GitHub**: Settings → Webhooks
   - ✅ 1 webhook: `https://api.cloudflare.com/...` (Pages)
   - ❌ Nessun webhook Workers

2. **Cloudflare**: Dashboard → Pages
   - ✅ Progetto: `telemedcare-v12`
   - ✅ Branch: `main`
   - ✅ Build: `npm run build`
   - ✅ Output: `dist`

---

## 🐛 Troubleshooting

### Problema: "Vedo deploy su Workers"
**Causa**: Qualcuno ha eseguito `wrangler deploy` manualmente

**Soluzione**:
1. Vai su Cloudflare Dashboard → Workers & Pages → Workers
2. Cerca il Worker problematico
3. Settings → Delete Worker

### Problema: "Deploy non aggiorna Pages"
**Verifica**:
```bash
# 1. Controlla ultimo commit
git log -1

# 2. Verifica push
git status

# 3. Aspetta 2-3 minuti
# Deploy Pages può richiedere tempo

# 4. Hard refresh browser
Ctrl+Shift+R (o Cmd+Shift+R su Mac)
```

---

## 📊 Monitoraggio

### Cloudflare Dashboard:
- Pages → telemedcare-v12 → Deployments
- Vedi tutti i deploy recenti
- Logs completi per debug

### GitHub:
- Actions → NON usate (deploy via webhook)
- Commits → ogni push triggera deploy

---

## 🔒 Sicurezza

### Variabili d'Ambiente:
Le variabili sensibili (API keys, secrets) sono configurate su:
- Cloudflare Dashboard → Pages → Settings → Environment Variables

**NON** mettere secrets in `wrangler.toml`!

### Bindings D1:
Il database D1 è collegato automaticamente su Pages:
- Nome binding: `DB`
- Database: `telemedcare-prod`

---

## ✅ Checklist Pre-Deploy

Prima di ogni deploy, verifica:
- [ ] Codice testato localmente
- [ ] Build funziona: `npm run build`
- [ ] Commit message chiaro
- [ ] Push su `main` branch
- [ ] Aspetta 2 minuti per deploy Pages
- [ ] Test su https://telemedcare-v12.pages.dev/

---

**Ultima modifica**: 2025-12-27  
**Maintainer**: Roberto Poggi
