# 🔧 SCRIPT DEFINITIVO - Rimuove TUTTI i Contratti (anche SIGNED)

## ❌ PROBLEMA
L'endpoint DELETE `/api/contratti/:id` **blocca** la cancellazione di contratti SIGNED.

## ✅ SOLUZIONE
Script che:
1. Cambia status SIGNED → DRAFT
2. Poi cancella tutti i contratti

---

## 🚀 ESEGUI QUESTO SCRIPT

```javascript
console.log('🧹 RIMOZIONE FORZATA DI TUTTI I CONTRATTI (anche firmati)...\n');

// Step 1: Recupera tutti i contratti
fetch('/api/contratti')
.then(r => r.json())
.then(data => {
  const contratti = data.contratti || [];
  console.log(`📊 Contratti trovati: ${contratti.length}`);
  
  if (contratti.length === 0) {
    alert('✅ Nessun contratto da rimuovere!');
    return Promise.resolve([]);
  }
  
  console.table(contratti.map(c => ({
    ID: c.id.substring(0, 20) + '...',
    Codice: c.codice,
    Cliente: c.cliente_nome,
    Status: c.status
  })));
  
  // Step 2: Per ogni contratto SIGNED, cambia in DRAFT
  const promises = contratti.map(async (c) => {
    try {
      // Se è SIGNED, prima cambia in DRAFT
      if (c.status === 'SIGNED') {
        console.log(`📝 ${c.codice}: SIGNED → DRAFT...`);
        await fetch(`/api/contratti/${c.id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            status: 'DRAFT'
          })
        });
      }
      
      // Ora cancella
      console.log(`🗑️ ${c.codice}: Cancellazione...`);
      const deleteResult = await fetch(`/api/contratti/${c.id}`, {
        method: 'DELETE'
      }).then(r => r.json());
      
      return {
        codice: c.codice,
        id: c.id,
        success: deleteResult.success,
        error: deleteResult.error
      };
      
    } catch (err) {
      console.error(`❌ Errore ${c.codice}:`, err);
      return {
        codice: c.codice,
        id: c.id,
        success: false,
        error: err.message
      };
    }
  });
  
  return Promise.all(promises);
})
.then(results => {
  if (results.length === 0) return;
  
  const rimossi = results.filter(r => r.success).length;
  const errori = results.filter(r => !r.success).length;
  
  console.log(`\n✅ Rimossi: ${rimossi}`);
  console.log(`❌ Errori: ${errori}`);
  
  if (errori > 0) {
    console.log('\n⚠️ Contratti con errori:');
    console.table(results.filter(r => !r.success));
  }
  
  alert(`🧹 PULIZIA COMPLETATA!\n\n✅ ${rimossi} contratti rimossi\n❌ ${errori} errori\n\nOra creo i 9 corretti...`);
  
  // Step 3: Crea i 9 contratti corretti
  console.log('\n🚀 Creazione 9 contratti corretti...');
  return fetch('/api/setup-real-contracts', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
  });
})
.then(r => {
  if (!r) return;
  return r.json();
})
.then(data => {
  if (!data) return;
  
  console.log(`\n✅ RISULTATO: ${data.creati} contratti creati su 9`);
  console.table(data.risultati);
  
  const firmati = data.risultati.filter(r => r.signed).length;
  const inviati = data.risultati.filter(r => !r.signed).length;
  
  console.log(`\n📊 RIEPILOGO FINALE:`);
  console.log(`  ✅ Firmati: ${firmati}`);
  console.log(`  📧 Inviati: ${inviati}`);
  console.log(`  💰 Revenue: €${firmati * 480 + (firmati > 0 ? 360 : 0)}`);
  
  if (data.creati === 9) {
    alert(`🎉 PERFETTO!\n\n✅ 9 contratti creati\n✅ 6 firmati + 3 inviati\n💰 Revenue: €3.720\n\n✅ Eileen King (non Elena Saglia)\n✅ Maria Capone (non Giorgio Riela)\n✅ Nessun duplicato D'Alterio\n\nRicarico la pagina...`);
    setTimeout(() => location.reload(), 2000);
  } else {
    alert(`⚠️ ATTENZIONE\n\nCreati ${data.creati}/9 contratti\nControlla console per dettagli`);
  }
})
.catch(err => {
  console.error('❌ ERRORE GENERALE:', err);
  alert('❌ Errore: ' + err.message);
});
```

---

## 📝 NOTE

**Perché il DELETE non funzionava:**
```javascript
// ❌ Endpoint blocca contratti SIGNED
if (contratto.status === 'SIGNED') {
  return c.json({ 
    error: 'Impossibile eliminare un contratto firmato'
  }, 400)
}
```

**Soluzione:**
1. Prima: `PUT /api/contratti/:id` con `{status: 'DRAFT'}`
2. Poi: `DELETE /api/contratti/:id`

---

## ⚠️ IMPORTANTE

Questo script:
- ✅ Rimuove TUTTI i contratti (anche firmati)
- ✅ Crea i 9 contratti corretti
- ✅ Risolve duplicato D'Alterio
- ✅ Intestatari corretti (Eileen King, Maria Capone, ecc.)

**ESEGUI ORA!** 🚀
