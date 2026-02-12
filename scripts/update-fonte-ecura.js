/**
 * SCRIPT AGGIORNAMENTO FONTE LEAD eCURA
 * 
 * Aggiorna il campo 'fonte' a 'Form eCura' per tutti i lead eCura
 * Totale: 179 lead
 * 
 * Distribuzione fonti attuali:
 * - IRBEMA: 170 lead
 * - (vuoto): 5 lead
 * - Website: 2 lead
 * - Web: 1 lead
 * - NETWORKING: 1 lead
 */

import fs from 'fs';

const API_BASE = 'https://telemedcare-v12.pages.dev';
const BATCH_SIZE = 50; // Aggiorna 50 lead alla volta

// Carica lista ID
const leadIds = JSON.parse(fs.readFileSync('/tmp/leads_to_update.json', 'utf8'));

console.log('🔄 AGGIORNAMENTO FONTE LEAD eCURA');
console.log('==================================');
console.log(`Totale lead da aggiornare: ${leadIds.length}`);
console.log(`Nuova fonte: "Form eCura"`);
console.log(`Batch size: ${BATCH_SIZE} lead per chiamata`);
console.log('');

async function updateBatch(batchIds) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/update-fonte-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        leadIds: batchIds,
        fonte: 'Form eCura'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      return { 
        success: true, 
        successCount: result.successCount,
        errorCount: result.errorCount,
        errors: result.errors
      };
    } else {
      return { 
        success: false, 
        error: result.error,
        successCount: 0,
        errorCount: batchIds.length
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      successCount: 0,
      errorCount: batchIds.length
    };
  }
}

async function updateAllLeads() {
  let totalSuccess = 0;
  let totalErrors = 0;
  const allErrors = [];

  console.log('📝 Inizio aggiornamento in batch...\n');

  // Dividi in batch
  const batches = [];
  for (let i = 0; i < leadIds.length; i += BATCH_SIZE) {
    batches.push(leadIds.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Totale batch: ${batches.length}\n`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`🔄 Batch ${i + 1}/${batches.length} (${batch.length} lead)...`);
    
    const result = await updateBatch(batch);

    if (result.success) {
      totalSuccess += result.successCount;
      totalErrors += result.errorCount || 0;
      
      if (result.errors && result.errors.length > 0) {
        allErrors.push(...result.errors);
      }
      
      console.log(`   ✅ OK: ${result.successCount}/${batch.length}`);
      if (result.errorCount > 0) {
        console.log(`   ❌ Errori: ${result.errorCount}`);
      }
    } else {
      totalErrors += batch.length;
      allErrors.push({ batch: i + 1, error: result.error });
      console.log(`   ❌ FALLITO: ${result.error}`);
    }

    // Pausa tra batch
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RISULTATO FINALE');
  console.log('='.repeat(50));
  console.log(`✅ Successo: ${totalSuccess}/${leadIds.length}`);
  console.log(`❌ Errori: ${totalErrors}/${leadIds.length}`);

  if (allErrors.length > 0) {
    console.log('\n⚠️  Errori dettagliati:');
    allErrors.slice(0, 10).forEach(err => {
      if (err.id) {
        console.log(`  - Lead ${err.id}: ${err.error}`);
      } else {
        console.log(`  - Batch ${err.batch}: ${err.error}`);
      }
    });
    
    if (allErrors.length > 10) {
      console.log(`  ... e altri ${allErrors.length - 10} errori`);
    }
  }

  console.log('\n✅ Aggiornamento completato!');
}

// Esegui
updateAllLeads().catch(console.error);
