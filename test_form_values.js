const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://telemedcare-v12.pages.dev/form-configurazione?leadId=LEAD-IRBEMA-00268&token=test123', {
    waitUntil: 'networkidle0'
  });
  
  // Wait for JavaScript to load data
  await page.waitForTimeout(3000);
  
  // Get all input values
  const values = await page.evaluate(() => {
    const inputs = {
      nome: document.getElementById('nome')?.value,
      cognome: document.getElementById('cognome')?.value,
      data_nascita: document.getElementById('data_nascita')?.value,
      eta: document.getElementById('eta')?.value,
      telefono: document.getElementById('telefono')?.value,
      email: document.getElementById('email')?.value,
      indirizzo: document.getElementById('indirizzo')?.value,
      peso: document.getElementById('peso')?.value,
      altezza: document.getElementById('altezza')?.value
    };
    return inputs;
  });
  
  console.log('📋 VALORI CAMPI FORM:');
  console.log(JSON.stringify(values, null, 2));
  
  await browser.close();
})();
