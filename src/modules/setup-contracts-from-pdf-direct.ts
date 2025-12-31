/**
 * SETUP CONTRATTI - INSERIMENTO DIRETTO DATABASE
 * 
 * Questo modulo crea i contratti direttamente nella tabella contracts
 * associandoli ai lead esistenti tramite query SQL
 */

export interface ContractSetupData {
  codice_contratto: string;
  care_giver_email: string;
  assistito_nome: string;
  assistito_cognome: string;
  tipo_contratto: 'BASE' | 'AVANZATO';
  piano: 'BASE' | 'AVANZATO';
  status: 'DRAFT' | 'SENT' | 'SIGNED';
  prezzo_totale: number;
  data_invio: string;
  data_firma: string | null;
  pdf_url: string;
  note: string;
}

/**
 * Dati contratti da creare nel database
 * Basati sui PDF caricati e sull'Excel
 */
const CONTRACTS_TO_CREATE: ContractSetupData[] = [
  {
    codice_contratto: 'CTR-KING-2025',
    care_giver_email: 'elenasaglia@hotmail.com', // Elena Saglia (figlia)
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
    care_giver_email: 'paolo@paolomagri.com', // Paolo Magri (figlio)
    assistito_nome: 'Giuliana',
    assistito_cognome: 'Balzarotti',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-06-13',
    data_firma: '2025-06-16',
    pdf_url: '/contratti/13.06.2025_Contratto Medica GB_SIDLY BASE - Paolo Magri.pdf',
    note: 'Contratto BASE FIRMATO 16/06 da Paolo Magri (figlio) per madre Giuliana Balzarotti'
  },
  {
    codice_contratto: 'CTR-PIZZUTTO-G-2025',
    care_giver_email: 'simonapizzutto.sp@gmail.com', // Simona Pizzutto (figlia)
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
    care_giver_email: 'caterinadalterio108@gmail.com',
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
    codice_contratto: 'CTR-COZZI-2025',
    care_giver_email: 'elisabettacattini@gmail.com', // Elisabetta Cattini
    assistito_nome: 'Giuseppina',
    assistito_cognome: 'Cozzi',
    tipo_contratto: 'BASE',
    piano: 'BASE',
    status: 'SIGNED',
    prezzo_totale: 480,
    data_invio: '2025-07-10',
    data_firma: '2025-07-15',
    pdf_url: '/contratti/contratto_cattini_cozzi.pdf',
    note: 'Contratto firmato da Elisabetta Cattini per Giuseppina Cozzi'
  },
  {
    codice_contratto: 'CTR-POGGI-2025',
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

/**
 * Crea i contratti nel database con inserimento SQL diretto
 */
export async function setupContractsDirectDB(db: D1Database): Promise<{
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
  details: Array<{
    codice: string;
    status: 'CREATED' | 'SKIPPED' | 'ERROR';
    leadId?: string;
    contractId?: string;
    assistitoId?: string;
    error?: string;
  }>;
}> {
  const errors: string[] = [];
  const details: Array<any> = [];
  let created = 0;
  let skipped = 0;

  console.log('🚀 Inizio setup contratti con inserimento diretto DB...');

  for (const contractData of CONTRACTS_TO_CREATE) {
    try {
      console.log(`\n📝 Processando contratto: ${contractData.codice_contratto}`);
      console.log(`   Care Giver Email: ${contractData.care_giver_email}`);
      console.log(`   Assistito: ${contractData.assistito_nome} ${contractData.assistito_cognome}`);

      // 1. Trova il lead tramite email del care giver
      const lead = await db.prepare(`
        SELECT id, nomeRichiedente, cognomeRichiedente, email
        FROM leads
        WHERE LOWER(email) = LOWER(?)
        LIMIT 1
      `).bind(contractData.care_giver_email).first();

      if (!lead) {
        const error = `Lead non trovato per email: ${contractData.care_giver_email}`;
        console.error(`❌ ${error}`);
        errors.push(error);
        details.push({
          codice: contractData.codice_contratto,
          status: 'ERROR',
          error: error
        });
        continue;
      }

      console.log(`✅ Lead trovato: ${lead.id} - ${lead.nomeRichiedente} ${lead.cognomeRichiedente}`);

      // 2. Trova l'assistito tramite nome e cognome
      const assistito = await db.prepare(`
        SELECT id, nome, cognome, email
        FROM assistiti
        WHERE LOWER(nome) = LOWER(?) AND LOWER(cognome) = LOWER(?)
        LIMIT 1
      `).bind(contractData.assistito_nome, contractData.assistito_cognome).first();

      if (!assistito) {
        const error = `Assistito non trovato: ${contractData.assistito_nome} ${contractData.assistito_cognome}`;
        console.error(`❌ ${error}`);
        errors.push(error);
        details.push({
          codice: contractData.codice_contratto,
          status: 'ERROR',
          leadId: lead.id,
          error: error
        });
        continue;
      }

      console.log(`✅ Assistito trovato: ${assistito.id} - ${assistito.nome} ${assistito.cognome}`);

      // 3. Verifica se il contratto esiste già
      const existingContract = await db.prepare(`
        SELECT id FROM contracts WHERE codice_contratto = ?
      `).bind(contractData.codice_contratto).first();

      if (existingContract) {
        console.log(`⚠️ Contratto già esistente: ${contractData.codice_contratto}`);
        skipped++;
        details.push({
          codice: contractData.codice_contratto,
          status: 'SKIPPED',
          leadId: lead.id,
          contractId: existingContract.id,
          assistitoId: assistito.id
        });
        continue;
      }

      // 4. Genera ID univoco per il contratto
      const contractId = `CONTRACT_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const now = new Date().toISOString();

      // 5. Inserisci il contratto nella tabella contracts
      await db.prepare(`
        INSERT INTO contracts (
          id,
          leadId,
          codice_contratto,
          tipo_contratto,
          piano,
          status,
          prezzo_totale,
          prezzo_mensile,
          durata_mesi,
          data_invio,
          data_firma,
          pdf_url,
          note,
          email_sent,
          pdf_generated,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        contractId,
        lead.id,
        contractData.codice_contratto,
        contractData.tipo_contratto,
        contractData.piano,
        contractData.status,
        contractData.prezzo_totale,
        contractData.tipo_contratto === 'AVANZATO' ? 70 : 40, // Prezzo mensile
        12, // Durata mesi
        contractData.data_invio,
        contractData.data_firma,
        contractData.pdf_url,
        contractData.note,
        contractData.status === 'SIGNED' || contractData.status === 'SENT' ? 1 : 0,
        1, // PDF esiste (caricato)
        now,
        now
      ).run();

      console.log(`✅ Contratto creato nel DB: ${contractData.codice_contratto} (ID: ${contractId})`);

      // 6. Aggiorna lo status del lead
      const leadStatus = contractData.status === 'SIGNED' ? 'CONTRACT_SIGNED' : 
                        contractData.status === 'SENT' ? 'CONTRACT_SENT' : 
                        'CONTRACT_GENERATED';
      
      await db.prepare(`
        UPDATE leads 
        SET status = ?, updated_at = ?
        WHERE id = ?
      `).bind(leadStatus, now, lead.id).run();

      console.log(`✅ Lead aggiornato con status: ${leadStatus}`);

      // 7. Se firmato, crea/aggiorna la firma
      if (contractData.data_firma) {
        const signatureId = `SIG_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        await db.prepare(`
          INSERT OR REPLACE INTO signatures (
            id,
            contract_id,
            lead_id,
            timestamp_firma,
            metodo_firma,
            ip_address,
            user_agent,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          signatureId,
          contractId,
          lead.id,
          contractData.data_firma,
          'DIGITALE',
          '0.0.0.0',
          'PDF Upload',
          contractData.data_firma
        ).run();

        console.log(`✅ Firma registrata per contratto: ${contractData.codice_contratto}`);
      }

      created++;
      details.push({
        codice: contractData.codice_contratto,
        status: 'CREATED',
        leadId: lead.id,
        contractId: contractId,
        assistitoId: assistito.id
      });

    } catch (error) {
      const msg = `Errore contratto ${contractData.codice_contratto}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`❌ ${msg}`);
      errors.push(msg);
      details.push({
        codice: contractData.codice_contratto,
        status: 'ERROR',
        error: msg
      });
    }
  }

  console.log('\n📊 RIEPILOGO SETUP:');
  console.log(`   ✅ Creati: ${created}`);
  console.log(`   ⚠️ Saltati (già esistenti): ${skipped}`);
  console.log(`   ❌ Errori: ${errors.length}`);

  return {
    success: errors.length === 0,
    created,
    skipped,
    errors,
    details
  };
}
