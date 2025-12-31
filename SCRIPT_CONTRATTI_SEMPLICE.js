// ========================================
// SCRIPT SEMPLICE CARICAMENTO CONTRATTI
// ========================================

console.clear();
console.log('🚀 INIZIO CARICAMENTO CONTRATTI\n');

// STEP 1: DELETE
console.log('1️⃣ Rimozione contratti esistenti...');
fetch('/api/setup-real-contracts', { method: 'DELETE' })
  .then(response => response.json())
  .then(data => {
    console.log('✅ DELETE completato');
    console.log('   Rimossi:', data.removed || 0, 'contratti');
    console.log('\n⏳ Attesa 2 secondi...\n');
    
    // STEP 2: CREATE (dopo 2 secondi)
    setTimeout(() => {
      console.log('2️⃣ Creazione nuovi contratti...');
      
      fetch('/api/setup-real-contracts', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(result => {
        console.log('✅ CREAZIONE COMPLETATA!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 RIEPILOGO:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Contratti creati:', result.creati);
        console.log('Errori:', result.errori);
        console.log('Contratti FIRMATI:', result.firmati);
        console.log('Contratti INVIATI:', result.creati - result.firmati);
        console.log('\n💰 REVENUE: €' + result.revenue + '/anno');
        console.log('📈 Conversion Rate:', result.conversionRate);
        console.log('💵 AOV: €' + result.aov);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        if (result.contratti && result.contratti.length > 0) {
          console.log('📋 DETTAGLIO CONTRATTI:\n');
          
          // Tabella formattata
          const firmati = result.contratti.filter(c => c.status === 'SIGNED');
          const inviati = result.contratti.filter(c => c.status === 'SENT');
          
          console.log('✅ FIRMATI (' + firmati.length + '):');
          firmati.forEach((c, i) => {
            console.log(`   ${i+1}. ${c.intestatario || c.cognome} - ${c.piano} €${c.prezzo} - Firmato: ${c.data_firma}`);
          });
          
          console.log('\n📤 INVIATI (' + inviati.length + '):');
          inviati.forEach((c, i) => {
            console.log(`   ${i+1}. ${c.intestatario || c.cognome} - ${c.piano} €${c.prezzo} - Inviato: ${c.data_invio}`);
          });
          
          console.log('\n📊 TABELLA COMPLETA:');
          console.table(result.contratti.map(c => ({
            'Codice': c.codice,
            'Intestatario': c.intestatario || c.cognome,
            'Piano': c.piano,
            'Prezzo': '€' + c.prezzo,
            'Status': c.status === 'SIGNED' ? 'Firmato' : 'Inviato',
            'Data': c.status === 'SIGNED' ? c.data_firma : c.data_invio
          })));
        }
        
        // Alert e reload
        alert(`✅ SUCCESSO!\n\n${result.creati} contratti creati\n${result.firmati} FIRMATI = €${result.revenue}/anno\n\nLa pagina si ricaricherà...`);
        
        setTimeout(() => location.reload(), 2000);
      })
      .catch(error => {
        console.error('❌ ERRORE POST:', error);
        alert('❌ Errore durante la creazione dei contratti.\n\nVedi console per dettagli.');
      });
      
    }, 2000);
  })
  .catch(error => {
    console.error('❌ ERRORE DELETE:', error);
    alert('❌ Errore durante la rimozione dei contratti.\n\nVedi console per dettagli.');
  });
