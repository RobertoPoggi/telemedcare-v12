/**
 * PRODUCER-WORKER-MULTI-CHANNEL.TS
 * eCura V12.0 - Multi-Channel Lead Ingestion
 * 
 * Riceve lead da QUALSIASI canale e li mette in Cloudflare Queue
 * 
 * CANALI SUPPORTATI:
 * - ecura.it (Landing Page)
 * - HubSpot Forms
 * - Facebook Lead Ads
 * - Google Ads
 * - API Diretta (Partner/Affiliati)
 * - WhatsApp Business
 * - Email Marketing
 * - ... qualsiasi altro canale futuro
 */

export interface Env {
  ECURA_QUEUE: Queue;
  DB: D1Database;
  API_KEYS: KVNamespace; // Per autenticazione partner
}

interface LeadSource {
  source: string;
  channel_id?: string;
  campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
}

interface IncomingLead extends LeadSource {
  // Dati base cliente
  nome: string;
  cognome?: string;
  email: string;
  telefono?: string;
  
  // Servizio richiesto
  servizio?: 'FAMILY' | 'PRO' | 'PREMIUM';
  pacchetto?: 'BASE' | 'AVANZATO';
  
  // Preferenze
  vuoleContratto?: boolean;
  vuoleBrochure?: boolean;
  
  // Dati aggiuntivi
  eta?: number;
  message?: string;
  
  // Metadata canale-specifici
  metadata?: Record<string, any>;
}

/**
 * Producer Worker - Entry point unificato per tutti i canali
 */
export default {
  
  async fetch(request: Request, env: Env): Promise<Response> {
    
    const url = new URL(request.url);
    
    // ========================================
    // ENDPOINT 1: /api/lead (Generico)
    // ========================================
    if (url.pathname === '/api/lead' && request.method === 'POST') {
      return handleLeadSubmission(request, env, 'generic');
    }
    
    // ========================================
    // ENDPOINT 2: /api/webhook/hubspot
    // ========================================
    if (url.pathname === '/api/webhook/hubspot' && request.method === 'POST') {
      return handleLeadSubmission(request, env, 'hubspot');
    }
    
    // ========================================
    // ENDPOINT 3: /api/webhook/facebook
    // ========================================
    if (url.pathname === '/api/webhook/facebook' && request.method === 'POST') {
      return handleFacebookWebhook(request, env);
    }
    
    // ========================================
    // ENDPOINT 4: /api/webhook/google-ads
    // ========================================
    if (url.pathname === '/api/webhook/google-ads' && request.method === 'POST') {
      return handleLeadSubmission(request, env, 'google_ads');
    }
    
    // ========================================
    // ENDPOINT 5: /api/partner/lead (Con auth)
    // ========================================
    if (url.pathname === '/api/partner/lead' && request.method === 'POST') {
      return handlePartnerLead(request, env);
    }
    
    // ========================================
    // ENDPOINT 6: Health check
    // ========================================
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'ecura-producer',
        queue: 'active',
        timestamp: new Date().toISOString()
      });
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
};

/**
 * Handler generico per lead submission
 */
async function handleLeadSubmission(
  request: Request,
  env: Env,
  source: string
): Promise<Response> {
  
  try {
    const leadData: IncomingLead = await request.json();
    
    console.log(`📥 [PRODUCER] Lead ricevuto da: ${source}`);
    console.log(`📧 Email: ${leadData.email}`);
    
    // 1. Validazione base
    if (!leadData.email || !leadData.nome) {
      return Response.json({
        success: false,
        error: 'Email e nome sono obbligatori'
      }, { status: 400 });
    }
    
    // 2. Normalizzazione dati
    const normalizedLead = normalizeLead(leadData, source);
    
    // 3. Genera ID univoco
    const leadId = `LEAD_${Date.now()}_${crypto.randomUUID()}`;
    
    // 4. Prepara messaggio per queue
    const queueMessage = {
      id: leadId,
      source: source,
      data: normalizedLead,
      timestamp: new Date().toISOString(),
      priority: calculatePriority(normalizedLead),
      metadata: {
        user_agent: request.headers.get('user-agent'),
        ip_address: request.headers.get('cf-connecting-ip'),
        country: request.headers.get('cf-ipcountry')
      }
    };
    
    // 5. 🚀 INVIA A CLOUDFLARE QUEUE
    await env.ECURA_QUEUE.send(queueMessage);
    
    console.log(`✅ [PRODUCER] Lead ${leadId} inserito in queue`);
    
    // 6. [OPZIONALE] Salva tracking in DB
    await trackLeadIngestion(leadId, source, leadData.email, env.DB);
    
    // 7. Risposta immediata (asincrono)
    return Response.json({
      success: true,
      leadId: leadId,
      message: 'Lead ricevuto e in elaborazione',
      estimatedProcessingTime: '1-2 minuti'
    });
    
  } catch (error) {
    console.error(`❌ [PRODUCER] Errore ${source}:`, error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore server'
    }, { status: 500 });
  }
}

/**
 * Handler specifico per Facebook Lead Ads
 * Gestisce verifiche webhook e format Facebook
 */
async function handleFacebookWebhook(
  request: Request,
  env: Env
): Promise<Response> {
  
  const url = new URL(request.url);
  
  // Verifica webhook Facebook (GET)
  if (request.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    
    if (mode === 'subscribe' && token === 'YOUR_VERIFY_TOKEN') {
      console.log('✅ [FACEBOOK] Webhook verificato');
      return new Response(challenge);
    }
    
    return new Response('Forbidden', { status: 403 });
  }
  
  // Ricevi lead Facebook (POST)
  try {
    const body = await request.json() as any;
    
    // Facebook invia array di entry
    const entries = body.entry || [];
    const leads: any[] = [];
    
    for (const entry of entries) {
      const changes = entry.changes || [];
      
      for (const change of changes) {
        if (change.field === 'leadgen') {
          const leadgenData = change.value;
          
          // Trasforma formato Facebook in formato eCura
          const normalizedLead = {
            nome: leadgenData.field_data?.find((f: any) => f.name === 'first_name')?.values[0] || '',
            cognome: leadgenData.field_data?.find((f: any) => f.name === 'last_name')?.values[0] || '',
            email: leadgenData.field_data?.find((f: any) => f.name === 'email')?.values[0] || '',
            telefono: leadgenData.field_data?.find((f: any) => f.name === 'phone_number')?.values[0] || '',
            source: 'facebook_ads',
            metadata: {
              ad_id: leadgenData.ad_id,
              form_id: leadgenData.form_id,
              leadgen_id: leadgenData.leadgen_id,
              created_time: leadgenData.created_time
            }
          };
          
          leads.push(normalizedLead);
        }
      }
    }
    
    // Invia tutti i lead alla queue
    const results = await Promise.all(
      leads.map(lead => handleLeadSubmission(
        new Request(request.url, {
          method: 'POST',
          body: JSON.stringify(lead)
        }),
        env,
        'facebook_ads'
      ))
    );
    
    console.log(`✅ [FACEBOOK] ${leads.length} lead processati`);
    
    return Response.json({ success: true, processed: leads.length });
    
  } catch (error) {
    console.error('❌ [FACEBOOK] Errore:', error);
    return Response.json({ success: false }, { status: 500 });
  }
}

/**
 * Handler per API partner con autenticazione
 */
async function handlePartnerLead(
  request: Request,
  env: Env
): Promise<Response> {
  
  try {
    // 1. Verifica API Key
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({
        success: false,
        error: 'API Key mancante'
      }, { status: 401 });
    }
    
    const apiKey = authHeader.replace('Bearer ', '');
    
    // Verifica API key in KV
    const partnerData = await env.API_KEYS.get(apiKey, { type: 'json' });
    
    if (!partnerData) {
      return Response.json({
        success: false,
        error: 'API Key non valida'
      }, { status: 401 });
    }
    
    console.log(`🤝 [PARTNER] Lead da partner: ${(partnerData as any).partner_name}`);
    
    // 2. Processa lead normalmente
    const leadData = await request.json();
    
    // Aggiungi metadata partner
    (leadData as any).source = 'partner';
    (leadData as any).partner_id = (partnerData as any).partner_id;
    (leadData as any).commission_code = (leadData as any).commission_code || (partnerData as any).default_commission;
    
    return handleLeadSubmission(
      new Request(request.url, {
        method: 'POST',
        body: JSON.stringify(leadData)
      }),
      env,
      `partner_${(partnerData as any).partner_id}`
    );
    
  } catch (error) {
    console.error('❌ [PARTNER] Errore:', error);
    return Response.json({ success: false }, { status: 500 });
  }
}

/**
 * Normalizza lead da qualsiasi canale a formato standard
 */
function normalizeLead(lead: IncomingLead, source: string): IncomingLead {
  return {
    ...lead,
    source: source,
    nome: lead.nome?.trim() || '',
    cognome: lead.cognome?.trim() || '',
    email: lead.email?.toLowerCase().trim() || '',
    telefono: lead.telefono?.replace(/\s/g, '') || '',
    servizio: lead.servizio || 'PRO', // Default
    pacchetto: lead.pacchetto || 'BASE', // Default
    vuoleContratto: lead.vuoleContratto ?? true,
    vuoleBrochure: lead.vuoleBrochure ?? true,
    timestamp: new Date().toISOString()
  };
}

/**
 * Calcola priorità lead per processing
 */
function calculatePriority(lead: IncomingLead): 'high' | 'normal' | 'low' {
  // Priorità alta: contratto richiesto + servizio PREMIUM
  if (lead.vuoleContratto && lead.servizio === 'PREMIUM') {
    return 'high';
  }
  
  // Priorità alta: età > 80 anni
  if (lead.eta && lead.eta > 80) {
    return 'high';
  }
  
  // Priorità normale: default
  return 'normal';
}

/**
 * Tracking lead ingestion per analytics
 */
async function trackLeadIngestion(
  leadId: string,
  source: string,
  email: string,
  db: D1Database
): Promise<void> {
  
  try {
    await db.prepare(`
      INSERT INTO lead_tracking (
        lead_id, source, email, status, created_at
      ) VALUES (?, ?, ?, 'received', datetime('now'))
    `).bind(leadId, source, email).run();
    
    console.log(`📊 [TRACKING] Lead ${leadId} tracked`);
  } catch (error) {
    console.warn('⚠️ [TRACKING] Errore tracking (non bloccante):', error);
  }
}

export { handleLeadSubmission, normalizeLead };
