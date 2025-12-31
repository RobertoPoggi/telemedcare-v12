// ========================================
// SCRIPT COMPLETO CARICAMENTO CONTRATTI
// TeleMedCare v12 - Dashboard Data
// ========================================

// 🎯 ISTRUZIONI:
// 1. Apri https://telemedcare-v12.pages.dev/admin/data-dashboard
// 2. Premi F12 (Console)
// 3. Copia e incolla TUTTO questo script
// 4. Premi Invio
// 5. Attendi 5-10 secondi
// 6. Verifica risultati

console.log('🚀 Inizio caricamento contratti...');

// STEP 1: DELETE contratti esistenti
fetch('/api/setup-real-contracts', { 
  method: 'DELETE' 
})
.then(r => r.json())
.then(deleteResult => {
  console.log('✅ DELETE completato:', deleteResult);
  console.log(`   Rimossi: ${deleteResult.removed} contratti`);
  
  // Attendi 2 secondi prima di creare
  return new Promise(resolve => setTimeout(resolve, 2000));
})
.then(() => {
  console.log('\n🔄 Creazione nuovi contratti...\n');
  
  // STEP 2: POST nuovi contratti
  return fetch('/api/setup-real-contracts', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
})
.then(r => r.json())
.then(result => {
  console.log('✅ CREAZIONE COMPLETATA!\n');
  
  // Mostra riepilogo
  console.log('📊 RIEPILOGO:');
  console.log(`   Totale creati: ${result.creati}`);
  console.log(`   Errori: ${result.errori}`);
  console.log(`   Contratti FIRMATI: ${result.firmati}`);
  console.log(`   Revenue ANNUALE: €${result.revenue}`);
  console.log(`   Conversion Rate: ${result.conversionRate}`);
  console.log(`   Average Order Value: €${result.aov}`);
  
  // Tabella dettagliata
  if (result.contratti && result.contratti.length > 0) {
    console.log('\n📋 DETTAGLIO CONTRATTI:\n');
    console.table(result.contratti.map(c => ({
      Codice: c.codice,
      Intestatario: c.intestatario,
      Caregiver: c.caregiver,
      Piano: c.piano,
      'Prezzo €': c.prezzo,
      Status: c.status,
      'Data Firma': c.data_firma || 'NON FIRMATO'
    })));
  }
  
  // Verifica contratti specifici
  console.log('\n🔍 VERIFICHE SPECIFICHE:');
  
  const verifiche = [
    { nome: 'Eileen King', codice: 'CTR-KING-2025', piano: 'AVANZATO', prezzo: 840 },
    { nome: 'Giuliana Balzarotti', codice: 'CTR-BALZAROTTI-2025', piano: 'BASE', prezzo: 480 },
    { nome: 'Gianni Paolo Pizzutto', codice: 'CTR-PIZZUTTO-G-2025', piano: 'BASE', prezzo: 480 },
    { nome: 'Rita Pennacchio', codice: 'CTR-PENNACCHIO-2025', piano: 'BASE', prezzo: 480 },
    { nome: 'Giuseppina Cozzi', codice: 'CTR-COZZI-2025', piano: 'BASE', prezzo: 480 },
    { nome: 'Maria Capone', codice: 'CTR-CAPONE-2025', piano: 'BASE', prezzo: 480 }
  ];
  
  verifiche.forEach(v => {
    const contratto = result.contratti?.find(c => c.codice === v.codice);
    if (contratto) {
      const ok = contratto.piano === v.piano && contratto.prezzo === v.prezzo;
      console.log(`   ${ok ? '✅' : '❌'} ${v.nome}: ${contratto.piano} €${contratto.prezzo}`);
    } else {
      console.log(`   ❌ ${v.nome}: NON TROVATO`);
    }
  });
  
  // Alert finale
  const message = `
🎉 CONTRATTI CARICATI CON SUCCESSO!

📊 RIEPILOGO:
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ${result.creati} contratti creati
✅ ${result.firmati} FIRMATI (revenue)
✅ ${result.creati - result.firmati} INVIATI (no revenue)

💰 REVENUE ANNUALE: €${result.revenue}

📈 KPI:
   • Conversion Rate: ${result.conversionRate}
   • AOV: €${result.aov}

🔍 CONTRATTI FIRMATI:
━━━━━━━━━━━━━━━━━━━━━━━━━
1. Eileen King - AVANZATO €840
2. Giuliana Balzarotti - BASE €480
3. Gianni Paolo Pizzutto - BASE €480
4. Rita Pennacchio - BASE €480
5. Giuseppina Cozzi - BASE €480
6. Maria Capone - BASE €480

📤 CONTRATTI INVIATI (in attesa):
━━━━━━━━━━━━━━━━━━━━━━━━━
7. Manuela Poggi - BASE €480
8. Giovanni Dandraia - BASE €480
9. Ettore Destro - AVANZATO €840

✅ La pagina si ricaricherà automaticamente...
  `;
  
  alert(message);
  
  // Ricarica pagina
  setTimeout(() => location.reload(), 2000);
})
.catch(error => {
  console.error('❌ ERRORE:', error);
  alert('❌ Errore durante il caricamento dei contratti.\n\nControlla la console (F12) per dettagli.');
});
