#!/usr/bin/env node
/**
 * =====================================================
 * Script: Test Singolo Lead - Verifica Email
 * =====================================================
 * Data Creazione: 02 Gennaio 2026 - 09:35
 * Scopo: Testa creazione lead e invio email
 * Database: telemedcare-leads
 * API: https://telemedcare-v12.pages.dev/api/leads
 * =====================================================
 */

import { readFileSync } from 'fs';

const API_URL = 'https://telemedcare-v12.pages.dev/api/leads';

const testLead = {
  "nomeRichiedente": "Test",
  "cognomeRichiedente": "Email",
  "email": "rpoggi55@gmail.com",
  "telefono": "+39 333 9999999",
  "nomeAssistito": "Test",
  "cognomeAssistito": "Assistito",
  "luogoNascita": "Milano",
  "dataNascita": "01/01/1950",
  "indirizzoAssistito": "Via Test 1",
  "capAssistito": "20121",
  "cittaAssistito": "Milano",
  "provinciaAssistito": "MI",
  "codiceFiscaleAssistito": "TSTSTS50A01F205Z",
  "servizio": "eCura PRO",
  "piano": "BASE",
  "canale": "Test Riparazione Email",
  "fonte": "Test",
  "vuoleBrochure": "Si",
  "vuoleContratto": "Si",
  "vuoleManuale": "No",
  "consensoPrivacy": true,
  "consensoMarketing": "Si",
  "consensoTerze": "No",
  "note": "Test riparazione automazione email"
};

async function testEmail() {
  console.log('🧪 TEST SINGOLO LEAD - Verifica Email\n');
  console.log('📤 Invio lead di test...');
  console.log(`   Email: ${testLead.email}`);
  console.log(`   Servizio: ${testLead.servizio} ${testLead.piano}`);
  console.log(`   Brochure: ${testLead.vuoleBrochure}, Contratto: ${testLead.vuoleContratto}\n`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testLead)
    });
    
    const result = await response.json();
    
    console.log('\n📊 RISULTATO:');
    console.log('='.repeat(50));
    
    if (result.success) {
      console.log(`✅ Lead creato: ${result.id || result.leadId}`);
      
      const emails = result.emails || result.emailAutomation;
      if (emails) {
        console.log('\n📧 EMAIL:');
        console.log(`   Notifica interno: ${emails.notifica?.sent ? '✅ INVIATA' : '❌ FALLITA'}`);
        if (emails.notifica?.error) console.log(`      Errore: ${emails.notifica.error}`);
        
        console.log(`   Brochure cliente: ${emails.brochure?.sent ? '✅ INVIATA' : '❌ FALLITA'}`);
        if (emails.brochure?.error) console.log(`      Errore: ${emails.brochure.error}`);
        
        console.log(`   Contratto cliente: ${emails.contratto?.sent ? '✅ INVIATA' : '❌ FALLITA'}`);
        if (emails.contratto?.error) console.log(`      Errore: ${emails.contratto.error}`);
      } else {
        console.log('\n⚠️ Nessuna informazione sulle email nella risposta');
      }
      
      console.log('\n📬 CONTROLLA INBOX:');
      console.log(`   rpoggi55@gmail.com → dovresti ricevere 2 email`);
      console.log(`   info@medicagb.it → dovrebbe ricevere 1 notifica`);
      
    } else {
      console.log(`❌ Errore creazione lead: ${result.error}`);
      if (result.details) console.log(`   Dettagli: ${result.details}`);
    }
    
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ ERRORE DI RETE:', error.message);
  }
}

testEmail();
