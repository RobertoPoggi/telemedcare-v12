#!/usr/bin/env node

/**
 * TROVA ZONE ID - Versione Node.js
 * Per Windows senza bash
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  Trova Zone ID per telemedcare.it');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

rl.question('Incolla il tuo Cloudflare API Token: ', (token) => {
  if (!token) {
    console.error('❌ Token non fornito. Uscita.');
    rl.close();
    process.exit(1);
  }

  console.log('');
  console.log('🔍 Cerco il Zone ID per telemedcare.it...');
  console.log('');

  const options = {
    hostname: 'api.cloudflare.com',
    path: '/client/v4/zones?name=telemedcare.it',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);

        if (response.result && response.result.length > 0) {
          const zoneId = response.result[0].id;
          
          console.log('✅ TROVATO!');
          console.log('');
          console.log('═══════════════════════════════════════════════════════════');
          console.log('Zone ID per telemedcare.it:');
          console.log('');
          console.log(`    ${zoneId}`);
          console.log('');
          console.log('═══════════════════════════════════════════════════════════');
          console.log('');
          console.log('Copia questo ID e usalo nello script setup');
          console.log('');
        } else {
          console.error('❌ Non trovato. Verifica:');
          console.error('1. Che il token API sia corretto');
          console.error('2. Che telemedcare.it sia nel tuo account Cloudflare');
          console.error('3. Che il token abbia permessi Zone:Read');
          console.error('');
          console.error('Risposta API:');
          console.error(data);
        }
      } catch (error) {
        console.error('❌ Errore parsing risposta:', error.message);
        console.error('Risposta raw:', data);
      }

      rl.close();
    });
  });

  req.on('error', (error) => {
    console.error('❌ Errore chiamata API:', error.message);
    rl.close();
  });

  req.end();
});
