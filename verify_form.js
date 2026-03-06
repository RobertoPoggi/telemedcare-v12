// Usa fetch per simulare browser e verificare rendering finale
const fetch = require('node-fetch');

(async () => {
  try {
    const response = await fetch('https://telemedcare-v12.pages.dev/form-configurazione?leadId=LEAD-IRBEMA-00268&token=test123');
    const html = await response.text();
    
    // Cerca i campi input nel HTML
    const nomeMatch = html.match(/id="nome"[^>]*value="([^"]*)"/);
    const cognomeMatch = html.match(/id="cognome"[^>]*value="([^"]*)"/);
    const emailMatch = html.match(/id="email"[^>]*value="([^"]*)"/);
    const telefonoMatch = html.match(/id="telefono"[^>]*value="([^"]*)"/);
    
    console.log('📋 VALORI INITIAL HTML (prima di JS):');
    console.log('  Nome:', nomeMatch ? nomeMatch[1] : 'VUOTO');
    console.log('  Cognome:', cognomeMatch ? cognomeMatch[1] : 'VUOTO');
    console.log('  Email:', emailMatch ? emailMatch[1] : 'VUOTO');
    console.log('  Telefono:', telefonoMatch ? telefonoMatch[1] : 'VUOTO');
    
    console.log('\n⚠️ NOTA: Questi sono i valori STATICI nell\'HTML.');
    console.log('I valori vengono popolati da JavaScript DOPO il caricamento.');
    console.log('Per verificare i valori finali, apri Chrome DevTools → Elements → Inspect.');
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
})();
