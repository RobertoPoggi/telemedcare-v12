/**
 * DASHBOARD-API.TS
 * eCura V11.0 - Dashboard API Endpoints
 * 
 * Fornisce API per dashboard amministrativa con:
 * - KPI real-time
 * - Analytics lead
 * - Workflow tracking
 * - Statistiche conversione
 * - Monitoring sistema
 */

export interface Env {
  DB: D1Database;
}

/**
 * KPI Homepage - Metriche principali
 */
export async function getHomepageKPIs(db: D1Database): Promise<any> {
  
  try {
    // KPI: Lead totali (ultimi 30 giorni)
    const leadsTotal = await db.prepare(`
      SELECT COUNT(*) as count
      FROM leads
      WHERE created_at > datetime('now', '-30 days')
    `).first();
    
    // KPI: Contratti generati
    const contractsGenerated = await db.prepare(`
      SELECT COUNT(*) as count
      FROM contratti
      WHERE created_at > datetime('now', '-30 days')
    `).first();
    
    // KPI: Contratti firmati
    const contractsSigned = await db.prepare(`
      SELECT COUNT(*) as count
      FROM contratti
      WHERE docusign_status = 'completed'
        AND created_at > datetime('now', '-30 days')
    `).first();
    
    // KPI: Pagamenti ricevuti
    const paymentsReceived = await db.prepare(`
      SELECT 
        COUNT(*) as count,
        SUM(CAST(json_extract(pricing_details, '$.totale') AS REAL)) as revenue
      FROM proformas
      WHERE stripe_payment_status = 'paid'
        AND created_at > datetime('now', '-30 days')
    `).first();
    
    // KPI: Servizi attivi
    const activeServices = await db.prepare(`
      SELECT COUNT(*) as count
      FROM proformas
      WHERE stripe_payment_status = 'paid'
        AND stato = 'attivo'
    `).first();
    
    // Conversion Rate (Lead → Contratto firmato → Pagato)
    const leadToContract = contractsGenerated && leadsTotal ? 
      ((contractsGenerated as any).count / (leadsTotal as any).count * 100).toFixed(1) : 0;
    
    const contractToSign = contractsSigned && contractsGenerated ?
      ((contractsSigned as any).count / (contractsGenerated as any).count * 100).toFixed(1) : 0;
    
    const signToPay = paymentsReceived && contractsSigned ?
      ((paymentsReceived as any).count / (contractsSigned as any).count * 100).toFixed(1) : 0;
    
    return {
      success: true,
      kpis: {
        leads: {
          total: (leadsTotal as any)?.count || 0,
          label: 'Lead Totali (30gg)',
          icon: '👥',
          trend: '+12%' // TODO: calcolo trend
        },
        contracts: {
          generated: (contractsGenerated as any)?.count || 0,
          signed: (contractsSigned as any)?.count || 0,
          label: 'Contratti',
          icon: '📄',
          conversion: `${leadToContract}%`
        },
        payments: {
          count: (paymentsReceived as any)?.count || 0,
          revenue: (paymentsReceived as any)?.revenue || 0,
          label: 'Pagamenti',
          icon: '💰',
          conversion: `${signToPay}%`
        },
        services: {
          active: (activeServices as any)?.count || 0,
          label: 'Servizi Attivi',
          icon: '🔄'
        }
      },
      conversionFunnel: {
        lead: 100,
        contract: parseFloat(leadToContract as string),
        signed: parseFloat(contractToSign as string),
        paid: parseFloat(signToPay as string)
      },
      period: 'last_30_days'
    };
    
  } catch (error) {
    console.error('[DASHBOARD-API] Errore KPI:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore recupero KPI'
    };
  }
}

/**
 * Lista Lead con filtri e paginazione
 */
export async function getLeadsList(
  db: D1Database,
  filters: {
    status?: string;
    source?: string;
    servizio?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<any> {
  
  try {
    let query = `
      SELECT 
        l.id,
        l.external_lead_id,
        l.nome,
        l.cognome,
        l.email,
        l.telefono,
        l.servizio,
        l.pacchetto,
        l.source,
        l.status,
        l.priority,
        l.created_at,
        l.updated_at,
        COUNT(DISTINCT c.id) as contract_count,
        MAX(c.docusign_status) as last_contract_status,
        MAX(p.stripe_payment_status) as payment_status
      FROM leads l
      LEFT JOIN contratti c ON l.email = c.email_cliente
      LEFT JOIN proformas p ON c.id = p.contract_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Filtri
    if (filters.status) {
      query += ` AND l.status = ?`;
      params.push(filters.status);
    }
    
    if (filters.source) {
      query += ` AND l.source = ?`;
      params.push(filters.source);
    }
    
    if (filters.servizio) {
      query += ` AND l.servizio = ?`;
      params.push(filters.servizio);
    }
    
    if (filters.dateFrom) {
      query += ` AND l.created_at >= ?`;
      params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query += ` AND l.created_at <= ?`;
      params.push(filters.dateTo);
    }
    
    if (filters.search) {
      query += ` AND (l.nome LIKE ? OR l.cognome LIKE ? OR l.email LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ` GROUP BY l.id ORDER BY l.created_at DESC`;
    
    // Paginazione
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const stmt = db.prepare(query);
    const result = await stmt.bind(...params).all();
    
    // Count totale
    const countQuery = `SELECT COUNT(*) as total FROM leads WHERE 1=1`;
    const countResult = await db.prepare(countQuery).first();
    
    return {
      success: true,
      leads: result.results,
      pagination: {
        total: (countResult as any)?.total || 0,
        limit,
        offset,
        hasMore: ((countResult as any)?.total || 0) > offset + limit
      }
    };
    
  } catch (error) {
    console.error('[DASHBOARD-API] Errore lista lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore recupero lead'
    };
  }
}

/**
 * Dettaglio Lead con Timeline completo
 */
export async function getLeadDetail(
  db: D1Database,
  leadId: number
): Promise<any> {
  
  try {
    // Dati lead base
    const lead = await db.prepare(`
      SELECT * FROM leads WHERE id = ?
    `).bind(leadId).first();
    
    if (!lead) {
      return { success: false, error: 'Lead non trovato' };
    }
    
    // Contratti associati
    const contracts = await db.prepare(`
      SELECT * FROM contratti 
      WHERE email_cliente = ?
      ORDER BY created_at DESC
    `).bind((lead as any).email).all();
    
    // Proformas associate
    const proformas = await db.prepare(`
      SELECT p.*, c.titolo as contract_title
      FROM proformas p
      LEFT JOIN contratti c ON p.contract_id = c.id
      WHERE c.email_cliente = ?
      ORDER BY p.created_at DESC
    `).bind((lead as any).email).all();
    
    // Timeline eventi
    const timeline = await buildLeadTimeline(db, (lead as any).email);
    
    return {
      success: true,
      lead: lead,
      contracts: contracts.results,
      proformas: proformas.results,
      timeline: timeline,
      stats: {
        total_contracts: contracts.results.length,
        signed_contracts: contracts.results.filter((c: any) => c.docusign_status === 'completed').length,
        total_revenue: proformas.results.reduce((sum: number, p: any) => {
          if (p.stripe_payment_status === 'paid') {
            const pricing = JSON.parse(p.pricing_details || '{}');
            return sum + (pricing.totale || 0);
          }
          return sum;
        }, 0)
      }
    };
    
  } catch (error) {
    console.error('[DASHBOARD-API] Errore dettaglio lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore recupero dettaglio'
    };
  }
}

/**
 * Costruisci timeline eventi lead
 */
async function buildLeadTimeline(
  db: D1Database,
  email: string
): Promise<any[]> {
  
  const timeline: any[] = [];
  
  try {
    // 1. Lead creato
    const lead = await db.prepare(`
      SELECT created_at, source FROM leads WHERE email = ?
    `).bind(email).first();
    
    if (lead) {
      timeline.push({
        type: 'lead_created',
        title: 'Lead ricevuto',
        description: `Lead ricevuto da ${(lead as any).source}`,
        timestamp: (lead as any).created_at,
        icon: '📥',
        status: 'completed'
      });
    }
    
    // 2. Contratti generati
    const contracts = await db.prepare(`
      SELECT id, created_at, docusign_status, signed_at
      FROM contratti 
      WHERE email_cliente = ?
      ORDER BY created_at
    `).bind(email).all();
    
    for (const contract of contracts.results) {
      timeline.push({
        type: 'contract_generated',
        title: 'Contratto generato',
        description: `Contratto ID ${(contract as any).id} creato e inviato`,
        timestamp: (contract as any).created_at,
        icon: '📄',
        status: 'completed',
        metadata: { contract_id: (contract as any).id }
      });
      
      if ((contract as any).docusign_status === 'completed' && (contract as any).signed_at) {
        timeline.push({
          type: 'contract_signed',
          title: 'Contratto firmato',
          description: `Contratto ID ${(contract as any).id} firmato via DocuSign`,
          timestamp: (contract as any).signed_at,
          icon: '✍️',
          status: 'completed',
          metadata: { contract_id: (contract as any).id }
        });
      }
    }
    
    // 3. Proformas generate
    const proformas = await db.prepare(`
      SELECT p.*, c.id as contract_id
      FROM proformas p
      LEFT JOIN contratti c ON p.contract_id = c.id
      WHERE c.email_cliente = ?
      ORDER BY p.created_at
    `).bind(email).all();
    
    for (const proforma of proformas.results) {
      timeline.push({
        type: 'proforma_generated',
        title: 'Proforma generata',
        description: `Proforma ${(proforma as any).numero_proforma} inviata`,
        timestamp: (proforma as any).created_at,
        icon: '🧾',
        status: 'completed',
        metadata: { proforma_id: (proforma as any).id }
      });
      
      if ((proforma as any).stripe_payment_status === 'paid' && (proforma as any).payment_date) {
        const pricing = JSON.parse((proforma as any).pricing_details || '{}');
        timeline.push({
          type: 'payment_received',
          title: 'Pagamento ricevuto',
          description: `Pagato €${pricing.totale || 0} via Stripe`,
          timestamp: (proforma as any).payment_date,
          icon: '💰',
          status: 'completed',
          metadata: { 
            proforma_id: (proforma as any).id,
            amount: pricing.totale 
          }
        });
      }
    }
    
    // Ordina timeline per timestamp
    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
  } catch (error) {
    console.error('[TIMELINE] Errore:', error);
  }
  
  return timeline;
}

/**
 * Analytics per canale
 */
export async function getChannelAnalytics(
  db: D1Database,
  period: 'today' | 'week' | 'month' | 'all' = 'month'
): Promise<any> {
  
  try {
    let dateFilter = ``;
    
    switch (period) {
      case 'today':
        dateFilter = `WHERE l.created_at > datetime('now', 'start of day')`;
        break;
      case 'week':
        dateFilter = `WHERE l.created_at > datetime('now', '-7 days')`;
        break;
      case 'month':
        dateFilter = `WHERE l.created_at > datetime('now', '-30 days')`;
        break;
      default:
        dateFilter = ``;
    }
    
    const channelStats = await db.prepare(`
      SELECT 
        l.source,
        COUNT(DISTINCT l.id) as lead_count,
        COUNT(DISTINCT c.id) as contract_count,
        COUNT(DISTINCT CASE WHEN c.docusign_status = 'completed' THEN c.id END) as signed_count,
        COUNT(DISTINCT CASE WHEN p.stripe_payment_status = 'paid' THEN p.id END) as paid_count,
        SUM(CASE WHEN p.stripe_payment_status = 'paid' THEN 
          CAST(json_extract(p.pricing_details, '$.totale') AS REAL) 
        ELSE 0 END) as revenue
      FROM leads l
      LEFT JOIN contratti c ON l.email = c.email_cliente
      LEFT JOIN proformas p ON c.id = p.contract_id
      ${dateFilter}
      GROUP BY l.source
      ORDER BY lead_count DESC
    `).all();
    
    return {
      success: true,
      period,
      channels: channelStats.results.map((ch: any) => ({
        source: ch.source,
        leads: ch.lead_count,
        contracts: ch.contract_count,
        signed: ch.signed_count,
        paid: ch.paid_count,
        revenue: ch.revenue || 0,
        conversionRate: ch.lead_count > 0 ? 
          (ch.paid_count / ch.lead_count * 100).toFixed(1) : 0
      }))
    };
    
  } catch (error) {
    console.error('[DASHBOARD-API] Errore analytics canali:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore analytics'
    };
  }
}

/**
 * Azioni richieste (TO-DO List)
 */
export async function getRequiredActions(db: D1Database): Promise<any> {
  
  try {
    const actions: any[] = [];
    
    // 1. Proformas in scadenza (30 giorni)
    const expiringProformas = await db.prepare(`
      SELECT p.*, c.email_cliente, c.nome_cliente
      FROM proformas p
      JOIN contratti c ON p.contract_id = c.id
      WHERE p.stripe_payment_status != 'paid'
        AND p.expires_at < datetime('now', '+30 days')
        AND p.expires_at > datetime('now')
      ORDER BY p.expires_at
      LIMIT 10
    `).all();
    
    for (const proforma of expiringProformas.results) {
      actions.push({
        type: 'proforma_expiring',
        priority: 'high',
        title: `Proforma in scadenza`,
        description: `Proforma ${(proforma as any).numero_proforma} scade tra pochi giorni`,
        client: (proforma as any).nome_cliente,
        email: (proforma as any).email_cliente,
        due_date: (proforma as any).expires_at,
        action: 'Invia reminder pagamento'
      });
    }
    
    // 2. Contratti inviati ma non firmati (> 7 giorni)
    const unsignedContracts = await db.prepare(`
      SELECT id, email_cliente, nome_cliente, created_at
      FROM contratti
      WHERE docusign_status IN ('sent', 'delivered')
        AND created_at < datetime('now', '-7 days')
      ORDER BY created_at
      LIMIT 10
    `).all();
    
    for (const contract of unsignedContracts.results) {
      actions.push({
        type: 'contract_unsigned',
        priority: 'normal',
        title: `Contratto non firmato`,
        description: `Contratto inviato da più di 7 giorni`,
        client: (contract as any).nome_cliente,
        email: (contract as any).email_cliente,
        action: 'Contatta cliente'
      });
    }
    
    // 3. Lead non processati (> 24h)
    const unprocessedLeads = await db.prepare(`
      SELECT id, nome, cognome, email, created_at
      FROM leads
      WHERE status = 'new'
        AND created_at < datetime('now', '-1 days')
      ORDER BY created_at
      LIMIT 10
    `).all();
    
    for (const lead of unprocessedLeads.results) {
      actions.push({
        type: 'lead_unprocessed',
        priority: 'urgent',
        title: `Lead non processato`,
        description: `Lead ricevuto da più di 24h senza azioni`,
        client: `${(lead as any).nome} ${(lead as any).cognome || ''}`.trim(),
        email: (lead as any).email,
        action: 'Genera contratto'
      });
    }
    
    return {
      success: true,
      actions: actions.sort((a, b) => {
        const priorityOrder: any = { urgent: 0, high: 1, normal: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),
      counts: {
        urgent: actions.filter(a => a.priority === 'urgent').length,
        high: actions.filter(a => a.priority === 'high').length,
        normal: actions.filter(a => a.priority === 'normal').length,
        total: actions.length
      }
    };
    
  } catch (error) {
    console.error('[DASHBOARD-API] Errore azioni richieste:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore recupero azioni'
    };
  }
}

/**
 * Statistiche Queue (Cloudflare)
 */
export async function getQueueStats(db: D1Database): Promise<any> {
  
  try {
    const stats = await db.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        source
      FROM leads
      WHERE created_at > datetime('now', '-24 hours')
      GROUP BY status, source
    `).all();
    
    return {
      success: true,
      last_24h: stats.results,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return { 
      success: false, 
      error: 'Stats non disponibili' 
    };
  }
}
