#!/usr/bin/env node

/**
 * Script per inserire lead di test
 * Uso: node insert-test-leads.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = 'https://telemedcare-v12.pages.dev/api/leads';

async function insertLead(leadData, index) {
  console.log(`\n📤 Inserimento Lead ${index + 1}/6: ${leadData.nomeRichiedente} ${leadData.cognomeRichiedente}`);
  console.log(`   Servizio: ${leadData.servizio} ${leadData.piano}`);
  console.log(`   Brochure: ${leadData.vuoleBrochure}, Contratto: ${leadData.vuoleContratto}`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leadData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`   ✅ Lead creato: ${result.id || result.leadId}`);
      
      if (result.emailAutomation || result.emails) {
        const emails = result.emailAutomation || result.emails;
        console.log(`   📧 Email inviate:`);
        if (emails.notifica?.sent) console.log(`      ✓ Notifica interno`);
        if (emails.brochure?.sent) console.log(`      ✓ Brochure cliente`);
        if (emails.contratto?.sent) console.log(`      ✓ Contratto cliente`);
        
        // Log errori
        if (emails.notifica?.error) console.log(`      ⚠️ Notifica: ${emails.notifica.error}`);
        if (emails.brochure?.error) console.log(`      ⚠️ Brochure: ${emails.brochure.error}`);
        if (emails.contratto?.error) console.log(`      ⚠️ Contratto: ${emails.contratto.error}`);
      }
      
      return true;
    } else {
      console.log(`   ❌ Errore: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Errore di rete:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 INSERIMENTO LEAD DI TEST');
  console.log('================================\n');
  
  // Leggi file JSON
  const testLeadsPath = join(__dirname, 'test-leads.json');
  const leadsData = JSON.parse(readFileSync(testLeadsPath, 'utf-8'));
  
  console.log(`📋 Trovati ${leadsData.length} lead da inserire`);
  console.log(`🎯 Target: ${API_URL}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  // Inserisci lead uno alla volta con delay
  for (let i = 0; i < leadsData.length; i++) {
    const success = await insertLead(leadsData[i], i);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Delay tra i lead per non sovraccaricare
    if (i < leadsData.length - 1) {
      console.log('   ⏳ Attendo 3 secondi...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n================================');
  console.log('📊 RIEPILOGO');
  console.log(`✅ Inseriti con successo: ${successCount}`);
  console.log(`❌ Falliti: ${failCount}`);
  console.log(`📧 Controlla le email a: rpoggi55@gmail.com`);
  console.log('================================\n');
}

main().catch(error => {
  console.error('❌ ERRORE FATALE:', error);
  process.exit(1);
});
