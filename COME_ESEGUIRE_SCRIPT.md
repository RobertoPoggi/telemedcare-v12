# ▶️ COME ESEGUIRE GLI SCRIPT - GUIDA SEMPLICISSIMA

**Non sai come eseguire gli script? Ecco come fare!**

---

## 🎯 COSA DEVI FARE (3 PASSI)

### **PASSO 1: Scarica il Progetto**

#### **Opzione A: Con Git** (se ce l'hai)
1. Apri il Terminale/CMD/PowerShell
2. Copia e incolla:
```bash
git clone https://github.com/RobertoPoggi/telemedcare-v12.git
cd telemedcare-v12
```

#### **Opzione B: Senza Git** (download manuale)
1. Vai su: https://github.com/RobertoPoggi/telemedcare-v12
2. Clicca: **Code** (bottone verde)
3. Clicca: **Download ZIP**
4. Estrai il file ZIP
5. Apri il terminale nella cartella estratta

---

### **PASSO 2: Apri il Terminale**

#### **Su Windows:**

**Metodo 1: Da Esplora File**
1. Apri la cartella `telemedcare-v12`
2. Clicca nella barra degli indirizzi (in alto)
3. Scrivi: `cmd`
4. Premi Invio
✅ Il terminale si apre nella cartella giusta!

**Metodo 2: Manualmente**
1. Premi `Windows + R`
2. Scrivi: `cmd`
3. Premi Invio
4. Naviga alla cartella:
```bash
cd Downloads\telemedcare-v12
```

#### **Su Mac:**
1. Apri Finder
2. Vai nella cartella `telemedcare-v12`
3. Click destro sulla cartella
4. **Servizi** > **Nuovo Terminale nella Cartella**

Oppure:
1. Apri Terminale
2. Scrivi:
```bash
cd ~/Downloads/telemedcare-v12
```

#### **Su Linux:**
1. Apri Terminale (`Ctrl + Alt + T`)
2. Scrivi:
```bash
cd ~/Downloads/telemedcare-v12
```

---

### **PASSO 3: Esegui lo Script**

Ora che sei nella cartella giusta, scegli quale script eseguire:

#### **Script A: Trova Zone ID** 🔍

**Su Mac/Linux:**
```bash
./trova-zone-id.sh
```

**Su Windows con Git Bash:**
```bash
./trova-zone-id.sh
```

**Su Windows con Node.js:**
```bash
node trova-zone-id.js
```

**Su Windows CMD/PowerShell (se hai bash):**
```bash
bash trova-zone-id.sh
```

#### **Script B: Setup Completo** ⚙️

**Su Mac/Linux:**
```bash
./setup-telemedcare.sh
```

**Su Windows con Git Bash:**
```bash
./setup-telemedcare.sh
```

**Su Windows CMD/PowerShell:**
```bash
bash setup-telemedcare.sh
```

---

## ❓ COME CAPIRE SE SEI NELLA CARTELLA GIUSTA?

Scrivi nel terminale:

**Windows:**
```bash
dir
```

**Mac/Linux:**
```bash
ls
```

Dovresti vedere questi file:
```
trova-zone-id.sh
trova-zone-id.js
setup-telemedcare.sh
GUIDA_ESECUZIONE_SCRIPT.md
README.md
package.json
...
```

Se li vedi, **sei nel posto giusto!** ✅

Se NON li vedi, devi navigare alla cartella corretta (torna al PASSO 2).

---

## 🚨 PROBLEMI COMUNI

### **Problema 1: "comando non trovato" o "not found"**

**Causa**: Non sei nella cartella giusta

**Soluzione**:
```bash
# Verifica dove sei
pwd              # Mac/Linux
cd               # Windows

# Vai nella cartella giusta
cd path/to/telemedcare-v12
```

---

### **Problema 2: "Permission denied" o "Accesso negato"**

**Causa**: Lo script non è eseguibile

**Soluzione Mac/Linux**:
```bash
chmod +x trova-zone-id.sh
chmod +x setup-telemedcare.sh
```

**Soluzione Windows**:
Usa `bash script-name.sh` invece di `./script-name.sh`

---

### **Problema 3: "bash: comando non trovato"**

**Causa**: Non hai bash installato su Windows

**Soluzione 1 - Installa Git Bash**:
1. Scarica: https://git-scm.com/downloads
2. Installa
3. Riprova

**Soluzione 2 - Usa Node.js**:
```bash
node trova-zone-id.js
```

**Soluzione 3 - Configurazione Manuale**:
Usa il file `CONFIGURAZIONE_RAPIDA_COPY_PASTE.md` (10 min)

---

### **Problema 4: "node: comando non trovato"**

**Causa**: Non hai Node.js installato

**Soluzione**:
1. Scarica: https://nodejs.org/
2. Installa (versione LTS)
3. Riavvia il terminale
4. Riprova

---

## 📺 ESEMPIO COMPLETO (Windows CMD)

```
C:\Users\TuoNome> cd Downloads
C:\Users\TuoNome\Downloads> cd telemedcare-v12
C:\Users\TuoNome\Downloads\telemedcare-v12> dir

 Directory di C:\Users\TuoNome\Downloads\telemedcare-v12

trova-zone-id.sh
trova-zone-id.js
setup-telemedcare.sh
...

C:\Users\TuoNome\Downloads\telemedcare-v12> node trova-zone-id.js

═══════════════════════════════════════════════════════════
  Trova Zone ID per telemedcare.it
═══════════════════════════════════════════════════════════

Incolla il tuo Cloudflare API Token: [incolla qui]

🔍 Cerco il Zone ID per telemedcare.it...

✅ TROVATO!

═══════════════════════════════════════════════════════════
Zone ID per telemedcare.it:

    abc123def456ghi789jkl012mno345pqr

═══════════════════════════════════════════════════════════
```

---

## 📺 ESEMPIO COMPLETO (Mac Terminal)

```
Mac:~ user$ cd Downloads
Mac:Downloads user$ cd telemedcare-v12
Mac:telemedcare-v12 user$ ls

trova-zone-id.sh
trova-zone-id.js
setup-telemedcare.sh
...

Mac:telemedcare-v12 user$ ./trova-zone-id.sh

═══════════════════════════════════════════════════════════
  Trova Zone ID per telemedcare.it
═══════════════════════════════════════════════════════════

Incolla il tuo Cloudflare API Token: [incolla qui]

🔍 Cerco il Zone ID per telemedcare.it...

✅ TROVATO!

═══════════════════════════════════════════════════════════
Zone ID per telemedcare.it:

    abc123def456ghi789jkl012mno345pqr

═══════════════════════════════════════════════════════════
```

---

## ✅ CHECKLIST PRIMA DI INIZIARE

Prima di eseguire gli script, verifica:

- [ ] Ho scaricato il progetto (zip o git clone)
- [ ] Ho estratto il file zip (se scaricato manualmente)
- [ ] Ho aperto il terminale
- [ ] Sono nella cartella `telemedcare-v12`
- [ ] Vedo i file script quando faccio `ls` o `dir`
- [ ] Ho Node.js installato (per script .js) O Git Bash (per script .sh)

Se tutti hanno ✅, puoi eseguire gli script!

---

## 🎯 RIEPILOGO VELOCE

```bash
# 1. Scarica progetto
git clone https://github.com/RobertoPoggi/telemedcare-v12.git

# 2. Entra nella cartella
cd telemedcare-v12

# 3. Esegui script
./trova-zone-id.sh           # Mac/Linux/Git Bash
node trova-zone-id.js        # Windows/Node.js
```

**FATTO!** 🎉

---

## 💡 ALTERNATIVE SE NULLA FUNZIONA

Se proprio non riesci a eseguire gli script:

1. **Usa la configurazione manuale** (10 minuti):
   - Apri: `CONFIGURAZIONE_RAPIDA_COPY_PASTE.md`
   - Segui le istruzioni passo-passo
   - Configura via dashboard Cloudflare

2. **Dammi accesso remoto** (se vuoi):
   - Forniscimi API Token Cloudflare
   - Eseguo io la configurazione per te
   - Tempo: 1 minuto

---

**Tutto chiaro? Segui questi passi e gli script funzioneranno!** 🚀

**Files utili:**
- `trova-zone-id.sh` - Script bash (Mac/Linux/Git Bash)
- `trova-zone-id.js` - Script Node.js (Windows)
- `CONFIGURAZIONE_RAPIDA_COPY_PASTE.md` - Config manuale

**Hai ancora dubbi? Dimmi dove ti sei bloccato!**
