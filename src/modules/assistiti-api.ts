/**
 * Assistiti Management API
 * Manages converted leads (assistiti) with full service activation
 */

import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const assistitiApi = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/assistiti - List all assistiti
 */
assistitiApi.get('/', async (c) => {
  const db = c.env.DB;
  
  try {
    const { status } = c.req.query();
    
    let query = `
      SELECT 
        a.*,
        l.pacchetto as lead_pacchetto,
        d.serial_number as dispositivo_seriale,
        d.imei as dispositivo_imei_real
      FROM assistiti a
      LEFT JOIN leads l ON a.lead_id = l.id
      LEFT JOIN devices d ON a.dispositivo_id = d.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (status) {
      query += ` AND a.stato_servizio = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY a.created_at DESC`;
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ 
      success: true, 
      assistiti: results,
      count: results.length
    });
  } catch (error: any) {
    console.error('❌ Errore recupero assistiti:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /api/assistiti/:id - Get single assistito
 */
assistitiApi.get('/:id', async (c) => {
  const db = c.env.DB;
  const assistitoId = c.req.param('id');
  
  try {
    const assistito = await db.prepare(`
      SELECT 
        a.*,
        l.pacchetto,
        l.emailRichiedente,
        d.serial_number,
        d.imei,
        d.status as device_status
      FROM assistiti a
      LEFT JOIN leads l ON a.lead_id = l.id
      LEFT JOIN devices d ON a.dispositivo_id = d.id
      WHERE a.id = ?
    `).bind(assistitoId).first();
    
    if (!assistito) {
      return c.json({ success: false, error: 'Assistito non trovato' }, 404);
    }
    
    return c.json({ success: true, assistito });
  } catch (error: any) {
    console.error('❌ Errore recupero assistito:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * PUT /api/assistiti/:id - Update assistito
 */
assistitiApi.put('/:id', async (c) => {
  const db = c.env.DB;
  const assistitoId = c.req.param('id');
  
  try {
    const data = await c.req.json();
    
    await db.prepare(`
      UPDATE assistiti SET
        nome = ?,
        cognome = ?,
        telefono = ?,
        email = ?,
        indirizzo_completo = ?,
        stato_servizio = ?,
        note_generali = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      data.nome,
      data.cognome,
      data.telefono || '',
      data.email || '',
      data.indirizzo_completo || '',
      data.stato_servizio || 'ATTIVO',
      data.note_generali || '',
      assistitoId
    ).run();
    
    console.log(`✅ Assistito aggiornato: ${assistitoId}`);
    
    return c.json({ 
      success: true, 
      message: 'Assistito aggiornato con successo',
      assistitoId 
    });
  } catch (error: any) {
    console.error('❌ Errore aggiornamento assistito:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * DELETE /api/assistiti/:id - Delete assistito
 */
assistitiApi.delete('/:id', async (c) => {
  const db = c.env.DB;
  const assistitoId = c.req.param('id');
  
  try {
    await db.prepare(`DELETE FROM assistiti WHERE id = ?`).bind(assistitoId).run();
    
    console.log(`🗑️ Assistito eliminato: ${assistitoId}`);
    
    return c.json({ 
      success: true, 
      message: 'Assistito eliminato con successo' 
    });
  } catch (error: any) {
    console.error('❌ Errore eliminazione assistito:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/assistiti/:id/assign-device - Assign device to assistito
 */
assistitiApi.post('/:id/assign-device', async (c) => {
  const db = c.env.DB;
  const assistitoId = c.req.param('id');
  
  try {
    const { device_id } = await c.req.json();
    
    if (!device_id) {
      return c.json({ success: false, error: 'device_id richiesto' }, 400);
    }
    
    // Get device info
    const device: any = await db.prepare(`
      SELECT * FROM devices WHERE id = ?
    `).bind(device_id).first();
    
    if (!device) {
      return c.json({ success: false, error: 'Dispositivo non trovato' }, 404);
    }
    
    if (device.status !== 'AVAILABLE') {
      return c.json({ success: false, error: 'Dispositivo non disponibile' }, 400);
    }
    
    // Update assistito with device info
    await db.prepare(`
      UPDATE assistiti SET
        dispositivo_id = ?,
        dispositivo_imei = ?,
        dispositivo_seriale = ?,
        data_assegnazione_dispositivo = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      device.id,
      device.imei,
      device.serial_number,
      assistitoId
    ).run();
    
    // Update device status to ASSOCIATED
    await db.prepare(`
      UPDATE devices SET
        status = 'ASSOCIATED',
        lead_id = (SELECT lead_id FROM assistiti WHERE id = ?),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(assistitoId, device_id).run();
    
    console.log(`📱 Dispositivo ${device.serial_number} assegnato ad assistito ${assistitoId}`);
    
    return c.json({
      success: true,
      message: 'Dispositivo assegnato con successo',
      device: {
        id: device.id,
        serial_number: device.serial_number,
        imei: device.imei
      }
    });
  } catch (error: any) {
    console.error('❌ Errore assegnazione dispositivo:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/devices/upload-from-label - Upload device from CE label photo (OCR)
 */
assistitiApi.post('/devices/upload-from-label', async (c) => {
  const db = c.env.DB;
  
  try {
    const { image_url, extracted_data } = await c.req.json();
    
    if (!extracted_data || !extracted_data.IMEINumber) {
      return c.json({ 
        success: false, 
        error: 'Dati estratti mancanti. Esegui OCR prima.' 
      }, 400);
    }
    
    // Check if device already exists
    const existing = await db.prepare(`
      SELECT id FROM devices WHERE imei = ? OR serial_number = ?
    `).bind(extracted_data.IMEINumber, extracted_data.serialNumber).first();
    
    if (existing) {
      return c.json({
        success: false,
        error: 'Dispositivo già presente nel database',
        device_id: existing.id
      }, 409);
    }
    
    // Insert device with OCR-extracted data
    const udiPrimary = typeof extracted_data.UDIcodes === 'object' 
      ? extracted_data.UDIcodes.primary || '' 
      : (Array.isArray(extracted_data.UDIcodes) ? extracted_data.UDIcodes[0] : '');
    
    const udiSecondary = typeof extracted_data.UDIcodes === 'object'
      ? extracted_data.UDIcodes.secondary || ''
      : (Array.isArray(extracted_data.UDIcodes) ? extracted_data.UDIcodes[1] : '');
    
    const deviceCode = extracted_data.serialNumber || `CODE_${Date.now()}`;
    
    const result = await db.prepare(`
      INSERT INTO devices (
        device_code, model, serial_number, imei, 
        manufacturer, manufacturer_address, manufacturing_date, 
        firmware_version, udi_primary, udi_secondary,
        device_type, status, device_notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      deviceCode,
      extracted_data.deviceModelName || 'SiDLY CARE PRO',
      extracted_data.serialNumber,
      extracted_data.IMEINumber,
      extracted_data.manufacturerDetails?.name || 'SiDLY Sp z o.o',
      extracted_data.manufacturerDetails?.address || '',
      extracted_data.manufacturingDate || '',
      extracted_data.versionNumber || '',
      udiPrimary,
      udiSecondary,
      'SIDLY', // default device_type
      'AVAILABLE',
      `Caricato da OCR etichetta CE - ${new Date().toISOString()}`
    ).run();
    
    const deviceId = result.meta.last_row_id;
    
    console.log(`✅ Dispositivo caricato da etichetta CE: ID ${deviceId} - IMEI: ${extracted_data.IMEINumber}`);
    
    return c.json({
      success: true,
      message: 'Dispositivo caricato con successo',
      device: {
        id: deviceId,
        device_code: deviceCode,
        model: extracted_data.deviceModelName,
        imei: extracted_data.IMEINumber,
        serial_number: extracted_data.serialNumber,
        status: 'AVAILABLE'
      }
    });
  } catch (error: any) {
    console.error('❌ Errore caricamento dispositivo:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default assistitiApi;
