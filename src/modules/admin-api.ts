/**
 * Admin API Module
 * Gestione dashboard amministratore TeleMedCare
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import { ProformaManager } from './proforma-manager.js';
import { EmailService } from './email-service.js';
import { generateProformaPDF } from './proforma-generator.js';
import { generateToken } from './config-form-api.js';

interface Bindings {
  DB: D1Database;
  [key: string]: any;
}

type AppContext = Context<{ Bindings: Bindings }>;

export const adminApi = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/admin/dashboard/stats
 * Statistiche generali per dashboard
 */
adminApi.get('/dashboard/stats', async (c: AppContext) => {
  const db = c.env.DB;
  
  try {
    // Stats leads
    const leadsStats = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'nuovo' THEN 1 ELSE 0 END) as nuovi,
        SUM(CASE WHEN status = 'CONTRACT_SENT' THEN 1 ELSE 0 END) as contratto_inviato,
        SUM(CASE WHEN status = 'CONTRACT_SIGNED' THEN 1 ELSE 0 END) as contratto_firmato,
        SUM(CASE WHEN status = 'PAYMENT_PENDING' THEN 1 ELSE 0 END) as pagamento_pendente,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as attivi
      FROM leads
    `).first();
    
    // Stats contratti - FIXED: Use signature_status instead of status
    const contractsStats = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN signature_status = 'PENDING' OR signature_status IS NULL THEN 1 ELSE 0 END) as in_attesa_firma,
        SUM(CASE WHEN signature_status = 'FIRMATO' THEN 1 ELSE 0 END) as firmati_manualmente,
        SUM(CASE WHEN signature_status = 'SIGNED_DOCUSIGN' THEN 1 ELSE 0 END) as firmati_docusign
      FROM contracts
    `).first();
    
    // Stats proforma (handle missing table gracefully)
    let proformasStats;
    try {
      proformasStats = await db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as in_attesa,
          SUM(CASE WHEN status = 'PAID_BANK_TRANSFER' THEN 1 ELSE 0 END) as pagate_bonifico,
          SUM(CASE WHEN status = 'PAID_STRIPE' THEN 1 ELSE 0 END) as pagate_stripe,
          SUM(prezzo_totale) as totale_importi
        FROM proforma
        WHERE status IN ('PENDING', 'PAID_BANK_TRANSFER', 'PAID_STRIPE')
      `).first();
    } catch (error) {
      console.warn('Proformas table not found:', error);
      proformasStats = { total: 0, in_attesa: 0, pagate_bonifico: 0, pagate_stripe: 0, totale_importi: 0 };
    }
    
    // Stats configurazioni
    let configurationsStats;
    try {
      configurationsStats = await db.prepare(`
        SELECT 
          COUNT(*) as total,
          COUNT(DISTINCT lead_id) as complete
        FROM configurations
      `).first();
    } catch (error) {
      console.warn('Configurations table not found:', error);
      configurationsStats = { total: 0, complete: 0 };
    }
    
    // Stats dispositivi (handle missing table gracefully)
    let devicesStats;
    try {
      devicesStats = await db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as disponibili,
          SUM(CASE WHEN status = 'TO_CONFIGURE' THEN 1 ELSE 0 END) as da_configurare,
          SUM(CASE WHEN status = 'ASSOCIATED' THEN 1 ELSE 0 END) as associati,
          SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) as in_manutenzione
        FROM devices
      `).first();
    } catch (error) {
      console.warn('Devices table not found:', error);
      devicesStats = { total: 0, disponibili: 0, da_configurare: 0, associati: 0, in_manutenzione: 0 };
    }
    
    // Stats assistiti
    let assistitiStats;
    try {
      assistitiStats = await db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN stato_servizio = 'ATTIVO' THEN 1 ELSE 0 END) as attivi,
          SUM(CASE WHEN stato_servizio = 'SOSPESO' THEN 1 ELSE 0 END) as sospesi,
          SUM(CASE WHEN stato_servizio = 'CESSATO' THEN 1 ELSE 0 END) as cessati
        FROM assistiti
      `).first();
    } catch (error) {
      console.warn('Assistiti table not found:', error);
      assistitiStats = { total: 0, attivi: 0, sospesi: 0, cessati: 0 };
    }
    
    return c.json({
      success: true,
      stats: {
        leads: leadsStats,
        contracts: contractsStats,
        proformas: proformasStats,
        configurations: configurationsStats,
        devices: devicesStats,
        assistiti: assistitiStats
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /api/admin/leads
 * Lista completa leads con filtri
 */
adminApi.get('/leads', async (c: AppContext) => {
  const db = c.env.DB;
  const status = c.req.query('status');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  
  try {
    let query = `
      SELECT 
        id,
        nomeRichiedente,
        cognomeRichiedente,
        emailRichiedente,
        telefonoRichiedente,
        pacchetto,
        status,
        timestamp,
        urgenzaRisposta
      FROM leads
    `;
    
    if (status) {
      query += ` WHERE status = ?`;
    }
    
    query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    
    const stmt = status 
      ? db.prepare(query).bind(status, limit, offset)
      : db.prepare(query).bind(limit, offset);
    
    const results = await stmt.all();
    
    return c.json({
      success: true,
      leads: results.results,
      pagination: {
        limit,
        offset,
        total: results.results.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /api/admin/leads/:id
 * Ottieni dettagli singolo lead
 */
adminApi.get('/leads/:id', async (c: AppContext) => {
  const db = c.env.DB;
  const leadId = c.req.param('id');
  
  try {
    const lead = await db.prepare(`
      SELECT * FROM leads WHERE id = ?
    `).bind(leadId).first() as any;
    
    if (!lead) {
      return c.json({ success: false, error: 'Lead not found' }, 404);
    }
    
    return c.json({
      success: true,
      lead
    });
    
  } catch (error: any) {
    console.error('Error fetching lead:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * PUT /api/admin/leads/:id
 * Aggiorna un lead
 */
adminApi.put('/leads/:id', async (c: AppContext) => {
  const db = c.env.DB;
  const leadId = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const {
      nomeRichiedente,
      cognomeRichiedente,
      emailRichiedente,
      telefonoRichiedente,
      indirizzoRichiedente,
      pacchetto,
      status
    } = body;
    
    // Verifica che il lead esista
    const existingLead = await db.prepare(`
      SELECT id FROM leads WHERE id = ?
    `).bind(leadId).first();
    
    if (!existingLead) {
      return c.json({ success: false, error: 'Lead not found' }, 404);
    }
    
    // Aggiorna il lead
    await db.prepare(`
      UPDATE leads 
      SET 
        nomeRichiedente = ?,
        cognomeRichiedente = ?,
        emailRichiedente = ?,
        telefonoRichiedente = ?,
        indirizzoRichiedente = ?,
        pacchetto = ?,
        status = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      nomeRichiedente,
      cognomeRichiedente,
      emailRichiedente,
      telefonoRichiedente || null,
      indirizzoRichiedente || null,
      pacchetto,
      status,
      leadId
    ).run();
    
    console.log(`✅ Lead ${leadId} aggiornato`);
    
    return c.json({
      success: true,
      message: 'Lead aggiornato con successo',
      lead_id: leadId
    });
    
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * DELETE /api/admin/leads/:id
 * Elimina un lead
 */
adminApi.delete('/leads/:id', async (c: AppContext) => {
  const db = c.env.DB;
  const leadId = c.req.param('id');
  
  try {
    // Verifica che il lead esista
    const lead = await db.prepare(`
      SELECT id, nomeRichiedente, cognomeRichiedente FROM leads WHERE id = ?
    `).bind(leadId).first() as any;
    
    if (!lead) {
      return c.json({ success: false, error: 'Lead not found' }, 404);
    }
    
    // Verifica se ci sono contratti associati
    const contracts = await db.prepare(`
      SELECT id FROM contracts WHERE lead_id = ?
    `).bind(leadId).first();
    
    if (contracts) {
      return c.json({ 
        success: false, 
        error: 'Non è possibile eliminare un lead con contratti associati. Elimina prima i contratti.' 
      }, 400);
    }
    
    // Elimina il lead
    await db.prepare(`DELETE FROM leads WHERE id = ?`).bind(leadId).run();
    
    console.log(`✅ Lead ${lead.nomeRichiedente} ${lead.cognomeRichiedente} eliminato`);
    
    return c.json({
      success: true,
      message: 'Lead eliminato con successo',
      lead_name: `${lead.nomeRichiedente} ${lead.cognomeRichiedente}`
    });
    
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /api/admin/contracts
 * Lista contratti con stato firma
 */
adminApi.get('/contracts', async (c: AppContext) => {
  const db = c.env.DB;
  const signatureStatus = c.req.query('signature_status');
  
  try {
    let query = `
      SELECT 
        c.id,
        c.codice_contratto,
        c.lead_id,
        c.contract_type as piano,
        c.status,
        c.signature_date,
        c.created_at,
        l.nomeRichiedente,
        l.cognomeRichiedente,
        l.emailRichiedente,
        l.pacchetto
      FROM contracts c
      LEFT JOIN leads l ON c.lead_id = l.id
    `;
    
    if (signatureStatus) {
      query += ` WHERE c.status = ?`;
    }
    
    query += ` ORDER BY c.created_at DESC`;
    
    const stmt = signatureStatus
      ? db.prepare(query).bind(signatureStatus)
      : db.prepare(query);
    
    const results = await stmt.all();
    
    return c.json({
      success: true,
      contracts: results.results
    });
  } catch (error: any) {
    console.error('Error fetching contracts:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/admin/contracts/:id/confirm-olografa
 * Conferma ricezione contratto con firma olografa
 */
adminApi.post('/contracts/:id/confirm-olografa', async (c: AppContext) => {
  const db = c.env.DB;
  const contractId = c.req.param('id');
  const body = await c.req.json();
  const { admin_email, notes } = body;
  
  try {
    // Aggiorna contratto con conferma firma olografa
    await db.prepare(`
      UPDATE contracts
      SET 
        status = 'SIGNED_MANUAL',
        signature_date = datetime('now')
      WHERE id = ?
    `).bind(contractId).run();
    
    return c.json({
      success: true,
      message: 'Ricezione firma olografa confermata con successo',
      contract_id: contractId
    });
  } catch (error: any) {
    console.error('Error confirming firma olografa:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/admin/contracts/:id/confirm-signature
 * Conferma firma manuale contratto
 */
adminApi.post('/contracts/:id/confirm-signature', async (c: AppContext) => {
  const db = c.env.DB;
  const contractId = c.req.param('id');
  const body = await c.req.json();
  const { signatureDate } = body;
  
  try {
    // Aggiorna contratto (usa solo campi che esistono nella tabella)
    await db.prepare(`
      UPDATE contracts
      SET 
        status = 'SIGNED_MANUAL',
        signature_date = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(signatureDate || new Date().toISOString().split('T')[0], contractId).run();
    
    // Ottieni lead_id del contratto
    const contract = await db.prepare(`
      SELECT lead_id, codice_contratto FROM contracts WHERE id = ?
    `).bind(contractId).first();
    
    if (!contract) {
      return c.json({ success: false, error: 'Contract not found' }, 404);
    }
    
    // Aggiorna status lead
    await db.prepare(`
      UPDATE leads
      SET status = 'CONTRACT_SIGNED'
      WHERE id = ?
    `).bind(contract.lead_id).run();
    
    // Genera proforma automaticamente
    try {
      // Ottieni dati del lead per generare la proforma
      const lead = await db.prepare(`
        SELECT * FROM leads WHERE id = ?
      `).bind(contract.lead_id).first() as any;
      
      if (lead) {
        // Genera codice proforma sequenziale
        const currentYear = new Date().getFullYear();
        const yearPrefix = `PFM_${currentYear}/`;
        
        const lastProforma = await db.prepare(`
          SELECT numero_proforma FROM proforma 
          WHERE numero_proforma LIKE ? 
          ORDER BY id DESC LIMIT 1
        `).bind(`${yearPrefix}%`).first() as any;
        
        let proformaCode = `${yearPrefix}0001`;
        if (lastProforma && lastProforma.numero_proforma) {
          const match = lastProforma.numero_proforma.match(/PFM_\d{4}\/(\d+)/);
          if (match) {
            const nextNumber = parseInt(match[1]) + 1;
            proformaCode = `${yearPrefix}${String(nextNumber).padStart(4, '0')}`;
          }
        }
        
        // Calcola importi - PREZZI UNA TANTUM con IVA inclusa
        // AVANZATO: €840 + IVA 22% = €1,024.80
        // BASE: €480 + IVA 22% = €585.60
        const prezzoBase = lead.pacchetto === 'AVANZATO' ? 840.00 : 480.00;
        const iva = 0.22; // 22%
        const importoTotale = prezzoBase * (1 + iva); // Prezzo con IVA inclusa
        
        // Per compatibilità DB (campi legacy)
        const prezzoMensile = 0; // Non applicabile per pagamento una tantum
        const durataMesi = 1; // Pagamento unico
        
        // Date - Pagamento a vista (scadenza = emissione)
        const dataEmissione = new Date().toISOString().split('T')[0];
        const dataScadenza = new Date(); // Stessa data per pagamento a vista
        const dueDate = dataScadenza.toISOString().split('T')[0];
        
        // Inserisci proforma nel database (tabella proforma senza S)
        // Genera ID univoco per la proforma
        const proformaId = `PRF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const proformaResult = await db.prepare(`
          INSERT INTO proforma (
            id, contract_id, lead_id, numero_proforma,
            data_emissione, data_scadenza,
            cliente_nome, cliente_cognome, cliente_email,
            tipo_servizio, prezzo_mensile, durata_mesi, prezzo_totale,
            status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', datetime('now'), datetime('now'))
        `).bind(
          proformaId,
          contractId,
          lead.id,
          proformaCode,
          dataEmissione,
          dueDate,
          lead.nomeRichiedente,
          lead.cognomeRichiedente,
          lead.emailRichiedente,
          lead.pacchetto || 'BASE',
          prezzoMensile,
          durataMesi,
          importoTotale
        ).run();
        
        console.log('✅ Proforma generata:', proformaCode);
        
        // Genera PDF della proforma
        try {
          const proformaPDF = await generateProformaPDF({
            numero_proforma: proformaCode,
            data_emissione: dataEmissione,
            data_scadenza: dueDate,
            
            nomeRichiedente: lead.nomeRichiedente,
            cognomeRichiedente: lead.cognomeRichiedente,
            emailRichiedente: lead.emailRichiedente,
            telefonoRichiedente: lead.telefonoRichiedente,
            indirizzoRichiedente: lead.indirizzoRichiedente,
            
            nomeAssistito: lead.nomeAssistito,
            cognomeAssistito: lead.cognomeAssistito,
            
            pacchetto: lead.pacchetto || 'BASE',
            prezzo_mensile: prezzoMensile,
            durata_mesi: durataMesi,
            prezzo_totale: importoTotale
          });
          
          // Invia email con la proforma usando EmailService
          console.log('📧 Tentativo invio email proforma a:', lead.emailRichiedente);
          console.log('📧 Dati ambiente:', { 
            hasSendGrid: !!c.env.SENDGRID_API_KEY,
            hasResend: !!c.env.RESEND_API_KEY 
          });
          
          const emailService = EmailService.getInstance();
          
          // Prepara l'allegato PDF in formato Base64
          const attachmentBase64 = Buffer.from(proformaPDF).toString('base64');
          
          const emailResult = await emailService.sendTemplateEmail(
            'INVIO_PROFORMA',
            lead.emailRichiedente,
            {
              NOME_CLIENTE: `${lead.nomeRichiedente} ${lead.cognomeRichiedente}`,
              NUMERO_PROFORMA: proformaCode,
              IMPORTO_TOTALE: `€${importoTotale.toFixed(2)}`,
              SCADENZA_PAGAMENTO: dueDate,
              CODICE_CLIENTE: lead.id?.toString() || '',
              PIANO_SERVIZIO: lead.pacchetto || 'BASE'
            },
            [{
              filename: `Proforma_${proformaCode}.pdf`,
              content: attachmentBase64,
              contentType: 'application/pdf'
            }],
            c.env
          );
          
          if (emailResult.success) {
            console.log('✅ Email proforma inviata con successo:', emailResult.messageId);
          } else {
            console.error('❌ Errore invio email proforma:', emailResult.error);
          }
          
          // Aggiorna proforma con PDF e info invio email
          const pdfBase64 = Buffer.from(proformaPDF).toString('base64');
          await db.prepare(`
            UPDATE proforma 
            SET 
              file_path = ?,
              content = ?,
              inviata_il = datetime('now')
            WHERE numero_proforma = ?
          `).bind(
            `/documents/proforma/${proformaCode}.pdf`,
            pdfBase64,
            proformaCode
          ).run();
          
          console.log('✅ PDF proforma salvato nel database');
          
        } catch (emailError) {
          console.error('⚠️ Errore invio email proforma:', emailError);
          // Continua comunque, la proforma è stata creata
        }
        
        return c.json({
          success: true,
          message: 'Firma confermata, proforma generata e inviata via email',
          contract_id: contractId,
          proforma_code: proformaCode,
          next_step: 'proforma_sent'
        });
      }
    } catch (proformaError) {
      console.error('⚠️ Errore generazione proforma:', proformaError);
      // Continua comunque, la proforma può essere generata manualmente dopo
    }
    
    return c.json({
      success: true,
      message: 'Firma confermata con successo',
      contract_id: contractId,
      next_step: 'generate_proforma_manually'
    });
  } catch (error: any) {
    console.error('Error confirming signature:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * DELETE /api/admin/contracts/:id
 * Elimina un contratto
 */
adminApi.delete('/contracts/:id', async (c: AppContext) => {
  const db = c.env.DB;
  const contractId = c.req.param('id');
  
  try {
    // Verifica che il contratto esista
    const contract = await db.prepare(`
      SELECT codice_contratto, status FROM contracts WHERE id = ?
    `).bind(contractId).first() as any;
    
    if (!contract) {
      return c.json({ success: false, error: 'Contract not found' }, 404);
    }
    
    // Non permettere cancellazione di contratti firmati con proforma
    if (contract.status === 'SIGNED_MANUAL' || contract.status === 'SIGNED_DIGITAL') {
      // Verifica se esiste proforma associata
      const proforma = await db.prepare(`
        SELECT id FROM proforma WHERE contract_id = ?
      `).bind(contractId).first();
      
      if (proforma) {
        return c.json({ 
          success: false, 
          error: 'Non è possibile eliminare un contratto con proforma associata. Elimina prima la proforma.' 
        }, 400);
      }
    }
    
    // Elimina il contratto
    await db.prepare(`DELETE FROM contracts WHERE id = ?`).bind(contractId).run();
    
    console.log(`✅ Contratto ${contract.codice_contratto} eliminato`);
    
    return c.json({
      success: true,
      message: 'Contratto eliminato con successo',
      contract_code: contract.codice_contratto
    });
    
  } catch (error: any) {
    console.error('Error deleting contract:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /api/admin/proformas
 * Lista proforma con stato pagamento
 */
adminApi.get('/proformas', async (c: AppContext) => {
  const db = c.env.DB;
  const status = c.req.query('status');
  
  try {
    let query = `
      SELECT 
        p.id,
        p.numero_proforma as proforma_code,
        p.lead_id,
        p.prezzo_totale as amount,
        'EUR' as currency,
        p.status,
        p.data_emissione as issue_date,
        p.data_scadenza as due_date,
        p.data_pagamento as payment_date,
        p.created_at,
        l.nomeRichiedente,
        l.cognomeRichiedente,
        l.emailRichiedente,
        l.pacchetto
      FROM proforma p
      LEFT JOIN leads l ON p.lead_id = l.id
    `;
    
    if (status) {
      query += ` WHERE p.status = ?`;
    }
    
    query += ` ORDER BY p.created_at DESC`;
    
    const stmt = status
      ? db.prepare(query).bind(status)
      : db.prepare(query);
    
    const results = await stmt.all();
    
    return c.json({
      success: true,
      proformas: results.results
    });
  } catch (error: any) {
    console.error('Error fetching proformas:', error);
    // Return empty array if table doesn't exist
    return c.json({ success: true, proformas: [] });
  }
});

/**
 * POST /api/admin/proformas/:id/resend-email
 * Reinvia email proforma al cliente
 */
adminApi.post('/proformas/:id/resend-email', async (c: AppContext) => {
  const db = c.env.DB;
  const proformaId = c.req.param('id');
  
  try {
    // Get proforma details from database
    const proforma = await db.prepare(`
      SELECT 
        p.numero_proforma,
        p.lead_id,
        p.data_emissione,
        p.data_scadenza,
        p.prezzo_totale,
        p.prezzo_mensile,
        p.durata_mesi,
        p.tipo_servizio,
        p.content as pdf_content,
        l.nomeRichiedente,
        l.cognomeRichiedente,
        l.emailRichiedente,
        l.telefonoRichiedente,
        l.indirizzoRichiedente,
        l.pacchetto
      FROM proforma p
      LEFT JOIN leads l ON p.lead_id = l.id
      WHERE p.id = ?
    `).bind(proformaId).first() as any;
    
    if (!proforma) {
      return c.json({ success: false, error: 'Proforma not found' }, 404);
    }
    
    // Ensure prezzo_totale exists
    if (!proforma.prezzo_totale) {
      console.error('⚠️ prezzo_totale missing for proforma:', proforma.numero_proforma);
      return c.json({ 
        success: false, 
        error: 'Proforma prezzo_totale non trovato. Dati incompleti.' 
      }, 400);
    }
    
    // Check if email service is configured
    if (!c.env.SENDGRID_API_KEY && !c.env.RESEND_API_KEY) {
      return c.json({ 
        success: false, 
        error: 'Email service not configured. Please set SENDGRID_API_KEY or RESEND_API_KEY in .dev.vars' 
      }, 503);
    }
    
    // Prepare email data
    const emailService = EmailService.getInstance();
    
    // Get PDF content from database
    let pdfBuffer: Buffer;
    if (proforma.pdf_content) {
      // PDF is stored as base64 in the database
      pdfBuffer = Buffer.from(proforma.pdf_content, 'base64');
    } else {
      // If PDF not in DB, regenerate it
      const { generateProformaPDF } = await import('./proforma-generator');
      pdfBuffer = await generateProformaPDF({
        numero_proforma: proforma.numero_proforma,
        data_emissione: proforma.data_emissione,
        data_scadenza: proforma.data_scadenza,
        nomeRichiedente: proforma.nomeRichiedente,
        cognomeRichiedente: proforma.cognomeRichiedente,
        emailRichiedente: proforma.emailRichiedente,
        nomeAssistito: '',
        cognomeAssistito: '',
        pacchetto: proforma.pacchetto || 'BASE',
        prezzo_mensile: proforma.prezzo_mensile,
        durata_mesi: proforma.durata_mesi,
        prezzo_totale: proforma.prezzo_totale
      });
    }
    
    // Prepare attachment
    const attachmentBase64 = pdfBuffer.toString('base64');
    
    // Send email with proforma
    console.log(`📧 Reinvio email proforma ${proforma.numero_proforma} a:`, proforma.emailRichiedente);
    
    // Safe price formatting with robust validation
    let prezzoTotale = 0;
    try {
      const parsed = parseFloat(String(proforma.prezzo_totale || '0'));
      prezzoTotale = isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      console.error('⚠️ Error parsing prezzo_totale:', e);
      prezzoTotale = 0;
    }
    
    console.log('📊 Prezzo totale formattato:', prezzoTotale);
    
    const emailResult = await emailService.sendTemplateEmail(
      'INVIO_PROFORMA',
      proforma.emailRichiedente,
      {
        NOME_CLIENTE: `${proforma.nomeRichiedente || ''} ${proforma.cognomeRichiedente || ''}`,
        NUMERO_PROFORMA: proforma.numero_proforma || '',
        IMPORTO_TOTALE: `€${prezzoTotale.toFixed(2)}`,
        SCADENZA_PAGAMENTO: proforma.data_scadenza || '',
        CODICE_CLIENTE: String(proforma.lead_id || ''),
        PIANO_SERVIZIO: proforma.tipo_servizio || proforma.pacchetto || 'BASE'
      },
      [{
        filename: `Proforma_${proforma.numero_proforma}.pdf`,
        content: attachmentBase64,
        contentType: 'application/pdf'
      }],
      c.env
    );
    
    if (emailResult.success) {
      console.log('✅ Email proforma reinviata con successo:', emailResult.messageId);
      
      // Update proforma sent timestamp
      await db.prepare(`
        UPDATE proforma 
        SET inviata_il = datetime('now')
        WHERE id = ?
      `).bind(proformaId).run();
      
      return c.json({
        success: true,
        message: 'Email proforma reinviata con successo',
        messageId: emailResult.messageId,
        sentTo: proforma.emailRichiedente
      });
    } else {
      console.error('❌ Errore reinvio email proforma:', emailResult.error);
      return c.json({
        success: false,
        error: emailResult.error || 'Errore durante l\'invio dell\'email'
      }, 500);
    }
    
  } catch (error: any) {
    console.error('Error resending proforma email:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Errore durante il reinvio dell\'email' 
    }, 500);
  }
});

/**
 * POST /api/admin/proformas/:id/confirm-payment
 * Conferma pagamento bonifico
 */
adminApi.post('/proformas/:id/confirm-payment', async (c: AppContext) => {
  const db = c.env.DB;
  const proformaId = c.req.param('id');
  const body = await c.req.json();
  const { admin_email, payment_reference, notes } = body;
  
  try {
    // Aggiorna proforma
    await db.prepare(`
      UPDATE proforma
      SET 
        status = 'PAID_BANK_TRANSFER',
        data_pagamento = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(proformaId).run();
    
    // Ottieni lead_id della proforma
    const proforma = await db.prepare(`
      SELECT lead_id, numero_proforma as proforma_code, prezzo_totale FROM proforma WHERE id = ?
    `).bind(proformaId).first();
    
    if (!proforma) {
      return c.json({ success: false, error: 'Proforma not found' }, 404);
    }
    
    // Aggiorna status lead
    await db.prepare(`
      UPDATE leads
      SET status = 'PAYMENT_CONFIRMED'
      WHERE id = ?
    `).bind(proforma.lead_id).run();
    
    // Invia email benvenuto con form configurazione
    try {
      const lead = await db.prepare(`
        SELECT * FROM leads WHERE id = ?
      `).bind(proforma.lead_id).first() as any;
      
      if (lead) {
        const emailService = EmailService.getInstance();
        
        console.log(`📧 Invio email benvenuto a: ${lead.emailRichiedente}`);
        
        // Generate secure token for configuration form
        const configToken = generateToken(lead.id);
        const baseUrl = new URL(c.req.url).origin;
        const configFormUrl = `${baseUrl}/api/config-form/${lead.id}/${configToken}`;
        
        console.log(`🔗 Form configurazione URL: ${configFormUrl}`);
        
        const emailResult = await emailService.sendTemplateEmail(
          'BENVENUTO',
          lead.emailRichiedente,
          {
            NOME_CLIENTE: `${lead.nomeRichiedente} ${lead.cognomeRichiedente}`,
            PIANO_SERVIZIO: lead.pacchetto || 'BASE',
            COSTO_SERVIZIO: proforma.prezzo_totale ? `EUR ${proforma.prezzo_totale}` : 'N/A',
            DATA_ATTIVAZIONE: new Date().toISOString().split('T')[0],
            CODICE_CLIENTE: lead.id,
            SERVIZI_INCLUSI: lead.pacchetto === 'AVANZATO' 
              ? 'Dispositivo SiDLY Care PRO + Monitoraggio H24 + Centrale Operativa'
              : 'Dispositivo SiDLY Care PRO + Monitoraggio base',
            LINK_CONFIGURAZIONE: configFormUrl
          },
          [],
          c.env
        );
        
        if (emailResult.success) {
          console.log(`✅ Email benvenuto inviata con successo: ${emailResult.messageId}`);
          
          // Update lead status to ACTIVE (servizio attivato)
          await db.prepare(`
            UPDATE leads SET status = 'ACTIVE' WHERE id = ?
          `).bind(lead.id).run();
        } else {
          console.error(`❌ Errore invio email benvenuto: ${emailResult.error}`);
        }
      }
    } catch (emailError) {
      console.error('❌ Errore invio email benvenuto:', emailError);
      // Non bloccare il pagamento se l'email fallisce
    }
    
    return c.json({
      success: true,
      message: 'Pagamento confermato con successo. Email benvenuto inviata.',
      proforma_id: proformaId,
      email_sent: true
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/admin/proformas/:id/resend-welcome-email
 * Re-invia email di benvenuto con link configurazione
 */
adminApi.post('/proformas/:id/resend-welcome-email', async (c: AppContext) => {
  const db = c.env.DB;
  const proformaId = c.req.param('id');
  
  try {
    // Recupera dati proforma e lead
    const proforma: any = await db.prepare(`
      SELECT lead_id, numero_proforma as proforma_code, prezzo_totale FROM proforma WHERE id = ?
    `).bind(proformaId).first();
    
    if (!proforma) {
      return c.json({ success: false, error: 'Proforma non trovata' }, 404);
    }
    
    const lead: any = await db.prepare(`
      SELECT * FROM leads WHERE id = ?
    `).bind(proforma.lead_id).first();
    
    if (!lead) {
      return c.json({ success: false, error: 'Lead non trovato' }, 404);
    }
    
    // Importa funzioni token
    const { generateToken } = await import('./config-form-api');
    const emailService = (await import('./email-service')).default.getInstance();
    
    // Genera token per form configurazione
    const configToken = generateToken(lead.id);
    const baseUrl = new URL(c.req.url).origin;
    const configFormUrl = `${baseUrl}/api/config-form/${lead.id}/${configToken}`;
    
    console.log(`📧 Re-invio email benvenuto a: ${lead.emailRichiedente}`);
    console.log(`🔗 Form configurazione URL: ${configFormUrl}`);
    
    // Invia email di benvenuto
    const emailResult = await emailService.sendTemplateEmail(
      'BENVENUTO',
      lead.emailRichiedente,
      {
        NOME_CLIENTE: `${lead.nomeRichiedente} ${lead.cognomeRichiedente}`,
        PIANO_SERVIZIO: lead.pacchetto || 'BASE',
        COSTO_SERVIZIO: proforma.prezzo_totale ? `EUR ${proforma.prezzo_totale}` : 'N/A',
        DATA_ATTIVAZIONE: new Date().toISOString().split('T')[0],
        CODICE_CLIENTE: lead.id,
        SERVIZI_INCLUSI: lead.pacchetto === 'AVANZATO' 
          ? 'Dispositivo SiDLY Care PRO + Monitoraggio H24 + Centrale Operativa'
          : 'Dispositivo SiDLY Care PRO + Monitoraggio base',
        LINK_CONFIGURAZIONE: configFormUrl
      },
      [],
      c.env
    );
    
    if (!emailResult.success) {
      return c.json({ 
        success: false, 
        error: `Errore invio email: ${emailResult.error}` 
      }, 500);
    }
    
    console.log(`✅ Email benvenuto re-inviata con successo`);
    
    return c.json({
      success: true,
      message: 'Email di benvenuto re-inviata con successo',
      config_form_url: configFormUrl
    });
  } catch (error: any) {
    console.error('❌ Errore re-invio email benvenuto:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * DELETE /api/admin/proformas/:id
 * Elimina una proforma
 */
adminApi.delete('/proformas/:id', async (c: AppContext) => {
  const db = c.env.DB;
  const proformaId = c.req.param('id');
  
  try {
    // Verifica che la proforma esista
    const proforma = await db.prepare(`
      SELECT numero_proforma, status FROM proforma WHERE id = ?
    `).bind(proformaId).first() as any;
    
    if (!proforma) {
      return c.json({ success: false, error: 'Proforma not found' }, 404);
    }
    
    // Non permettere cancellazione di proforma pagate
    if (proforma.status === 'PAID') {
      return c.json({ 
        success: false, 
        error: 'Non è possibile eliminare una proforma già pagata' 
      }, 400);
    }
    
    // Elimina la proforma
    await db.prepare(`DELETE FROM proforma WHERE id = ?`).bind(proformaId).run();
    
    console.log(`✅ Proforma ${proforma.numero_proforma} eliminata`);
    
    return c.json({
      success: true,
      message: 'Proforma eliminata con successo',
      proforma_code: proforma.numero_proforma
    });
    
  } catch (error: any) {
    console.error('Error deleting proforma:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /api/admin/devices
 * Lista dispositivi con stato
 */
adminApi.get('/devices', async (c: AppContext) => {
  const db = c.env.DB;
  const status = c.req.query('status');
  
  try {
    let query = `
      SELECT 
        d.id,
        d.device_code,
        d.serial_number,
        d.device_type,
        d.model,
        d.status,
        d.lead_id,
        d.associated_at,
        d.associated_by,
        d.configured_at,
        d.admin_notes,
        d.created_at,
        l.nomeRichiedente,
        l.cognomeRichiedente
      FROM devices d
      LEFT JOIN leads l ON d.lead_id = l.id
    `;
    
    if (status) {
      query += ` WHERE d.status = ?`;
    }
    
    query += ` ORDER BY d.created_at DESC`;
    
    const stmt = status
      ? db.prepare(query).bind(status)
      : db.prepare(query);
    
    const results = await stmt.all();
    
    return c.json({
      success: true,
      devices: results.results
    });
  } catch (error: any) {
    console.error('Error fetching devices:', error);
    // Return empty array if table doesn't exist
    return c.json({ success: true, devices: [] });
  }
});

/**
 * GET /api/admin/devices/:id
 * Ottieni dettagli dispositivo singolo
 */
adminApi.get('/devices/:id', async (c: AppContext) => {
  const db = c.env.DB;
  const deviceId = c.req.param('id');
  
  try {
    const device = await db.prepare(`
      SELECT 
        d.*,
        l.nomeRichiedente,
        l.cognomeRichiedente,
        l.emailRichiedente
      FROM devices d
      LEFT JOIN leads l ON d.lead_id = l.id
      WHERE d.id = ?
    `).bind(deviceId).first();
    
    if (!device) {
      return c.json({ success: false, error: 'Dispositivo non trovato' }, 404);
    }
    
    return c.json({ success: true, device });
  } catch (error: any) {
    console.error('Error fetching device:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * DELETE /api/admin/devices/:id
 * Elimina dispositivo
 */
adminApi.delete('/devices/:id', async (c: AppContext) => {
  const db = c.env.DB;
  const deviceId = c.req.param('id');
  
  try {
    // Verifica che non sia associato
    const device: any = await db.prepare(`
      SELECT status FROM devices WHERE id = ?
    `).bind(deviceId).first();
    
    if (!device) {
      return c.json({ success: false, error: 'Dispositivo non trovato' }, 404);
    }
    
    if (device.status === 'ASSOCIATED') {
      return c.json({ 
        success: false, 
        error: 'Impossibile eliminare un dispositivo associato. Dissocia prima il dispositivo.' 
      }, 400);
    }
    
    await db.prepare(`DELETE FROM devices WHERE id = ?`).bind(deviceId).run();
    
    return c.json({ success: true, message: 'Dispositivo eliminato con successo' });
  } catch (error: any) {
    console.error('Error deleting device:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/admin/devices
 * Crea nuovo dispositivo
 */
adminApi.post('/devices', async (c: AppContext) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const { device_code, serial_number, device_type, model, admin_email } = body;
  
  try {
    const result = await db.prepare(`
      INSERT INTO devices (device_code, serial_number, device_type, model, status)
      VALUES (?, ?, ?, ?, 'AVAILABLE')
    `).bind(device_code, serial_number, device_type || 'SIDLY', model || 'SIDLY-001').run();
    
    // Log in device_history
    await db.prepare(`
      INSERT INTO device_history (device_id, action, new_status, performed_by, notes)
      VALUES (?, 'CREATED', 'AVAILABLE', ?, 'Device created')
    `).bind(result.meta.last_row_id, admin_email).run();
    
    return c.json({
      success: true,
      message: 'Dispositivo creato con successo',
      device_id: result.meta.last_row_id
    });
  } catch (error: any) {
    console.error('Error creating device:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/admin/devices/:id/associate
 * Associa dispositivo a lead/assistito
 */
adminApi.post('/devices/:id/associate', async (c: AppContext) => {
  const db = c.env.DB;
  const deviceId = c.req.param('id');
  const body = await c.req.json();
  const { lead_id, admin_email } = body;
  
  try {
    // Verifica che il dispositivo sia disponibile
    const device = await db.prepare(`
      SELECT status FROM devices WHERE id = ?
    `).bind(deviceId).first();
    
    if (!device) {
      return c.json({ success: false, error: 'Device not found' }, 404);
    }
    
    if (device.status !== 'AVAILABLE' && device.status !== 'TO_CONFIGURE') {
      return c.json({ success: false, error: 'Device not available for association' }, 400);
    }
    
    // Associa dispositivo
    await db.prepare(`
      UPDATE devices
      SET 
        lead_id = ?,
        status = 'ASSOCIATED',
        associated_at = datetime('now'),
        associated_by = ?
      WHERE id = ?
    `).bind(lead_id, admin_email, deviceId).run();
    
    // Log in device_history
    await db.prepare(`
      INSERT INTO device_history (device_id, action, previous_status, new_status, lead_id, performed_by, notes)
      VALUES (?, 'ASSOCIATED', ?, 'ASSOCIATED', ?, ?, 'Device associated to lead')
    `).bind(deviceId, device.status, lead_id, admin_email).run();
    
    // TODO: Inviare email conferma associazione
    
    return c.json({
      success: true,
      message: 'Dispositivo associato con successo',
      device_id: deviceId
    });
  } catch (error: any) {
    console.error('Error associating device:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/admin/utils/simplify-contract-codes
 * Utility endpoint to convert existing contracts to year-based sequential codes
 */
adminApi.post('/utils/simplify-contract-codes', async (c: AppContext) => {
  const db = c.env.DB;
  
  try {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `CTR_${currentYear}/`;
    
    // Get all contracts ordered by ID
    const contracts = await db.prepare(`
      SELECT id, codice_contratto FROM contracts ORDER BY id
    `).all();
    
    const results = [];
    let counter = 1;
    
    // Update each contract with year-based sequential code
    for (const contract of contracts.results) {
      const newCode = `${yearPrefix}${String(counter).padStart(4, '0')}`;
      
      await db.prepare(`
        UPDATE contracts SET codice_contratto = ? WHERE id = ?
      `).bind(newCode, contract.id).run();
      
      results.push({
        id: contract.id,
        old_code: contract.codice_contratto,
        new_code: newCode
      });
      
      counter++;
    }
    
    return c.json({
      success: true,
      message: `Updated ${results.length} contracts to year-based codes`,
      updates: results
    });
  } catch (error: any) {
    console.error('Error simplifying contract codes:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/admin/utils/fix-proforma-table
 * Utility endpoint to create/fix proforma table schema
 */
adminApi.post('/utils/fix-proforma-table', async (c: AppContext) => {
  const db = c.env.DB;
  
  try {
    // Drop and recreate proforma table
    await db.prepare(`DROP TABLE IF EXISTS proforma`).run();
    
    await db.prepare(`
      CREATE TABLE proforma (
        id TEXT PRIMARY KEY NOT NULL,
        contract_id TEXT NOT NULL,
        lead_id TEXT NOT NULL,
        numero_proforma TEXT NOT NULL UNIQUE,
        data_emissione TEXT NOT NULL,
        data_scadenza TEXT NOT NULL,
        cliente_nome TEXT NOT NULL,
        cliente_cognome TEXT NOT NULL,
        cliente_email TEXT NOT NULL,
        tipo_servizio TEXT NOT NULL,
        prezzo_mensile REAL NOT NULL,
        durata_mesi INTEGER NOT NULL DEFAULT 12,
        prezzo_totale REAL NOT NULL,
        file_path TEXT,
        content TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        data_pagamento TEXT,
        email_template_used TEXT,
        inviata_il TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `).run();
    
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_proforma_lead_id ON proforma(lead_id)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_proforma_numero ON proforma(numero_proforma)`).run();
    
    return c.json({
      success: true,
      message: 'Proforma table created successfully'
    });
  } catch (error: any) {
    console.error('Error creating proforma table:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/admin/utils/simplify-proforma-codes
 * Utility endpoint to convert existing proformas to year-based sequential codes
 */
adminApi.post('/utils/simplify-proforma-codes', async (c: AppContext) => {
  const db = c.env.DB;
  
  try {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `PFM_${currentYear}/`;
    
    // Get all proformas ordered by ID
    const proformas = await db.prepare(`
      SELECT id, numero_proforma FROM proforma ORDER BY id
    `).all();
    
    const results = [];
    let counter = 1;
    
    // Update each proforma with year-based sequential code
    for (const proforma of proformas.results) {
      const newCode = `${yearPrefix}${String(counter).padStart(4, '0')}`;
      
      await db.prepare(`
        UPDATE proforma SET numero_proforma = ? WHERE id = ?
      `).bind(newCode, proforma.id).run();
      
      results.push({
        id: proforma.id,
        old_code: proforma.numero_proforma,
        new_code: newCode
      });
      
      counter++;
    }
    
    return c.json({
      success: true,
      message: `Updated ${results.length} proformas to year-based codes`,
      updates: results
    });
  } catch (error: any) {
    console.error('Error simplifying proforma codes:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/admin/debug/regenerate-pdfs
 * Regenerate PDFs for all records with NULL content
 */
adminApi.post('/debug/regenerate-pdfs', async (c: AppContext) => {
  const db = c.env.DB;
  
  try {
    const results = {
      proformas: { updated: 0, failed: 0, errors: [] as string[] },
      contracts: { updated: 0, failed: 0, errors: [] as string[] }
    };
    
    // Regenerate Proforma PDFs
    const proformasNeedingPDF = await db.prepare(`
      SELECT 
        p.id,
        p.numero_proforma,
        p.lead_id,
        p.data_emissione,
        p.data_scadenza,
        p.prezzo_totale,
        p.prezzo_mensile,
        p.durata_mesi,
        p.tipo_servizio,
        l.nomeRichiedente,
        l.cognomeRichiedente,
        l.emailRichiedente,
        l.pacchetto
      FROM proforma p
      LEFT JOIN leads l ON p.lead_id = l.id
      WHERE p.content IS NULL
    `).all();
    
    for (const proforma of proformasNeedingPDF.results) {
      try {
        // Calculate proper pricing based on package (if missing in DB)
        const pacchetto = proforma.pacchetto || 'BASE';
        let prezzoBase = pacchetto === 'AVANZATO' ? 840.00 : 480.00;
        const iva = 0.22;
        let prezzoTotale = proforma.prezzo_totale;
        
        // If prezzo_totale is NULL or 0, calculate it
        if (!prezzoTotale || prezzoTotale === 0) {
          prezzoTotale = prezzoBase * (1 + iva);
          
          // Update the proforma with correct pricing
          await db.prepare(`
            UPDATE proforma 
            SET 
              prezzo_totale = ?,
              prezzo_mensile = 0,
              durata_mesi = 1,
              tipo_servizio = ?
            WHERE id = ?
          `).bind(prezzoTotale, pacchetto, proforma.id).run();
        }
        
        const pdfBuffer = await generateProformaPDF({
          numero_proforma: proforma.numero_proforma,
          data_emissione: proforma.data_emissione || new Date().toISOString().split('T')[0],
          data_scadenza: proforma.data_scadenza || new Date().toISOString().split('T')[0],
          nomeRichiedente: proforma.nomeRichiedente || '',
          cognomeRichiedente: proforma.cognomeRichiedente || '',
          emailRichiedente: proforma.emailRichiedente || '',
          nomeAssistito: '',
          cognomeAssistito: '',
          pacchetto: pacchetto,
          prezzo_mensile: 0,
          durata_mesi: 1,
          prezzo_totale: prezzoTotale
        });
        
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
        
        await db.prepare(`
          UPDATE proforma 
          SET 
            content = ?,
            file_path = ?
          WHERE id = ?
        `).bind(
          pdfBase64,
          `/documents/proforma/${proforma.numero_proforma}.pdf`,
          proforma.id
        ).run();
        
        results.proformas.updated++;
      } catch (error: any) {
        results.proformas.failed++;
        results.proformas.errors.push(`Proforma ${proforma.numero_proforma}: ${error.message}`);
      }
    }
    
    // Regenerate Contract PDFs
    const contractsNeedingPDF = await db.prepare(`
      SELECT 
        c.id,
        c.codice_contratto,
        c.lead_id,
        c.piano_servizio,
        c.contract_type,
        l.nomeRichiedente,
        l.cognomeRichiedente,
        l.emailRichiedente,
        l.indirizzoRichiedente
      FROM contracts c
      LEFT JOIN leads l ON c.lead_id = l.id
      WHERE c.content IS NULL
    `).all();
    
    for (const contract of contractsNeedingPDF.results) {
      try {
        // Note: Contract PDF generation would need proper contract generator module
        // For now, just log that we found contracts needing PDFs
        console.log(`Contract ${contract.codice_contratto} needs PDF regeneration`);
        // TODO: Implement contract PDF regeneration when contract-generator is available
        results.contracts.failed++;
        results.contracts.errors.push(`Contract ${contract.codice_contratto}: Contract PDF generator not implemented yet`);
      } catch (error: any) {
        results.contracts.failed++;
        results.contracts.errors.push(`Contract ${contract.codice_contratto}: ${error.message}`);
      }
    }
    
    return c.json({
      success: true,
      message: 'PDF regeneration completed',
      results
    });
  } catch (error: any) {
    console.error('Error regenerating PDFs:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /api/admin/debug/check-templates
 * Verify dynamic templates are in database
 */
adminApi.get('/debug/check-templates', async (c: AppContext) => {
  const db = c.env.DB;
  
  try {
    const templates = await db.prepare(`
      SELECT id, name, type, active, 
             length(html_content) as html_length,
             length(subject) as subject_length
      FROM document_templates
      ORDER BY id
    `).all();
    
    return c.json({
      success: true,
      count: templates.results.length,
      templates: templates.results
    });
  } catch (error: any) {
    return c.json({ 
      success: false, 
      error: error.message,
      message: 'Template table might not exist or is empty'
    }, 500);
  }
});

/**
 * GET /api/admin/debug/data-check
 * Diagnostic endpoint to verify database data and identify inconsistencies
 */
adminApi.get('/debug/data-check', async (c: AppContext) => {
  const db = c.env.DB;
  
  try {
    // Get all contracts with their status fields
    const contracts = await db.prepare(`
      SELECT 
        id,
        codice_contratto,
        signature_status,
        status,
        content IS NULL as pdf_missing
      FROM contracts
      ORDER BY created_at
    `).all();
    
    // Get all proformas
    const proformas = await db.prepare(`
      SELECT 
        id,
        numero_proforma,
        lead_id,
        status,
        content IS NULL as pdf_missing,
        created_at
      FROM proforma
      ORDER BY created_at
    `).all();
    
    // Count statistics
    const contractsPending = contracts.results.filter((c: any) => 
      c.signature_status === 'PENDING' || c.signature_status === null
    ).length;
    
    const contractsSigned = contracts.results.filter((c: any) => 
      c.signature_status === 'FIRMATO'
    ).length;
    
    const proformasPending = proformas.results.filter((p: any) => 
      p.status === 'PENDING'
    ).length;
    
    const missingPDFs = {
      contracts: contracts.results.filter((c: any) => c.pdf_missing === 1).length,
      proformas: proformas.results.filter((p: any) => p.pdf_missing === 1).length
    };
    
    return c.json({
      success: true,
      data: {
        contracts: {
          total: contracts.results.length,
          pending: contractsPending,
          signed: contractsSigned,
          details: contracts.results
        },
        proformas: {
          total: proformas.results.length,
          pending: proformasPending,
          details: proformas.results
        },
        pdf_issues: {
          contracts_missing_pdf: missingPDFs.contracts,
          proformas_missing_pdf: missingPDFs.proformas
        }
      }
    });
  } catch (error: any) {
    console.error('Error in data check:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default adminApi;
