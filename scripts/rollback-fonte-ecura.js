/**
 * SCRIPT ROLLBACK FONTE LEAD eCURA
 * 
 * Ripristina le fonti originali per i 179 lead eCura
 * 
 * Fonti originali:
 * - IRBEMA: 175 lead
 * - Website: 2 lead
 * - Web: 1 lead
 * - NETWORKING: 1 lead
 */

import fs from 'fs';

const API_BASE = 'https://telemedcare-v12.pages.dev';

// Carica mapping ID → fonte originale
const fonteMapping = JSON.parse(fs.readFileSync('/tmp/fonte_rollback_mapping.json', 'utf8'));
const leadIds = Object.keys(fonteMapping);

console.log('🔙 ROLLBACK FONTE LEAD eCURA');
console.log('==================================');
console.log(`Totale lead da ripristinare: ${leadIds.length}`);
console.log('Fonti originali:');

// Conta fonti
const fonteCount = {};
Object.values(fonteMapping).forEach(fonte => {
  fonteCount[fonte] = (fonteCount[fonte] || 0) + 1;
});

Object.entries(fonteCount).sort((a, b) => b[1] - a[1]).forEach(([fonte, count]) => {
  console.log(`  - ${fonte || '(vuoto)'}: ${count} lead`);
});

console.log('');

async function rollbackBatch(updates) {
  // Raggruppa per fonte per ottimizzare le chiamate
  const byFonte = {};
  
  updates.forEach(({ leadId, fonte }) => {
    if (!byFonte[fonte]) {
      byFonte[fonte] = [];
    }
    byFonte[fonte].push(leadId);
  });
  
  let totalSuccess = 0;
  let totalErrors = 0;
  const errors = [];
  
  for (const [fonte, ids] of Object.entries(byFonte)) {
    console.log(`🔄 Ripristino ${ids.length} lead a fonte: "${fonte}"`);
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/update-fonte-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadIds: ids,
          fonte: fonte
        })
      });

      const result = await response.json();
      
      if (result.success) {
        totalSuccess += result.successCount;
        totalErrors += result.errorCount || 0;
        console.log(`   ✅ OK: ${result.successCount}/${ids.length}`);
        
        if (result.errors && result.errors.length > 0) {
          errors.push(...result.errors);
        }
      } else {
        totalErrors += ids.length;
        console.log(`   ❌ FALLITO: ${result.error}`);
        errors.push({ fonte, error: result.error });
      }
    } catch (error) {
      totalErrors += ids.length;
      console.log(`   ❌ ERRORE: ${error.message}`);
      errors.push({ fonte, error: error.message });
    }
    
    // Pausa tra batch
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return { totalSuccess, totalErrors, errors };
}

async function executeRollback() {
  console.log('📝 Inizio rollback...\n');
  
  // Prepara lista aggiornamenti
  const updates = leadIds.map(leadId => ({
    leadId,
    fonte: fonteMapping[leadId]
  }));
  
  const result = await rollbackBatch(updates);
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RISULTATO ROLLBACK');
  console.log('='.repeat(50));
  console.log(`✅ Ripristinati: ${result.totalSuccess}/${leadIds.length}`);
  console.log(`❌ Errori: ${result.totalErrors}/${leadIds.length}`);
  
  if (result.errors.length > 0) {
    console.log('\n⚠️  Errori dettagliati:');
    result.errors.slice(0, 10).forEach(err => {
      if (err.id) {
        console.log(`  - Lead ${err.id}: ${err.error}`);
      } else {
        console.log(`  - Fonte ${err.fonte}: ${err.error}`);
      }
    });
    
    if (result.errors.length > 10) {
      console.log(`  ... e altri ${result.errors.length - 10} errori`);
    }
  }
  
  console.log('\n✅ Rollback completato!');
}

// Esegui
executeRollback().catch(console.error);
