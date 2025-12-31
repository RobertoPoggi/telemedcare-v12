/**
 * CLIENT-SIDE CONTRACT SETUP
 * Script eseguibile dal browser per popolare il database con i contratti dai PDF
 */

// Dati contratti da creare
const CONTRACTS_DATA = [
  {
    codice_contratto: 'CTR-PIZZUTTO-G-2025',
    leadId: 'LEAD-PIZZUTTO-G-001',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-05-12',
    data_firma: '2025-05-15',
    pdf_url: '/contratti/12.05.2025_Contratto Medica GB_TeleAssistenza SIDLY BASE_Gianni Paolo Pizzutto_firmato.pdf',
    cliente_nome: 'Gianni Paolo',
    cliente_cognome: 'Pizzutto',
    email: 'simonapizzutto.sp@gmail.com',
    telefono: '3450016665',
    canale: 'info@irbema.com',
    note: 'Contratto firmato - Riferimento: Simona Pizzutto (figlia)'
  },
  {
    codice_contratto: 'CTR-PENNACCHIO-2025',
    leadId: 'LEAD-PENNACCHIO-001',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-05-12',
    data_firma: '2025-05-14',
    pdf_url: '/contratti/12.05.2025_Contratto firmato SIDLY BASE_Pennacchio Rita - Contratto firmato.pdf',
    cliente_nome: 'Rita',
    cliente_cognome: 'Pennacchio',
    email: 'caterinadalterio108@gmail.com',
    telefono: '3898006744',
    canale: 'info@irbema.com',
    note: 'Contratto firmato'
  },
  {
    codice_contratto: 'CTR-KING-2025',
    leadId: 'LEAD-KING-001',
    tipo_contratto: 'AVANZATO',
    piano: 'AVANZATO',
    status: 'SIGNED',
    prezzo_totale: 840,
    data_invio: '2025-05-08',
    data_firma: '2025-05-10',
    pdf_url: '/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza Avanzato SIDLY FIRMATO_Eileen King.pdf',
    cliente_nome: 'Eileen',
    cliente_cognome: 'King',
    email: 'elenasaglia@hotmail.com',
    telefono: '3493416242',
    canale: 'info@irbema.com',
    note: 'Contratto firmato'
  },
  {
    codice_contratto: 'CTR-SAGLIA-2025',
    leadId: 'LEAD-SAGLIA-001',
    tipo_contratto: 'AVANZATO',
    piano: 'AVANZATO',
    status: 'SIGNED',
    prezzo_totale: 840,
    data_invio: '2025-05-05',
    data_firma: '2025-05-08',
    pdf_url: '/contratti/05.05.2025_Contratto Medica GB_TeleAssistenza Avanzata SIDLY_Sig.ra Elena Saglia.pdf',
    cliente_nome: 'Elena',
    cliente_cognome: 'Saglia',
    email: 'elenasaglia@hotmail.com',
    telefono: '3493416242',
    canale: 'info@irbema.com',
    note: '5/05 inviato contratto avanzato - FIRMATO'
  },
  {
    codice_contratto: 'CTR-DALTERIO-2025',
    leadId: 'LEAD-DALTERIO-001',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-05-08',
    data_firma: '2025-05-14',
    pdf_url: "/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza SIDLY BASE_Sig.ra Caterina D'Alterio .pdf",
    cliente_nome: 'Caterina',
    cliente_cognome: "D'Alterio",
    email: 'caterinadalterio108@gmail.com',
    telefono: '3898006744',
    canale: 'info@irbema.com',
    note: '08/05/2025 inviato contratto base - Pagamento 14/05 - FIRMATO'
  },
  {
    codice_contratto: 'CTR-PIZZUTTO-S-2025',
    leadId: 'LEAD-PIZZUTTO-S-001',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-05-08',
    data_firma: '2025-05-14',
    pdf_url: '/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza SIDLY BASE_Sig.ra Simona Pizzutto.pdf',
    cliente_nome: 'Simona',
    cliente_cognome: 'Pizzutto',
    email: 'simonapizzutto.sp@gmail.com',
    telefono: '3450016665',
    canale: 'info@irbema.com',
    note: '08/05/2025 inviato contratto base - Pagamento 14/05 - FIRMATO'
  },
  {
    codice_contratto: 'CTR-POGGI-2025',
    leadId: 'LEAD-POGGI-001',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SENT',
    prezzo_totale: 480,
    data_invio: '2025-05-08',
    data_firma: null,
    pdf_url: '/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza base SIDLY_Sig.ra Manuela Poggi.pdf',
    cliente_nome: 'Manuela',
    cliente_cognome: 'Poggi',
    email: 'manuela.poggi1@icloud.com',
    telefono: '',
    canale: 'info@irbema.com',
    note: '08/05/2025 inviato contratto - NON ancora firmato'
  },
  {
    codice_contratto: 'CTR-MAGRI-2025',
    leadId: 'LEAD-MAGRI-001',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-06-13',
    data_firma: '2025-06-16',
    pdf_url: '/contratti/13.06.2025_Contratto Medica GB_SIDLY BASE - Paolo Magri.pdf',
    cliente_nome: 'Paolo',
    cliente_cognome: 'Magri',
    email: 'paolo@paolomagri.com',
    telefono: '+41793311949',
    canale: 'info@irbema.com',
    note: '25/6 inviato contratto teleassistenza base - FIRMATO 16/06'
  }
];

// Funzione per creare i contratti tramite API
async function setupContractsFromPDF() {
  console.log('🚀 Inizio creazione contratti...');
  
  const results = {
    success: true,
    created: 0,
    errors: []
  };

  for (const contract of CONTRACTS_DATA) {
    try {
      console.log(`📝 Creando contratto: ${contract.codice_contratto}...`);
      
      // Crea lead
      const leadResponse = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contract.leadId,
          nomeRichiedente: contract.cliente_nome,
          cognomeRichiedente: contract.cliente_cognome,
          email: contract.email,
          telefono: contract.telefono,
          tipoServizio: 'eCura PRO',
          pacchetto: contract.piano,
          fonte: contract.canale.includes('irbema') ? 'IRBEMA' : 'WEB',
          status: contract.status === 'SIGNED' ? 'CONTRACT_SIGNED' : 'CONTRACT_SENT',
          vuoleContratto: true
        })
      });

      // Crea contratto
      const contractResponse = await fetch('/api/contracts-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contract)
      });

      if (contractResponse.ok) {
        results.created++;
        console.log(`✅ Contratto creato: ${contract.codice_contratto}`);
      } else {
        const error = await contractResponse.text();
        results.errors.push(`Errore ${contract.codice_contratto}: ${error}`);
        console.error(`❌ Errore: ${error}`);
      }

    } catch (error) {
      const msg = `Errore ${contract.codice_contratto}: ${error.message}`;
      results.errors.push(msg);
      console.error(`❌ ${msg}`);
      results.success = false;
    }
  }

  return results;
}

// Esporta per uso globale
window.setupContractsFromPDF = setupContractsFromPDF;
window.CONTRACTS_DATA = CONTRACTS_DATA;
