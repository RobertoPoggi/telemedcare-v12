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

export default assistitiApi;
