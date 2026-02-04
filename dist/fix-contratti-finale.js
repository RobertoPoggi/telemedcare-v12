/**
 * =============================================
 * SCRIPT FINALE - FIX COMPLETO DATABASE CONTRATTI
 * TeleMedCare V12.0 - 31/12/2025
 * =============================================
 * 
 * ESEGUI QUESTO IN CONSOLE:
 * https://telemedcare-v12.pages.dev/admin/data-dashboard
 * 
 * Corregge tutti gli errori identificati
 * =============================================
 */

console.log('🔧 FIX DATABASE CONTRATTI - VERSIONE FINALE\n');

const CONTRATTI_CORRETTI = [
  // 1. EILEEN KING - AVANZATO €840 (non BASE!)
  {
    codice: 'CTR-KING-2025',
    email: 'elenasaglia@hotmail.com',
    cognome_fallback: 'King',
    assistito: 'Eileen King',
    caregiver: 'Elena Saglia (figlia)',
    tipo: 'AVANZATO',
    piano: 'AVANZATO',
    prezzo: 840,
    data_invio: '2025-05-08',
    data_firma: '2025-05-10',
    status: 'SIGNED',
    pdf: '/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza Avanzato SIDLY FIRMATO_Eileen King.pdf'
  },
  
  // 2. GIULIANA BALZAROTTI
  {
    codice: 'CTR-BALZAROTTI-2025',
    email: 'paolo@paolomagri.com',
    cognome_fallback: 'Balzarotti',
    assistito: 'Giuliana Balzarotti',
    caregiver: 'Paolo Magri (figlio)',
    tipo: 'BASE',
    piano: 'BASE',
    prezzo: 480,
    data_invio: '2025-06-13',
    data_firma: '2025-06-16',
    status: 'SIGNED',
    pdf: '/contratti/13.06.2025_Contratto Medica GB_SIDLY BASE - Paolo Magri.pdf'
  },
  
  // 3. GIANNI PAOLO PIZZUTTO
  {
    codice: 'CTR-PIZZUTTO-G-2025',
    email: 'simona.pizzutto@coopbarbarab.it',
    cognome_fallback: 'Pizzutto',
    assistito: 'Gianni Paolo Pizzutto',
    caregiver: 'Simona Pizzutto (figlia)',
    tipo: 'BASE',
    piano: 'BASE',
    prezzo: 480,
    data_invio: '2025-05-08',
    data_firma: '2025-05-15',
    status: 'SIGNED',
    pdf: '/contratti/12.05.2025_Contratto Medica GB_TeleAssistenza SIDLY BASE_Gianni Paolo Pizzutto_firmato.pdf'
  },
  
  // 4. RITA PENNACCHIO
  {
    codice: 'CTR-PENNACCHIO-2025',
    email: 'caterinadalterio108@gmail.com',
    cognome_fallback: 'Pennacchio',
    assistito: 'Rita Pennacchio',
    caregiver: 'Caterina D\'Alterio',
    tipo: 'BASE',
    piano: 'BASE',
    prezzo: 480,
    data_invio: '2025-05-08',
    data_firma: '2025-05-14',
    status: 'SIGNED',
    pdf: '/contratti/12.05.2025_Contratto firmato SIDLY BASE_Pennacchio Rita - Contratto firmato.pdf'
  },
  
  // 5. CATERINA D'ALTERIO (solo 1, non 2!)
  {
    codice: 'CTR-DALTERIO-2025',
    email: 'caterinadalterio108@gmail.com',
    cognome_fallback: 'D\'Alterio',
    assistito: 'Caterina D\'Alterio',
    caregiver: 'Stessa',
    tipo: 'BASE',
    piano: 'BASE',
    prezzo: 480,
    data_invio: '2025-05-08',
    data_firma: '2025-05-14',
    status: 'SIGNED',
    pdf: '/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza SIDLY BASE_Sig.ra Caterina D\'Alterio .pdf'
  },
  
  // 6. GIUSEPPINA COZZI
  {
    codice: 'CTR-COZZI-2025',
    email: 'elisabettacattini@gmail.com',
    cognome_fallback: 'Cozzi',
    assistito: 'Giuseppina Cozzi',
    caregiver: 'Elisabetta Cattini (figlia)',
    tipo: 'BASE',
    piano: 'BASE',
    prezzo: 480,
    data_invio: '2025-07-10',
    data_firma: '2025-07-15',
    status: 'SIGNED',
    pdf: '/contratti/Contratto_Giuseppina_Cozzi.pdf'
  },
  
  // 7. MARIA CAPONE - NUOVO! ✨
  {
    codice: 'CTR-CAPONE-2025',
    email: 'gr@ecotorino.it',
    cognome_fallback: 'Riela',
    assistito: 'Maria Capone',
    caregiver: 'Giorgio Riela (figlio)',
    tipo: 'BASE',
    piano: 'BASE',
    prezzo: 480,
    data_invio: '2025-06-25',
    data_firma: '2025-06-28',
    status: 'SIGNED',
    pdf: '/contratti/28.06.2025_Contratto_Medica_GB_bracciale_SiDLY_Maria_Capone.pdf'
  },
  
  // 8. MANUELA POGGI - NON FIRMATO
  {
    codice: 'CTR-POGGI-2025',
    email: 'manuela.poggi1@icloud.com',
    cognome_fallback: 'Poggi',
    assistito: 'Manuela Poggi',
    caregiver: 'Stessa',
    tipo: 'BASE',
    piano: 'BASE',
    prezzo: 480,
    data_invio: '2025-05-08',
    data_firma: null,
    status: 'SENT',
    pdf: '/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza base SIDLY_Sig.ra Manuela Poggi.pdf'
  },
  
  // 9. GIOVANNI DANDRAIA - NON FIRMATO
  {
    codice: 'CTR-DANDRAIA-2025',
    email: 'dandraia.g@gmail.com',
    cognome_fallback: 'Dandraia',
    assistito: 'Giovanni Dandraia',
    caregiver: 'Stesso',
    tipo: 'BASE',
    piano: 'BASE',
    prezzo: 480,
    data_invio: '2025-09-15',
    data_firma: null,
    status: 'SENT',
    pdf: '/contratti/Contratto Medica GB_SIDLY_Signor Giovanni Dandraia.pdf'
  },
  
  // 10. ETTORE DESTRO - NON FIRMATO (2 servizi AVANZATI)
  {
    codice: 'CTR-DESTRO-2025',
    email: 'ettoredestro@gmail.com',
    cognome_fallback: 'Destro',
    assistito: 'Ettore Destro',
    caregiver: 'Stesso',
    tipo: 'AVANZATO',
    piano: 'AVANZATO',
    prezzo: 840,
    data_invio: '2025-09-23',
    data_firma: null,
    status: 'SENT',
    pdf: '/contratti/23.09.2025_Contratto Medica GB_SIDLY_Ettore Destro_2 Servizi AVANZATI.pdf'
  }
];

async function fixDatabaseCompleto() {
  console.log('📊 CONTRATTI CORRETTI: 10 totali');
  console.log('   ✅ 7 FIRMATI (revenue)');
  console.log('   ⚠️ 3 INVIATI (non contano per revenue)\n');
  
  console.log('🔧 ESECUZIONE ENDPOINT...\n');
  
  try {
    const response = await fetch('/api/setup-real-contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    console.log('✅ RISULTATO:', result);
    console.table(result.risultati);
    
    // Calcola revenue
    const firmati = CONTRATTI_CORRETTI.filter(c => c.status === 'SIGNED');
    const totalRevenue = firmati.reduce((sum, c) => sum + c.prezzo, 0);
    
    console.log('\n💰 REVENUE ANNUALE CONTRATTI FIRMATI:');
    console.log(`   ${firmati.length} contratti firmati`);
    console.log(`   Totale: €${totalRevenue}/anno`);
    console.log(`   Dettaglio:`);
    console.log(`   - 1 AVANZATO: €840`);
    console.log(`   - 6 BASE: €${480 * 6}`);
    
    if (result.creati === 10) {
      alert(`🎉 SUCCESSO COMPLETO!\n\n` +
            `✅ 10 contratti creati\n` +
            `✅ 7 firmati (€${totalRevenue}/anno)\n` +
            `⚠️ 3 inviati\n\n` +
            `Ricarico la dashboard...`);
      setTimeout(() => location.reload(), 2000);
    } else {
      alert(`⚠️ Creati ${result.creati}/10 contratti\n` +
            `Errori: ${result.errori}\n\n` +
            `Vedi console per dettagli`);
    }
    
  } catch (error) {
    console.error('❌ ERRORE:', error);
    alert(`❌ Errore: ${error.message}`);
  }
}

// TABELLA RIEPILOGATIVA
console.table(CONTRATTI_CORRETTI.map(c => ({
  Codice: c.codice,
  Assistito: c.assistito,
  Email: c.email,
  Piano: c.piano,
  Prezzo: `€${c.prezzo}`,
  Stato: c.status === 'SIGNED' ? '✅ FIRMATO' : '⚠️ INVIATO',
  DataFirma: c.data_firma || '-'
})));

console.log('\n🚀 Premi ENTER per eseguire il fix...');

// AUTO-ESECUZIONE
fixDatabaseCompleto();
