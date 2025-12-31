/**
 * SETUP CONTRATTI DA PDF
 * Script per popolare il database con i contratti reali dai PDF caricati
 */

export interface ContractSetupData {
  codice_contratto: string;
  leadId: string;
  tipo_contratto: 'BASE' | 'AVANZATO';
  piano: 'BASE' | 'AVANZATO';
  status: 'DRAFT' | 'SENT' | 'SIGNED';
  prezzo_totale: number;
  data_invio: string | null;
  data_firma: string | null;
  pdf_url: string;
  cliente_nome: string;
  cliente_cognome: string;
  email: string;
  telefono: string;
  canale: string;
  note?: string;
}

/**
 * Dati contratti estratti dai PDF e dall'Excel
 * 
 * CONTRATTI FIRMATI (hanno generato assistiti):
 * 1. Gianni Paolo Pizzutto - FIRMATO
 * 2. Rita Pennacchio - FIRMATO
 * 3. Eileen King - FIRMATO  
 * 4. Elena Saglia - FIRMATO
 * 5. Caterina D'Alterio - FIRMATO
 * 6. Simona Pizzutto - FIRMATO
 * 
 * CONTRATTI INVIATI (NON ancora firmati):
 * 7. Manuela Poggi - SENT
 * 8. Paolo Magri - SENT (o FIRMATO? Excel dice firma 16/06)
 */
export const CONTRACTS_DATA: ContractSetupData[] = [
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

/**
 * Crea i contratti nel database
 */
export async function setupContractsFromPDF(db: D1Database): Promise<{
  success: boolean;
  created: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let created = 0;

  for (const contract of CONTRACTS_DATA) {
    try {
      // 1. Crea il lead se non esiste
      const existingLead = await db.prepare('SELECT id FROM leads WHERE id = ?')
        .bind(contract.leadId)
        .first();

      if (!existingLead) {
        await db.prepare(`
          INSERT INTO leads (
            id, nomeRichiedente, cognomeRichiedente, email, telefono,
            tipoServizio, fonte, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          contract.leadId,
          contract.cliente_nome,
          contract.cliente_cognome,
          contract.email,
          contract.telefono,
          'eCura PRO',
          contract.canale.includes('irbema') ? 'IRBEMA' : 'WEB',
          contract.status === 'SIGNED' ? 'CONTRACT_SIGNED' : 'CONTRACT_SENT',
          new Date().toISOString()
        ).run();
      }

      // 2. Crea il contratto
      const contractId = `CONTRACT_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      await db.prepare(`
        INSERT INTO contracts (
          id, leadId, codice_contratto, tipo_contratto, piano,
          status, prezzo_totale, data_invio, data_firma,
          pdf_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        contractId,
        contract.leadId,
        contract.codice_contratto,
        contract.tipo_contratto,
        contract.piano,
        contract.status,
        contract.prezzo_totale,
        contract.data_invio,
        contract.data_firma,
        contract.pdf_url,
        new Date().toISOString(),
        new Date().toISOString()
      ).run();

      created++;
      console.log(`✅ Contratto creato: ${contract.codice_contratto} (${contract.cliente_nome} ${contract.cliente_cognome})`);

    } catch (error) {
      const msg = `❌ Errore contratto ${contract.codice_contratto}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  return {
    success: errors.length === 0,
    created,
    errors
  };
}
