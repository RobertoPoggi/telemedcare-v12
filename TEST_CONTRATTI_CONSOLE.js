// ========================================
// SCRIPT CARICAMENTO CONTRATTI - VERSIONE ROBUSTA
// ========================================
// 
// ISTRUZIONI:
// 1. Apri: https://telemedcare-v12.pages.dev/admin/data-dashboard
// 2. Premi F12 → Console
// 3. Copia TUTTO questo script e incolla nella console
// 4. Premi INVIO
// 5. Attendi 5-10 secondi per vedere i risultati
//
// ========================================

console.clear();
console.log('╔════════════════════════════════════════╗');
console.log('║  🚀 CARICAMENTO CONTRATTI REALI       ║');
console.log('╚════════════════════════════════════════╝\n');

// Step 1: DELETE contratti esistenti
console.log('1️⃣  DELETE contratti esistenti...\n');

fetch('/api/setup-real-contracts', { 
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' }
})
.then(response => {
  console.log('📡 Response Status:', response.status, response.statusText);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
})
.then(deleteResult => {
  console.log('✅ DELETE completato!');
  console.log('   Contratti rimossi:', deleteResult.removed || 0);
  console.log('\n⏳ Attesa 2 secondi prima del POST...\n');
  
  // Step 2: Attendi 2 secondi, poi POST nuovi contratti
  setTimeout(() => {
    console.log('2️⃣  POST nuovi contratti...\n');
    
    fetch('/api/setup-real-contracts', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
      console.log('📡 Response Status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    })
    .then(result => {
      console.log('✅ CREAZIONE COMPLETATA!\n');
      
      console.log('═══════════════════════════════════════');
      console.log('📊 RIEPILOGO STATISTICHE');
      console.log('═══════════════════════════════════════');
      console.log('✓ Contratti creati:     ', result.creati);
      console.log('✗ Errori:               ', result.errori);
      console.log('📝 Contratti FIRMATI:   ', result.firmati);
      console.log('📝 Contratti INVIATI:   ', result.creati - result.firmati);
      console.log('💰 REVENUE ANNUALE:     ', '€' + result.revenue);
      console.log('📈 Conversion Rate:     ', result.conversionRate);
      console.log('💵 AOV (valore medio):  ', '€' + result.aov);
      console.log('═══════════════════════════════════════\n');
      
      if (result.contratti && result.contratti.length > 0) {
        console.log('📋 DETTAGLIO CONTRATTI:\n');
        
        // Formatta per console.table
        const tableData = result.contratti.map(c => ({
          'Codice': c.codice,
          'Intestatario': c.intestatario,
          'Piano': c.piano,
          'Servizio': c.servizio,
          'Prezzo': '€' + c.prezzo,
          'Status': c.status === 'SIGNED' ? '✅ Firmato' : '📤 Inviato',
          'Data Firma': c.data_firma || '-'
        }));
        
        console.table(tableData);
        
        console.log('\n═══════════════════════════════════════');
        console.log('✅ CONTRATTI FIRMATI (Revenue):');
        console.log('═══════════════════════════════════════');
        
        result.contratti
          .filter(c => c.status === 'SIGNED')
          .forEach((c, i) => {
            console.log(`${i + 1}. ${c.intestatario.padEnd(25)} - ${c.piano.padEnd(10)} €${c.prezzo} - Firmato: ${c.data_firma}`);
          });
        
        console.log('\n═══════════════════════════════════════');
        console.log('📤 CONTRATTI INVIATI (No Revenue):');
        console.log('═══════════════════════════════════════');
        
        const inviati = result.contratti.filter(c => c.status !== 'SIGNED');
        if (inviati.length > 0) {
          inviati.forEach((c, i) => {
            console.log(`${i + 1}. ${c.intestatario.padEnd(25)} - ${c.piano.padEnd(10)} €${c.prezzo} - Inviato: ${c.data_invio}`);
          });
        } else {
          console.log('(Nessuno)');
        }
      }
      
      console.log('\n═══════════════════════════════════════\n');
      
      // Verifica specifiche intestatari
      console.log('🔍 VERIFICHE INTESTATARI CORRETTI:\n');
      
      const verifiche = [
        { codice: 'CTR-KING-2025', intestatario: 'Eileen King', prezzo: 840 },
        { codice: 'CTR-BALZAROTTI-2025', intestatario: 'Giuliana Balzarotti', prezzo: 480 },
        { codice: 'CTR-PIZZUTTO-G-2025', intestatario: 'Gianni Paolo Pizzutto', prezzo: 480 },
        { codice: 'CTR-PENNACCHIO-2025', intestatario: 'Rita Pennacchio', prezzo: 480 },
        { codice: 'CTR-COZZI-2025', intestatario: 'Giuseppina Cozzi', prezzo: 480 },
        { codice: 'CTR-CAPONE-2025', intestatario: 'Maria Capone', prezzo: 480 }
      ];
      
      verifiche.forEach(v => {
        const found = result.contratti.find(c => c.codice === v.codice);
        if (found) {
          const ok = found.intestatario === v.intestatario && found.prezzo === v.prezzo;
          console.log(`${ok ? '✅' : '❌'} ${v.codice}: ${found.intestatario} (€${found.prezzo})`);
        } else {
          console.log(`❌ ${v.codice}: NON TROVATO`);
        }
      });
      
      console.log('\n═══════════════════════════════════════\n');
      
      // Alert finale
      const alertMsg = `✅ SUCCESSO!\n\n` +
        `📊 RIEPILOGO:\n` +
        `• Contratti creati: ${result.creati}\n` +
        `• Contratti FIRMATI: ${result.firmati}\n` +
        `• Revenue annuale: €${result.revenue}\n` +
        `• Conversion Rate: ${result.conversionRate}\n` +
        `• AOV: €${result.aov}\n\n` +
        `✅ FIRMATI:\n` +
        result.contratti
          .filter(c => c.status === 'SIGNED')
          .map(c => `  • ${c.intestatario} - ${c.piano} €${c.prezzo}`)
          .join('\n') +
        `\n\n📤 INVIATI:\n` +
        result.contratti
          .filter(c => c.status !== 'SIGNED')
          .map(c => `  • ${c.intestatario} - ${c.piano} €${c.prezzo}`)
          .join('\n') +
        `\n\n🔄 La pagina si ricaricherà tra 2 secondi...`;
      
      alert(alertMsg);
      
      // Reload pagina dopo 2 secondi
      setTimeout(() => {
        console.log('🔄 Ricaricamento pagina...');
        location.reload();
      }, 2000);
    })
    .catch(postError => {
      console.error('❌ ERRORE POST /api/setup-real-contracts:\n');
      console.error('   Messaggio:', postError.message);
      console.error('   Stack:', postError.stack);
      console.error('\n📋 Dettagli completi:');
      console.error(postError);
      
      alert('❌ ERRORE POST:\n\n' + postError.message + '\n\nVedi console per dettagli completi (F12)');
    });
    
  }, 2000); // Fine setTimeout POST
  
})
.catch(deleteError => {
  console.error('❌ ERRORE DELETE /api/setup-real-contracts:\n');
  console.error('   Messaggio:', deleteError.message);
  console.error('   Stack:', deleteError.stack);
  console.error('\n📋 Dettagli completi:');
  console.error(deleteError);
  
  alert('❌ ERRORE DELETE:\n\n' + deleteError.message + '\n\nVedi console per dettagli completi (F12)');
});

console.log('⏳ Script avviato. Attendi 5-10 secondi per i risultati...\n');
