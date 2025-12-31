# 🔧 FIX CONTRATTI - SCRIPT RAPIDO

## ❌ PROBLEMA: Contratti creati con dati sbagliati

### 1️⃣ D'Alterio Doppia
- **Cosa è successo**: Creati 2 contratti per email caterinadalterio108@gmail.com
- **Soluzione**: Cancellare tutto e ricreare UNO solo

### 2️⃣ Elena Saglia vs Eileen King
- **Cosa è successo**: Contratto intestato a Elena Saglia (caregiver/figlia)
- **Dovrebbe essere**: Eileen King (assistita/madre)
- **Problema**: Nel DB leads chi è registrato? Elena o Eileen?

### 3️⃣ Date Firma = Oggi
- **Cosa è successo**: Le date firma sono oggi invece delle date reali
- **Causa**: Possibile problema formato date o timezone
- **Verifica**: Le date nell'array sono corrette (es. '2025-05-10')

### 4️⃣ Riela vs Capone
- **Cosa è successo**: Contratto per Giorgio Riela invece di Maria Capone
- **Dovrebbe essere**: Maria Capone (assistita/madre) firmò il contratto
- **Problema**: Nel DB leads chi è registrato? Giorgio o Maria?

---

## 🚀 SOLUZIONE RAPIDA

### STEP 1: Cancella tutti i contratti

```javascript
fetch('/api/setup-real-contracts', {method: 'DELETE'})
.then(r => r.json())
.then(data => console.log(`✅ Rimossi ${data.removed} contratti`))
```

### STEP 2: Verifica chi è registrato nel DB Leads

```javascript
// Verifica Elena Saglia / Eileen King
fetch('/api/leads')
.then(r => r.json())
.then(data => {
  const elena = data.leads.find(l => l.email === 'elenasaglia@hotmail.com');
  console.log('Elena Saglia:', elena ? {
    id: elena.id,
    nome: elena.nomeRichiedente,
    cognome: elena.cognomeRichiedente,
    email: elena.email
  } : 'NON TROVATO');
  
  const eileen = data.leads.find(l => 
    l.nomeRichiedente?.toLowerCase().includes('eileen') ||
    l.cognomeRichiedente?.toLowerCase().includes('king')
  );
  console.log('Eileen King:', eileen ? {
    id: eileen.id,
    nome: eileen.nomeRichiedente,
    cognome: eileen.cognomeRichiedente,
    email: eileen.email
  } : 'NON TROVATO');
});

// Verifica Giorgio Riela / Maria Capone
fetch('/api/leads')
.then(r => r.json())
.then(data => {
  const giorgio = data.leads.find(l => l.email === 'gr@ecotorino.it');
  console.log('Giorgio Riela:', giorgio ? {
    id: giorgio.id,
    nome: giorgio.nomeRichiedente,
    cognome: giorgio.cognomeRichiedente,
    email: giorgio.email
  } : 'NON TROVATO');
  
  const maria = data.leads.find(l => 
    l.nomeRichiedente?.toLowerCase().includes('maria') &&
    l.cognomeRichiedente?.toLowerCase().includes('capone')
  );
  console.log('Maria Capone:', maria ? {
    id: maria.id,
    nome: maria.nomeRichiedente,
    cognome: maria.cognomeRichiedente,
    email: maria.email
  } : 'NON TROVATO');
});
```

### STEP 3: Attendere fix codice

Una volta identificati i lead corretti, aggiornerò il codice e ricreeremo i contratti.

---

## 📋 ESEGUI QUESTO SCRIPT ORA

```javascript
console.log('🔍 VERIFICA LEAD NEL DATABASE\n');

fetch('/api/leads')
.then(r => r.json())
.then(data => {
  console.log(`📊 Totale leads: ${data.leads.length}\n`);
  
  // 1. Elena Saglia / Eileen King
  console.log('1️⃣ VERIFICA ELENA SAGLIA / EILEEN KING:');
  const elena = data.leads.find(l => l.email === 'elenasaglia@hotmail.com');
  const eileen = data.leads.find(l => 
    (l.nomeRichiedente?.toLowerCase().includes('eileen') ||
     l.cognomeRichiedente?.toLowerCase().includes('king'))
  );
  
  console.table([
    elena ? {
      Chi: 'Elena Saglia',
      ID: elena.id,
      Nome: elena.nomeRichiedente,
      Cognome: elena.cognomeRichiedente,
      Email: elena.email
    } : {Chi: 'Elena Saglia', Trovato: '❌ NO'},
    
    eileen ? {
      Chi: 'Eileen King',
      ID: eileen.id,
      Nome: eileen.nomeRichiedente,
      Cognome: eileen.cognomeRichiedente,
      Email: eileen.email
    } : {Chi: 'Eileen King', Trovato: '❌ NO'}
  ]);
  
  // 2. Giorgio Riela / Maria Capone
  console.log('\n2️⃣ VERIFICA GIORGIO RIELA / MARIA CAPONE:');
  const giorgio = data.leads.find(l => l.email === 'gr@ecotorino.it');
  const maria = data.leads.find(l => 
    l.nomeRichiedente?.toLowerCase().includes('maria') &&
    l.cognomeRichiedente?.toLowerCase().includes('capone')
  );
  
  console.table([
    giorgio ? {
      Chi: 'Giorgio Riela',
      ID: giorgio.id,
      Nome: giorgio.nomeRichiedente,
      Cognome: giorgio.cognomeRichiedente,
      Email: giorgio.email
    } : {Chi: 'Giorgio Riela', Trovato: '❌ NO'},
    
    maria ? {
      Chi: 'Maria Capone',
      ID: maria.id,
      Nome: maria.nomeRichiedente,
      Cognome: maria.cognomeRichiedente,
      Email: maria.email
    } : {Chi: 'Maria Capone', Trovato: '❌ NO'}
  ]);
  
  // 3. Caterina D'Alterio
  console.log('\n3️⃣ VERIFICA CATERINA D\'ALTERIO:');
  const caterinas = data.leads.filter(l => l.email === 'caterinadalterio108@gmail.com');
  console.table(caterinas.map(c => ({
    ID: c.id,
    Nome: c.nomeRichiedente,
    Cognome: c.cognomeRichiedente,
    Email: c.email,
    Note: c.note || '-'
  })));
  
  console.log('\n\n📝 ISTRUZIONI:');
  console.log('Copia i risultati sopra e mandameli.');
  console.log('Sistemerò il codice e ricreeremo i contratti corretti.');
})
.catch(err => console.error('❌ Errore:', err));
```

---

**ESEGUI LO SCRIPT SOPRA e mandami i risultati!** 🔍
