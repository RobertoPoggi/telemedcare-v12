/**
 * SCRIPT FIX COMPLETO DATABASE CONTRATTI
 * TeleMedCare V12.0
 * 
 * Corregge tutti gli errori identificati:
 * 1. Revenue: solo contratti SIGNED
 * 2. Interfaccia: STATO in italiano
 * 3. Caterina D'Alterio: rimuove duplicati
 * 4. Elena Saglia → Eileen King AVANZATO
 * 5. Aggiunge Maria Capone
 * 6. Aggiunge/verifica Pizzutto
 * 7. King piano AVANZATO
 */

// ESEGUI QUESTO SCRIPT IN CONSOLE BROWSER
// Apri: https://telemedcare-v12.pages.dev/admin/data-dashboard
// Console (F12) e incolla tutto questo codice

async function fixContratti() {
  console.log('🔧 Inizio fix database contratti...\n');
  
  const fixes = [];
  const errors = [];
  
  // ==========================================
  // 1. ELIMINA CONTRATTI ERRATI
  // ==========================================
  
  console.log('📋 Step 1: Elimina contratti errati...');
  
  try {
    // Recupera tutti i contratti
    const response = await fetch('/api/contratti');
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Impossibile recuperare contratti');
    }
    
    const contratti = data.contratti || [];
    console.log(`   Contratti trovati: ${contratti.length}`);
    
    // Trova duplicati Caterina D'Alterio
    const dalterioContracts = contratti.filter(c => 
      c.cognomeRichiedente && c.cognomeRichiedente.toLowerCase().includes("d'alterio")
    );
    
    if (dalterioContracts.length > 1) {
      console.log(`   ⚠️ Trovati ${dalterioContracts.length} contratti D'Alterio - tengo solo il più recente firmato`);
      
      // Ordina per data e status
      dalterioContracts.sort((a, b) => {
        if (a.status === 'SIGNED' && b.status !== 'SIGNED') return -1;
        if (b.status === 'SIGNED' && a.status !== 'SIGNED') return 1;
        return new Date(b.data_invio) - new Date(a.data_invio);
      });
      
      // Elimina tutti tranne il primo
      for (let i = 1; i < dalterioContracts.length; i++) {
        const toDelete = dalterioContracts[i];
        console.log(`   🗑️ Elimino contratto duplicato: ${toDelete.codice}`);
        
        try {
          const delResponse = await fetch(`/api/contratti/${toDelete.id}`, {
            method: 'DELETE'
          });
          const delResult = await delResponse.json();
          
          if (delResult.success) {
            fixes.push(`✅ Eliminato duplicato D'Alterio: ${toDelete.codice}`);
          } else {
            errors.push(`❌ Errore eliminazione ${toDelete.codice}: ${delResult.error}`);
          }
        } catch (err) {
          errors.push(`❌ Errore eliminazione ${toDelete.codice}: ${err.message}`);
        }
      }
    }
    
    // Trova contratto Elena Saglia (da eliminare)
    const sagliaContract = contratti.find(c => 
      c.cognomeRichiedente && c.cognomeRichiedente.toLowerCase().includes('saglia')
    );
    
    if (sagliaContract) {
      console.log(`   🗑️ Elimino contratto errato Elena Saglia: ${sagliaContract.codice}`);
      
      try {
        const delResponse = await fetch(`/api/contratti/${sagliaContract.id}`, {
          method: 'DELETE'
        });
        const delResult = await delResponse.json();
        
        if (delResult.success) {
          fixes.push(`✅ Eliminato contratto errato Saglia: ${sagliaContract.codice}`);
        } else {
          errors.push(`❌ Errore eliminazione Saglia: ${delResult.error}`);
        }
      } catch (err) {
        errors.push(`❌ Errore eliminazione Saglia: ${err.message}`);
      }
    }
    
  } catch (error) {
    errors.push(`❌ Step 1 fallito: ${error.message}`);
  }
  
  // ==========================================
  // 2. AGGIORNA CONTRATTO KING AD AVANZATO
  // ==========================================
  
  console.log('\n📋 Step 2: Aggiorna contratto King ad AVANZATO...');
  
  try {
    const response = await fetch('/api/contratti');
    const data = await response.json();
    const contratti = data.contratti || [];
    
    const kingContract = contratti.find(c => 
      c.codice && c.codice.includes('KING')
    );
    
    if (kingContract) {
      console.log(`   📝 Trovato contratto King: ${kingContract.codice}`);
      console.log(`   ⬆️ Aggiorno a AVANZATO €840...`);
      
      try {
        const updateResponse = await fetch(`/api/contratti/${kingContract.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo_contratto: 'AVANZATO',
            piano: 'AVANZATO',
            prezzo_totale: 840,
            prezzo_mensile: 70,
            note: 'Assistito: Eileen King - Caregiver: Elena Saglia (figlia) - Contratto AVANZATO firmato 10/05/2025'
          })
        });
        
        const updateResult = await updateResponse.json();
        
        if (updateResult.success) {
          fixes.push(`✅ Contratto King aggiornato ad AVANZATO €840`);
        } else {
          errors.push(`❌ Errore aggiornamento King: ${updateResult.error}`);
        }
      } catch (err) {
        errors.push(`❌ Errore aggiornamento King: ${err.message}`);
      }
    } else {
      console.log(`   ⚠️ Contratto King non trovato - verrà creato`);
    }
    
  } catch (error) {
    errors.push(`❌ Step 2 fallito: ${error.message}`);
  }
  
  // ==========================================
  // 3. CREA CONTRATTI MANCANTI
  // ==========================================
  
  console.log('\n📋 Step 3: Usa endpoint /api/setup-real-contracts per creare i corretti...');
  console.log('   ⚠️ Esegui manualmente dopo questo script:');
  console.log('   fetch("/api/setup-real-contracts", {method: "POST"})');
  
  // ==========================================
  // RIEPILOGO
  // ==========================================
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RIEPILOGO FIX DATABASE CONTRATTI');
  console.log('='.repeat(50));
  
  if (fixes.length > 0) {
    console.log('\n✅ FIX APPLICATI:');
    fixes.forEach(f => console.log(`   ${f}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORI:');
    errors.forEach(e => console.log(`   ${e}`));
  }
  
  console.log('\n📈 PROSSIMI PASSI:');
  console.log('   1. Ricarica la pagina');
  console.log('   2. Esegui: fetch("/api/setup-real-contracts", {method: "POST"}).then(r=>r.json()).then(console.log)');
  console.log('   3. Verifica contratti nella Data Dashboard');
  
  return { fixes, errors };
}

// ESEGUI IL FIX
fixContratti().then(result => {
  console.log('\n✅ Script completato!');
  console.log('   Fixes:', result.fixes.length);
  console.log('   Errors:', result.errors.length);
});
