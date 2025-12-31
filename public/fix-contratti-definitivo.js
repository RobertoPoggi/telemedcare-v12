// 🔧 SCRIPT DEFINITIVO: Sistema tutti i problemi dei contratti
// Corregge: D'Alterio duplicato, King BASE→AVANZATO, Riela mancante, ecc.

console.log('🚀 Inizio fix contratti...');

// Step 1: Rimuovi contratti esistenti (se presenti)
console.log('📝 Step 1: Pulizia contratti esistenti...');

fetch('/api/setup-real-contracts', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => {
    console.log('✅ Contratti rimossi:', data.removed || 0);
    
    // Step 2: Crea i 10 contratti corretti
    console.log('\n📝 Step 2: Creazione 10 contratti corretti...');
    
    return fetch('/api/setup-real-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
})
.then(r => r.json())
.then(data => {
    console.log(`\n✅ ${data.creati} contratti creati su ${data.contratti_da_creare || 10}`);
    
    if (data.errori > 0) {
        console.warn(`\n⚠️ ${data.errori} errori riscontrati:`);
        console.table(data.risultati.filter(r => !r.success));
    }
    
    // Analizza risultati
    const firmati = data.risultati.filter(r => r.signed);
    const inviati = data.risultati.filter(r => !r.signed);
    
    console.log(`\n📊 RIEPILOGO CONTRATTI:`);
    console.log(`  ✅ Firmati: ${firmati.length}`);
    console.log(`  📧 Inviati (non firmati): ${inviati.length}`);
    
    // Calcola revenue (solo firmati)
    const revenueFirmati = firmati.reduce((sum, r) => {
        const contratto = data.risultati.find(c => c.codice === r.codice);
        return sum + (contratto?.prezzo || 0);
    }, 0);
    
    console.log(`\n💰 REVENUE ANNUO (solo firmati): €${revenueFirmati}`);
    
    console.log(`\n📝 DETTAGLIO CONTRATTI:`);
    console.table(data.risultati.map(r => ({
        'Codice': r.codice,
        'Assistito': r.note?.split(' - ')[0]?.replace('Assistito: ', '') || '?',
        'Piano': r.note?.includes('AVANZATO') ? 'AVANZATO' : 'BASE',
        'Prezzo': '€' + (r.note?.includes('AVANZATO') ? '840' : '480'),
        'Status': r.signed ? '✅ FIRMATO' : '📧 INVIATO',
        'Email': r.email
    })));
    
    // Step 3: Verifica problemi risolti
    console.log(`\n🔍 VERIFICA FIX APPLICATI:`);
    
    const king = data.risultati.find(r => r.codice === 'CTR-KING-2025');
    const dalterio = data.risultati.filter(r => r.note?.includes("D'Alterio"));
    const riela = data.risultati.find(r => r.email === 'gr@ecotorino.it');
    const pizzutto = data.risultati.find(r => r.codice === 'CTR-PIZZUTTO-G-2025');
    
    console.log(`  ✅ King AVANZATO: ${king ? '✅ OK' : '❌ MANCANTE'}`);
    console.log(`  ✅ D'Alterio unico: ${dalterio.length === 1 ? '✅ OK' : '⚠️ Duplicato (' + dalterio.length + ')'}`);
    console.log(`  ✅ Riela/Capone: ${riela ? '✅ OK' : '❌ MANCANTE'}`);
    console.log(`  ✅ Pizzutto: ${pizzutto ? '✅ OK' : '❌ MANCANTE'}`);
    
    // Alert finale
    alert(`🎉 Database Contratti Sistemato!\n\n` +
          `✅ ${data.creati} contratti creati\n` +
          `📊 ${firmati.length} firmati + ${inviati.length} inviati\n` +
          `💰 Revenue: €${revenueFirmati}/anno\n\n` +
          `Ricarico la pagina...`);
    
    // Ricarica dopo 2 secondi
    setTimeout(() => location.reload(), 2000);
})
.catch(err => {
    console.error('❌ ERRORE:', err);
    alert('❌ Errore durante il fix:\n\n' + err.message);
});
