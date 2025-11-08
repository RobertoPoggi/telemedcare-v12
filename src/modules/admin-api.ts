/**
 * Admin API Module
 * Gestione dashboard amministratore TeleMedCare
 */

import { Hono } from 'hono';
import type { Context } from 'hono';

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
    
    // Stats contratti
    const contractsStats = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN signature_status = 'PENDING' THEN 1 ELSE 0 END) as in_attesa_firma,
        SUM(CASE WHEN signature_status = 'SIGNED_MANUAL' THEN 1 ELSE 0 END) as firmati_manualmente,
        SUM(CASE WHEN signature_status = 'SIGNED_DOCUSIGN' THEN 1 ELSE 0 END) as firmati_docusign
      FROM contracts
    `).first();
    
    // Stats proforma
    const proformasStats = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as in_attesa,
        SUM(CASE WHEN status = 'PAID_BANK_TRANSFER' THEN 1 ELSE 0 END) as pagate_bonifico,
        SUM(CASE WHEN status = 'PAID_STRIPE' THEN 1 ELSE 0 END) as pagate_stripe,
        SUM(amount) as totale_importi
      FROM proformas
      WHERE status IN ('PENDING', 'PAID_BANK_TRANSFER', 'PAID_STRIPE')
    `).first();
    
    // Stats dispositivi
    const devicesStats = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as disponibili,
        SUM(CASE WHEN status = 'TO_CONFIGURE' THEN 1 ELSE 0 END) as da_configurare,
        SUM(CASE WHEN status = 'ASSOCIATED' THEN 1 ELSE 0 END) as associati,
        SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) as in_manutenzione
      FROM devices
    `).first();
    
    return c.json({
      success: true,
      stats: {
        leads: leadsStats,
        contracts: contractsStats,
        proformas: proformasStats,
        devices: devicesStats
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
        c.contract_code,
        c.lead_id,
        c.contract_type,
        c.signature_status,
        c.signature_type,
        c.signed_at,
        c.confirmed_by,
        c.confirmed_at,
        c.created_at,
        l.nomeRichiedente,
        l.cognomeRichiedente,
        l.emailRichiedente,
        l.pacchetto
      FROM contracts c
      LEFT JOIN leads l ON c.lead_id = l.id
    `;
    
    if (signatureStatus) {
      query += ` WHERE c.signature_status = ?`;
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
 * POST /api/admin/contracts/:id/confirm-signature
 * Conferma firma manuale contratto
 */
adminApi.post('/contracts/:id/confirm-signature', async (c: AppContext) => {
  const db = c.env.DB;
  const contractId = c.req.param('id');
  const body = await c.req.json();
  const { admin_email, notes } = body;
  
  try {
    // Aggiorna contratto
    await db.prepare(`
      UPDATE contracts
      SET 
        signature_status = 'SIGNED_MANUAL',
        signature_type = 'MANUAL',
        signed_at = datetime('now'),
        confirmed_by = ?,
        confirmed_at = datetime('now')
      WHERE id = ?
    `).bind(admin_email, contractId).run();
    
    // Ottieni lead_id del contratto
    const contract = await db.prepare(`
      SELECT lead_id, contract_code FROM contracts WHERE id = ?
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
    
    // TODO: Generare proforma automaticamente
    // Questo verrà implementato nel prossimo step
    
    return c.json({
      success: true,
      message: 'Firma confermata con successo',
      contract_id: contractId,
      next_step: 'generate_proforma'
    });
  } catch (error: any) {
    console.error('Error confirming signature:', error);
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
        p.proforma_code,
        p.contract_id,
        p.lead_id,
        p.amount,
        p.currency,
        p.status,
        p.payment_method,
        p.payment_date,
        p.payment_reference,
        p.payment_confirmed_by,
        p.due_date,
        p.created_at,
        l.nomeRichiedente,
        l.cognomeRichiedente,
        l.emailRichiedente,
        l.pacchetto
      FROM proformas p
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
    return c.json({ success: false, error: error.message }, 500);
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
      UPDATE proformas
      SET 
        status = 'PAID_BANK_TRANSFER',
        payment_method = 'BANK_TRANSFER',
        payment_date = datetime('now'),
        payment_reference = ?,
        payment_confirmed_by = ?,
        payment_confirmed_at = datetime('now')
      WHERE id = ?
    `).bind(payment_reference, admin_email, proformaId).run();
    
    // Ottieni lead_id della proforma
    const proforma = await db.prepare(`
      SELECT lead_id, proforma_code FROM proformas WHERE id = ?
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
    
    // TODO: Inviare email benvenuto automaticamente
    // Questo verrà implementato nel prossimo step
    
    return c.json({
      success: true,
      message: 'Pagamento confermato con successo',
      proforma_id: proformaId,
      next_step: 'send_welcome_email'
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
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

export default adminApi;
