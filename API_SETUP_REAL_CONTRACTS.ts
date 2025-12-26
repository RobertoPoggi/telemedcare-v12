// ========================================
// SETUP REAL CONTRACTS - Load 8 real contracts from PDF files
// ========================================

app.post('/api/setup-real-contracts', async (c) => {
  try {
    if (!c.env?.DB) {
      return c.json({ success: false, error: 'Database not configured' }, 500)
    }

    const contracts = [
      {
        codice_contratto: 'CTR-MAGRI-2025',
        leadId: 'LEAD-MAGRI-001',
        tipo_contratto: 'BASE',
        status: 'DRAFT',
        prezzo_totale: 480.00,
        data_invio: null,
        pdf_url: '/contratti/13.06.2025_Contratto Medica GB_SIDLY BASE - Paolo Magri.pdf',
        cliente: {
          nomeRichiedente: 'Paolo',
          cognomeRichiedente: 'Magri',
          email: 'paolo@paolomagri.com',
          telefono: '+41 793311949',
          tipoServizio: 'eCura PRO',
          dispositivo: 'SiDLY CARE PRO',
          canaleAcquisizione: 'Excel'
        }
      },
      {
        codice_contratto: 'CTR-SAGLIA-2025',
        leadId: 'LEAD-SAGLIA-001',
        tipo_contratto: 'AVANZATO',
        status: 'DRAFT',
        prezzo_totale: 840.00,
        data_invio: null,
        pdf_url: '/contratti/05.05.2025_Contratto Medica GB_TeleAssistenza Avanzata SIDLY_Sig.ra Elena Saglia.pdf',
        cliente: {
          nomeRichiedente: 'Elena',
          cognomeRichiedente: 'Saglia',
          email: 'elena.saglia@email.it',
          telefono: '3331234567',
          tipoServizio: 'eCura PRO',
          dispositivo: 'SiDLY CARE PRO',
          canaleAcquisizione: 'Irbema'
        }
      },
      {
        codice_contratto: 'CTR-PIZZUTTO-S-2025',
        leadId: 'LEAD-PIZZUTTO-S-001',
        tipo_contratto: 'BASE',
        status: 'DRAFT',
        prezzo_totale: 480.00,
        data_invio: null,
        pdf_url: '/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza SIDLY BASE_Sig.ra Simona Pizzutto.pdf',
        cliente: {
          nomeRichiedente: 'Simona',
          cognomeRichiedente: 'Pizzutto',
          email: 'simonapizzutto.sp@gmail.com',
          telefono: '3450016665',
          tipoServizio: 'eCura PRO',
          dispositivo: 'SiDLY CARE PRO',
          canaleAcquisizione: 'AON'
        }
      },
      {
        codice_contratto: 'CTR-DALTERIO-2025',
        leadId: 'LEAD-DALTERIO-001',
        tipo_contratto: 'BASE',
        status: 'DRAFT',
        prezzo_totale: 480.00,
        data_invio: null,
        pdf_url: "/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza SIDLY BASE_Sig.ra Caterina D'Alterio .pdf",
        cliente: {
          nomeRichiedente: 'Caterina',
          cognomeRichiedente: "D'Alterio",
          email: 'caterina.dalterio@email.it',
          telefono: '3401234567',
          tipoServizio: 'eCura PRO',
          dispositivo: 'SiDLY CARE PRO',
          canaleAcquisizione: 'DoubleYou'
        }
      },
      {
        codice_contratto: 'CTR-PIZZUTTO-G-2025',
        leadId: 'LEAD-PIZZUTTO-G-001',
        tipo_contratto: 'BASE',
        status: 'SIGNED',
        prezzo_totale: 480.00,
        data_invio: '2025-05-12',
        data_firma: '2025-05-15',
        pdf_url: '/contratti/12.05.2025_Contratto Medica GB_TeleAssistenza SIDLY BASE_Gianni Paolo Pizzutto_firmato.pdf',
        cliente: {
          nomeRichiedente: 'Gianni Paolo',
          cognomeRichiedente: 'Pizzutto',
          email: 'simonapizzutto.sp@gmail.com',
          telefono: '3450016665',
          dataNascita: '1939-06-26',
          luogoNascita: 'CESSALTO',
          indirizzo: 'VIA COSTITUZIONE 5',
          citta: 'S. MAURO T.SE TO',
          codiceFiscale: 'PZZGNP39H26C580K',
          tipoServizio: 'eCura PRO',
          dispositivo: 'SiDLY CARE PRO',
          canaleAcquisizione: 'Excel',
          note: 'Contratto firmato - Riferimento: Simona Pizzutto (figlia)'
        }
      },
      {
        codice_contratto: 'CTR-POGGI-2025',
        leadId: 'LEAD-POGGI-001',
        tipo_contratto: 'BASE',
        status: 'SENT',
        prezzo_totale: 480.00,
        data_invio: '2025-05-08',
        pdf_url: '/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza base SIDLY_Sig.ra Manuela Poggi.pdf',
        cliente: {
          nomeRichiedente: 'Manuela',
          cognomeRichiedente: 'Poggi',
          email: 'manuela.poggi@email.it',
          telefono: '3351234567',
          tipoServizio: 'eCura PRO',
          dispositivo: 'SiDLY CARE PRO',
          canaleAcquisizione: 'Irbema',
          note: 'Contratto inviato - in attesa firma'
        }
      },
      {
        codice_contratto: 'CTR-PENNACCHIO-2025',
        leadId: 'LEAD-PENNACCHIO-001',
        tipo_contratto: 'BASE',
        status: 'SIGNED',
        prezzo_totale: 480.00,
        data_invio: '2025-05-12',
        data_firma: '2025-05-14',
        pdf_url: '/contratti/12.05.2025_Contratto firmato SIDLY BASE_Pennacchio Rita - Contratto firmato.pdf',
        cliente: {
          nomeRichiedente: 'Rita',
          cognomeRichiedente: 'Pennacchio',
          email: 'rita.pennacchio@email.it',
          telefono: '3361234567',
          tipoServizio: 'eCura PRO',
          dispositivo: 'SiDLY CARE PRO',
          canaleAcquisizione: 'AON',
          note: 'Contratto firmato'
        }
      },
      {
        codice_contratto: 'CTR-KING-2025',
        leadId: 'LEAD-KING-001',
        tipo_contratto: 'AVANZATO',
        status: 'SIGNED',
        prezzo_totale: 840.00,
        data_invio: '2025-05-08',
        data_firma: '2025-05-10',
        pdf_url: '/contratti/08.05.2025_Contratto Medica GB_TeleAssistenza Avanzato SIDLY FIRMATO_Eileen King.pdf',
        cliente: {
          nomeRichiedente: 'Eileen',
          cognomeRichiedente: 'King',
          email: 'eileen.king@email.com',
          telefono: '+44 7911123456',
          tipoServizio: 'eCura PRO',
          dispositivo: 'SiDLY CARE PRO',
          canaleAcquisizione: 'DoubleYou',
          note: 'Contratto firmato - Cliente internazionale'
        }
      }
    ]

    // First, create leads
    const leadsCreated = []
    for (const contract of contracts) {
      const leadId = contract.leadId
      const cliente = contract.cliente
      
      // Check if lead exists
      const existingLead = await c.env.DB.prepare('SELECT id FROM leads WHERE id = ?').bind(leadId).first()
      
      if (!existingLead) {
        await c.env.DB.prepare(`
          INSERT INTO leads (
            id, nomeRichiedente, cognomeRichiedente, email, telefono,
            tipoServizio, dispositivo, canaleAcquisizione, status, 
            vuoleContratto, vuoleBrochure, note, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          leadId,
          cliente.nomeRichiedente,
          cliente.cognomeRichiedente,
          cliente.email,
          cliente.telefono,
          cliente.tipoServizio,
          cliente.dispositivo,
          cliente.canaleAcquisizione,
          contract.status === 'SIGNED' ? 'CONVERTED' : contract.status === 'SENT' ? 'CONTRACT_SENT' : 'NEW',
          contract.status !== 'DRAFT' ? 'Si' : 'No',
          'No',
          cliente.note || '',
          new Date().toISOString()
        ).run()
        
        leadsCreated.push(leadId)
      }
    }

    // Then create contracts
    const contractsCreated = []
    for (const contract of contracts) {
      // Check if contract exists
      const existingContract = await c.env.DB.prepare('SELECT id FROM contracts WHERE codice_contratto = ?')
        .bind(contract.codice_contratto).first()
      
      if (!existingContract) {
        const contractId = `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        await c.env.DB.prepare(`
          INSERT INTO contracts (
            id, codice_contratto, leadId, tipo_contratto, status,
            prezzo_totale, data_invio, pdf_url, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          contractId,
          contract.codice_contratto,
          contract.leadId,
          contract.tipo_contratto,
          contract.status,
          contract.prezzo_totale,
          contract.data_invio,
          contract.pdf_url,
          new Date().toISOString()
        ).run()
        
        contractsCreated.push(contract.codice_contratto)
        
        // If signed, create signature
        if (contract.status === 'SIGNED' && contract.data_firma) {
          await c.env.DB.prepare(`
            INSERT INTO signatures (
              id, contract_id, signer_name, signature_date, created_at
            ) VALUES (?, ?, ?, ?, ?)
          `).bind(
            `sign-${contractId}`,
            contractId,
            `${contract.cliente.nomeRichiedente} ${contract.cliente.cognomeRichiedente}`,
            contract.data_firma,
            new Date().toISOString()
          ).run()
        }
      }
    }

    // Get totals
    const totalLeads = await c.env.DB.prepare('SELECT COUNT(*) as count FROM leads').first() as any
    const totalContracts = await c.env.DB.prepare('SELECT COUNT(*) as count FROM contracts').first() as any

    console.log('✅ Setup real contracts completed')
    console.log(`   - Leads created: ${leadsCreated.length}`)
    console.log(`   - Contracts created: ${contractsCreated.length}`)
    console.log(`   - Total leads: ${totalLeads?.count}`)
    console.log(`   - Total contracts: ${totalContracts?.count}`)

    return c.json({
      success: true,
      message: 'Real contracts setup completed',
      leadsCreated: leadsCreated.length,
      contractsCreated: contractsCreated.length,
      totalLeads: totalLeads?.count,
      totalContracts: totalContracts?.count,
      contracts: contractsCreated
    })

  } catch (error) {
    console.error('❌ Error setting up real contracts:', error)
    return c.json({
      success: false,
      error: 'Error setting up real contracts',
      details: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})
