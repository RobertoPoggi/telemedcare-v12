/**
 * CONSUMER-WORKER.TS
 * eCura V12.0 - Lead Processing Consumer
 * 
 * Processa lead dalla Cloudflare Queue ed esegue workflow completo:
 * 1. Genera contratto
 * 2. Invia email con documenti
 * 3. Salva in database
 * 4. Aggiorna HubSpot
 * 5. Tracking eventi
 */

import { ContractWorkflowManager } from './lib/contract-workflow-manager';
import { EmailService } from './services/email-service';

export interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  HUBSPOT_API_KEY: string;
  ECURA_QUEUE: Queue;
}

interface QueueMessage {
  id: string;
  source: string;
  data: {
    nome: string;
    cognome?: string;
    email: string;
    telefono?: string;
    servizio?: 'FAMILY' | 'PRO' | 'PREMIUM';
    pacchetto?: 'BASE' | 'AVANZATO';
    vuoleContratto?: boolean;
    vuoleBrochure?: boolean;
    eta?: number;
    message?: string;
    metadata?: Record<string, any>;
  };
  timestamp: string;
  priority: 'high' | 'normal' | 'low';
  metadata?: {
    user_agent?: string;
    ip_address?: string;
    country?: string;
  };
}

/**
 * Consumer Worker - Processa messaggi dalla queue
 */
export default {
  
  /**
   * Queue handler - chiamato automaticamente da Cloudflare
   */
  async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
    
    console.log(`\n🚀 [CONSUMER] Batch ricevuto: ${batch.messages.length} messaggi`);
    
    for (const message of batch.messages) {
      
      try {
        const leadData = message.body;
        
        console.log(`\n📥 [CONSUMER] Processo lead: ${leadData.id}`);
        console.log(`📧 Email: ${leadData.data.email}`);
        console.log(`📍 Canale: ${leadData.source}`);
        console.log(`⏰ Timestamp: ${leadData.timestamp}`);
        console.log(`🎯 Priorità: ${leadData.priority}`);
        
        // ============================================
        // STEP 1: Salva lead in database
        // ============================================
        const dbLeadId = await saveLeadToDatabase(leadData, env.DB);
        
        console.log(`✅ [CONSUMER] Lead salvato in DB con ID: ${dbLeadId}`);
        
        // ============================================
        // STEP 2: Esegui workflow completo
        // ============================================
        const workflowResult = await executeLeadWorkflow(leadData, env);
        
        if (workflowResult.success) {
          console.log(`✅ [CONSUMER] Workflow completato per ${leadData.data.email}`);
          
          // Aggiorna stato in DB
          await updateLeadStatus(dbLeadId, 'workflow_completed', env.DB);
          
          // Conferma processamento messaggio
          message.ack();
          
        } else {
          console.error(`❌ [CONSUMER] Workflow fallito: ${workflowResult.error}`);
          
          // Aggiorna stato errore in DB
          await updateLeadStatus(dbLeadId, 'workflow_failed', env.DB, workflowResult.error);
          
          // Retry automatico (non ack = retry)
          message.retry();
        }
        
      } catch (error) {
        console.error(`❌ [CONSUMER] Errore processamento lead:`, error);
        
        // Retry automatico
        message.retry({ delaySeconds: 60 }); // Retry dopo 1 minuto
      }
    }
    
    console.log(`\n✅ [CONSUMER] Batch completato\n`);
  },
  
  /**
   * HTTP Handler - per health check e monitoring
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    
    const url = new URL(request.url);
    
    // Health check
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'ecura-consumer',
        timestamp: new Date().toISOString()
      });
    }
    
    // Stats endpoint
    if (url.pathname === '/stats') {
      const stats = await getQueueStats(env.DB);
      return Response.json(stats);
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
};

/**
 * Salva lead in database
 */
async function saveLeadToDatabase(
  leadData: QueueMessage,
  db: D1Database
): Promise<number> {
  
  try {
    const result = await db.prepare(`
      INSERT INTO leads (
        external_lead_id,
        source,
        nome,
        cognome,
        email,
        telefono,
        servizio,
        pacchetto,
        vuole_contratto,
        vuole_brochure,
        eta,
        message,
        priority,
        status,
        metadata,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      leadData.id,
      leadData.source,
      leadData.data.nome,
      leadData.data.cognome || '',
      leadData.data.email,
      leadData.data.telefono || '',
      leadData.data.servizio || 'PRO',
      leadData.data.pacchetto || 'BASE',
      leadData.data.vuoleContratto ? 1 : 0,
      leadData.data.vuoleBrochure ? 1 : 0,
      leadData.data.eta || null,
      leadData.data.message || '',
      leadData.priority,
      'processing',
      JSON.stringify({
        ...leadData.data.metadata,
        queue_metadata: leadData.metadata
      })
    ).run();
    
    return result.meta.last_row_id;
    
  } catch (error) {
    console.error('❌ [DB] Errore salvataggio lead:', error);
    throw error;
  }
}

/**
 * Esegui workflow completo per il lead
 */
async function executeLeadWorkflow(
  leadData: QueueMessage,
  env: Env
): Promise<{ success: boolean; error?: string; contractId?: number }> {
  
  try {
    
    const { nome, cognome, email, telefono, servizio, pacchetto, vuoleContratto, vuoleBrochure } = leadData.data;
    
    // ============================================
    // WORKFLOW: Genera contratto + invia email
    // ============================================
    
    if (vuoleContratto) {
      
      console.log(`📄 [WORKFLOW] Genero contratto per ${email}`);
      
      const workflowManager = new ContractWorkflowManager(env.DB);
      
      const result = await workflowManager.handleLeadToContract({
        nome: nome || '',
        cognome: cognome || '',
        email: email,
        telefono: telefono || '',
        servizio: servizio || 'PRO',
        piano: pacchetto || 'BASE',
        vuoleBrochure: vuoleBrochure || false,
        eta: leadData.data.eta,
        source: leadData.source
      });
      
      if (result.success) {
        console.log(`✅ [WORKFLOW] Contratto generato: ${result.contractId}`);
        console.log(`📧 [WORKFLOW] Email inviata con DocuSign`);
        
        return {
          success: true,
          contractId: result.contractId
        };
      } else {
        console.error(`❌ [WORKFLOW] Errore: ${result.error}`);
        return {
          success: false,
          error: result.error
        };
      }
      
    } else {
      
      // ============================================
      // NO CONTRATTO: Invia solo brochure/info
      // ============================================
      
      console.log(`📧 [WORKFLOW] Invio info (no contratto) a ${email}`);
      
      const emailService = new EmailService(env.RESEND_API_KEY);
      
      const emailResult = await emailService.sendEmail({
        to: email,
        subject: '🏥 Benvenuto in eCura - Informazioni sui nostri servizi',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Ciao ${nome}!</h2>
            <p>Grazie per il tuo interesse in <strong>eCura</strong>.</p>
            <p>Ti contatteremo presto con tutte le informazioni sui nostri servizi di TeleAssistenza.</p>
            <br/>
            <p>A presto,<br/>
            <strong>Team eCura</strong></p>
          </div>
        `
      });
      
      if (emailResult.success) {
        console.log(`✅ [WORKFLOW] Email info inviata`);
        return { success: true };
      } else {
        return { success: false, error: emailResult.error };
      }
    }
    
  } catch (error) {
    console.error('❌ [WORKFLOW] Errore generale:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Aggiorna stato lead in database
 */
async function updateLeadStatus(
  leadId: number,
  status: string,
  db: D1Database,
  errorMessage?: string
): Promise<void> {
  
  try {
    await db.prepare(`
      UPDATE leads 
      SET 
        status = ?,
        error_message = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, errorMessage || null, leadId).run();
    
    console.log(`📊 [DB] Stato aggiornato a: ${status}`);
    
  } catch (error) {
    console.warn('⚠️ [DB] Errore aggiornamento stato (non bloccante):', error);
  }
}

/**
 * Ottieni statistiche queue per monitoring
 */
async function getQueueStats(db: D1Database): Promise<any> {
  
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
      last_24h: stats.results,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return { error: 'Stats non disponibili' };
  }
}
