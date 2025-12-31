/**
 * =============================================
 * SCRIPT COMPLETO FIX DATABASE CONTRATTI
 * TeleMedCare V12.0
 * =============================================
 * 
 * COME USARE:
 * 1. Apri: https://telemedcare-v12.pages.dev/admin/data-dashboard
 * 2. Console (F12)
 * 3. Copia e incolla TUTTO questo script
 * 4. Premi ENTER
 * 
 * =============================================
 */

console.log('🔧 FIX DATABASE CONTRATTI - START\n');

// Email Giorgio Riela (per Maria Capone)
const GIORGIO_RIELA_EMAIL = prompt('📧 Inserisci email Giorgio Riela (figlio Maria Capone):', 'giorgio.riela@example.com');

async function sistemaDatabaseContratti() {
  const log = [];
  
  // STEP 1: Elimina tutti i contratti esistenti (reset completo)
  console.log('\n📋 STEP 1: Reset database contratti...');
  
  try {
    const resp = await fetch('/api/contratti');
    const data = await response.json();
    
    if (data.success && data.contratti) {
      console.log(`   Trovati ${data.contratti.length} contratti da eliminare`);
      
      for (const contratto of data.contratti) {
        try {
          await fetch(`/api/contratti/${contratto.id}`, { method: 'DELETE' });
          log.push(`✅ Eliminato: ${contratto.codice || contratto.id}`);
        } catch (err) {
          log.push(`⚠️ Errore eliminazione: ${err.message}`);
        }
      }
    }
  } catch (error) {
    log.push(`❌ Errore step 1: ${error.message}`);
  }
  
  // STEP 2: Ricrea contratti corretti
  console.log('\n📋 STEP 2: Ricrea contratti corretti...');
  
  try {
    const response = await fetch('/api/setup-real-contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (result.success) {
      log.push(`✅ Creati ${result.creati} contratti su ${result.risultati.length}`);
      console.table(result.risultati);
    } else {
      log.push(`❌ Errore creazione: ${result.error}`);
    }
  } catch (error) {
    log.push(`❌ Errore step 2: ${error.message}`);
  }
  
  // RIEPILOGO
  console.log('\n' + '='.repeat(60));
  console.log('📊 RIEPILOGO FIX');
  console.log('='.repeat(60));
  log.forEach(l => console.log(l));
  
  console.log('\n✅ FIX COMPLETATO!');
  console.log('🔄 Ricarica la pagina per vedere i contratti aggiornati');
  
  if (confirm('🔄 Ricaricare la pagina ora?')) {
    location.reload();
  }
}

// ESEGUI
sistemaDatabaseContratti();
