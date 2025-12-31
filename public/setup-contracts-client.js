/**
 * CLIENT-SIDE CONTRACT SETUP
 * Script eseguibile dal browser per popolare il database con i contratti dai PDF
 */

/**
 * CONTRATTI DA ASSOCIARE AI LEAD ESISTENTI
 * 
 * IMPORTANTE: I lead esistono già nel database!
 * Dobbiamo solo creare i contratti e associarli ai lead esistenti tramite email
 * 
 * ASSOCIAZIONI CARE GIVER → ASSISTITO:
 * 1. Elena Saglia (care giver) → Eileen King (assistito/madre)
 * 2. Paolo Magri (care giver) → Giuliana Balzarotti (assistito/madre) 
 * 3. Simona Pizzutto (care giver) → Gianni Paolo Pizzutto (assistito/padre)
 * 4. Altri contratti: care giver = assistito
 */
const CONTRACTS_DATA = [
  {
    codice_contratto: 'CTR-KING-2025',
    // Lead = Elena Saglia (figlia), Assistito = Eileen King (madre)
    care_giver_email: 'elenasaglia@hotmail.com',
    assistito_nome: 'Eileen',
    assistito_cognome: 'King',
    tipo_contratto: 'AVANZATO',
    piano: 'AVANZATO',
    status: 'SIGNED',
    prezzo_totale: 840,
    data_invio: '2025-05-08',
    data_firma: '2025-05-10',
    pdf_url: '/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza Avanzato SIDLY FIRMATO_Eileen King.pdf',
    note: 'Contratto AVANZATO firmato da Elena Saglia per madre Eileen King - BUONO'
  },
  {
    codice_contratto: 'CTR-BALZAROTTI-2025',
    // Lead = Paolo Magri (figlio), Assistito = Giuliana Balzarotti (madre)
    care_giver_email: 'paolo@paolomagri.com',
    assistito_nome: 'Giuliana',
    assistito_cognome: 'Balzarotti',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-06-13',
    data_firma: '2025-06-16',
    pdf_url: '/contratti/13.06.2025_Contratto Medica GB_SIDLY BASE - Paolo Magri.pdf',
    note: 'Contratto firmato da Paolo Magri per madre Giuliana Balzarotti'
  },
  {
    codice_contratto: 'CTR-PIZZUTTO-G-2025',
    // Lead = Simona Pizzutto (figlia), Assistito = Gianni Paolo Pizzutto (padre)
    care_giver_email: 'simonapizzutto.sp@gmail.com',
    assistito_nome: 'Gianni Paolo',
    assistito_cognome: 'Pizzutto',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-05-12',
    data_firma: '2025-05-15',
    pdf_url: '/contratti/12.05.2025_Contratto Medica GB_TeleAssistenza SIDLY BASE_Gianni Paolo Pizzutto_firmato.pdf',
    note: 'Contratto firmato da Simona Pizzutto per padre Gianni Paolo'
  },
  {
    codice_contratto: 'CTR-PENNACCHIO-2025',
    // Lead = Rita Pennacchio (stesso), Assistito = Rita Pennacchio
    care_giver_email: 'caterinadalterio108@gmail.com', // Email da Excel
    assistito_nome: 'Rita',
    assistito_cognome: 'Pennacchio',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-05-12',
    data_firma: '2025-05-14',
    pdf_url: '/contratti/12.05.2025_Contratto firmato SIDLY BASE_Pennacchio Rita - Contratto firmato.pdf',
    note: 'Contratto firmato'
  },
  {
    codice_contratto: 'CTR-DALTERIO-2025',
    // Lead = Caterina D'Alterio (stesso), Assistito = Caterina D'Alterio
    care_giver_email: 'caterinadalterio108@gmail.com',
    assistito_nome: 'Caterina',
    assistito_cognome: "D'Alterio",
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-05-08',
    data_firma: '2025-05-14',
    pdf_url: "/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza SIDLY BASE_Sig.ra Caterina D'Alterio .pdf",
    note: '08/05/2025 inviato contratto base - Pagamento 14/05 - FIRMATO'
  },
  {
    codice_contratto: 'CTR-CATTINI-2025',
    // Lead = Elisabetta Cattini (stesso), Assistito = Elisabetta Cattini (giuseppina cozzi)
    care_giver_email: 'elisabettacattini@gmail.com',
    assistito_nome: 'Giuseppina',
    assistito_cognome: 'Cozzi',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-07-10',
    data_firma: '2025-07-15',
    pdf_url: '/contratti/contratto_cattini_cozzi.pdf', // Da verificare
    note: 'Contratto firmato - Elisabetta Cattini per Giuseppina Cozzi'
  },
  {
    codice_contratto: 'CTR-POGGI-2025',
    // Lead = Manuela Poggi (stesso), Assistito = Manuela Poggi - NON FIRMATO
    care_giver_email: 'manuela.poggi1@icloud.com',
    assistito_nome: 'Manuela',
    assistito_cognome: 'Poggi',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SENT',
    prezzo_totale: 480,
    data_invio: '2025-05-08',
    data_firma: null,
    pdf_url: '/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza base SIDLY_Sig.ra Manuela Poggi.pdf',
    note: '08/05/2025 inviato contratto - NON ancora firmato - Mai restituito'
  }
];

// Funzione per creare i contratti associandoli ai lead esistenti
async function setupContractsFromPDF() {
  console.log('🚀 Inizio associazione contratti a lead esistenti...');
  
  const results = {
    success: true,
    created: 0,
    errors: [],
    details: []
  };

  // Prima otteniamo tutti i lead esistenti
  console.log('📋 Recupero lead esistenti...');
  const leadsResponse = await fetch('/api/leads?limit=200');
  const leadsData = await leadsResponse.json();
  const leads = leadsData.leads || [];
  
  console.log(`✅ Trovati ${leads.length} lead nel database`);

  for (const contract of CONTRACTS_DATA) {
    try {
      console.log(`\n📝 Processando contratto: ${contract.codice_contratto}...`);
      console.log(`   Care Giver Email: ${contract.care_giver_email}`);
      console.log(`   Assistito: ${contract.assistito_nome} ${contract.assistito_cognome}`);
      
      // Trova il lead tramite email del care giver
      const lead = leads.find(l => 
        l.email && l.email.toLowerCase() === contract.care_giver_email.toLowerCase()
      );
      
      if (!lead) {
        const error = `Lead non trovato per email: ${contract.care_giver_email}`;
        console.error(`❌ ${error}`);
        results.errors.push(error);
        results.details.push({
          codice: contract.codice_contratto,
          status: 'ERROR',
          error: error
        });
        continue;
      }
      
      console.log(`✅ Lead trovato: ${lead.id} - ${lead.nomeRichiedente} ${lead.cognomeRichiedente}`);
      
      // Crea il contratto usando l'API esistente
      const contractResponse = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          tipoContratto: contract.tipo_contratto
        })
      });

      if (!contractResponse.ok) {
        const errorText = await contractResponse.text();
        throw new Error(`API error: ${errorText}`);
      }

      const contractData = await contractResponse.json();
      console.log(`✅ Contratto creato: ${contractData.contract.codice}`);
      
      // Aggiorna il contratto con i dati corretti (status, date, codice personalizzato)
      const contractId = contractData.contract.id;
      
      const updateResponse = await fetch(`/api/contratti/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: contract.status,
          prezzo_totale: contract.prezzo_totale,
          data_invio: contract.data_invio,
          note: contract.note
        })
      });

      if (updateResponse.ok) {
        results.created++;
        results.details.push({
          codice: contract.codice_contratto,
          leadId: lead.id,
          contractId: contractId,
          status: 'CREATED',
          assistito: `${contract.assistito_nome} ${contract.assistito_cognome}`
        });
        console.log(`✅ Contratto aggiornato con successo!`);
      } else {
        const updateError = await updateResponse.text();
        console.warn(`⚠️ Contratto creato ma update fallito: ${updateError}`);
        results.created++;
        results.details.push({
          codice: contract.codice_contratto,
          leadId: lead.id,
          contractId: contractId,
          status: 'CREATED_PARTIAL',
          warning: 'Update fallito ma contratto creato'
        });
      }

    } catch (error) {
      const msg = `Errore ${contract.codice_contratto}: ${error.message}`;
      results.errors.push(msg);
      results.details.push({
        codice: contract.codice_contratto,
        status: 'ERROR',
        error: error.message
      });
      console.error(`❌ ${msg}`);
      results.success = false;
    }
  }

  console.log('\n📊 RIEPILOGO:');
  console.log(`   Creati: ${results.created}/${CONTRACTS_DATA.length}`);
  console.log(`   Errori: ${results.errors.length}`);
  
  return results;
}

// Esporta per uso globale
window.setupContractsFromPDF = setupContractsFromPDF;
window.CONTRACTS_DATA = CONTRACTS_DATA;
