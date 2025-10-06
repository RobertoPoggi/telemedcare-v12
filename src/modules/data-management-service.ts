/**
 * TeleMedCare V11.0 Modular Enterprise System
 * Data Management Service - Gestione visualizzazione leads, assistiti, logs
 */

export interface Lead {
  id: string;
  nomeRichiedente: string;
  cognomeRichiedente: string;
  emailRichiedente: string;
  telefonoRichiedente: string;
  nomeAssistito: string;
  cognomeAssistito: string;
  dataNascitaAssistito: string;
  cfRichiedente: string;
  cfAssistito: string;
  indirizzoRichiedente: string;
  indirizzoAssistito: string;
  pacchetto: string;
  status: string;
  note?: string;
  created_at: string;
  gdprConsent: string;
  consensoPrivacy: string;
  sourceUrl?: string;
}

export interface Assistito {
  id: number;
  lead_id: number;
  codice_assistito: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  data_nascita: string;
  codice_fiscale: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  tipo_contratto: string;
  stato: string;
  data_conversione: string;
  data_attivazione?: string;
  imei_dispositivo?: string;
  numero_contratto?: string;
  valore_contratto?: number;
  note_mediche?: string;
  contatto_emergenza?: string;
  medico_curante?: string;
  created_at: string;
}

export interface WorkflowTracking {
  id: number;
  assistito_id: number;
  fase: string;
  stato: string;
  data_inizio: string;
  data_completamento?: string;
  dettagli?: any;
  note?: string;
  created_at: string;
}

export interface SystemLog {
  id: number;
  tipo: string;
  modulo: string;
  messaggio: string;
  dettagli?: any;
  livello: string;
  assistito_id?: number;
  lead_id?: number;
  timestamp: string;
}

export interface DataStats {
  total_leads: number;
  leads_attivi: number;
  leads_convertiti: number;
  total_assistiti: number;
  assistiti_attivi: number;
  contratti_firmati: number;
  workflow_completati: number;
  logs_oggi: number;
}

export class DataManagementService {
  
  constructor(private db: D1Database) {}

  // LEADS MANAGEMENT
  async getAllLeads(page: number = 1, limit: number = 50): Promise<{ leads: Lead[], total: number }> {
    const offset = (page - 1) * limit;
    
    try {
      // Get leads with pagination
      const leadsResult = await this.db.prepare(`
        SELECT * FROM leads 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).bind(limit, offset).all();

      // Get total count
      const countResult = await this.db.prepare(`
        SELECT COUNT(*) as total FROM leads
      `).first();

      return {
        leads: leadsResult.results as Lead[],
        total: (countResult as any)?.total || 0
      };
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw new Error('Errore nel recupero dei leads');
    }
  }

  async getLeadById(id: string): Promise<Lead | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM leads WHERE id = ?
      `).bind(id).first();

      return result as Lead || null;
    } catch (error) {
      console.error('Error fetching lead by ID:', error);
      return null;
    }
  }

  async searchLeads(query: string): Promise<Lead[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM leads 
        WHERE nomeRichiedente LIKE ? OR cognomeRichiedente LIKE ? OR emailRichiedente LIKE ? OR telefonoRichiedente LIKE ? OR cfRichiedente LIKE ?
        ORDER BY created_at DESC
        LIMIT 100
      `).bind(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`).all();

      return result.results as Lead[];
    } catch (error) {
      console.error('Error searching leads:', error);
      return [];
    }
  }

  // ASSISTITI MANAGEMENT
  async getAllAssistiti(page: number = 1, limit: number = 50): Promise<{ assistiti: Assistito[], total: number }> {
    const offset = (page - 1) * limit;
    
    try {
      const assistitiResult = await this.db.prepare(`
        SELECT * FROM assistiti 
        ORDER BY data_conversione DESC 
        LIMIT ? OFFSET ?
      `).bind(limit, offset).all();

      const countResult = await this.db.prepare(`
        SELECT COUNT(*) as total FROM assistiti
      `).first();

      return {
        assistiti: assistitiResult.results as Assistito[],
        total: (countResult as any)?.total || 0
      };
    } catch (error) {
      console.error('Error fetching assistiti:', error);
      throw new Error('Errore nel recupero degli assistiti');
    }
  }

  async getAssistitoById(id: number): Promise<Assistito | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM assistiti WHERE id = ?
      `).bind(id).first();

      return result as Assistito || null;
    } catch (error) {
      console.error('Error fetching assistito by ID:', error);
      return null;
    }
  }

  async searchAssistiti(query: string): Promise<Assistito[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM assistiti 
        WHERE nome LIKE ? OR cognome LIKE ? OR email LIKE ? OR codice_assistito LIKE ? OR numero_contratto LIKE ?
        ORDER BY data_conversione DESC
        LIMIT 100
      `).bind(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`).all();

      return result.results as Assistito[];
    } catch (error) {
      console.error('Error searching assistiti:', error);
      return [];
    }
  }

  // WORKFLOW TRACKING
  async getWorkflowByAssistitoId(assistitoId: number): Promise<WorkflowTracking[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM workflow_tracking 
        WHERE assistito_id = ? 
        ORDER BY data_inizio ASC
      `).bind(assistitoId).all();

      return result.results as WorkflowTracking[];
    } catch (error) {
      console.error('Error fetching workflow tracking:', error);
      return [];
    }
  }

  async updateWorkflowPhase(assistitoId: number, fase: string, stato: string, note?: string): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      
      // Check if phase exists
      const existing = await this.db.prepare(`
        SELECT id FROM workflow_tracking 
        WHERE assistito_id = ? AND fase = ?
      `).bind(assistitoId, fase).first();

      if (existing) {
        // Update existing phase
        await this.db.prepare(`
          UPDATE workflow_tracking 
          SET stato = ?, data_completamento = ?, note = ?, updated_at = CURRENT_TIMESTAMP
          WHERE assistito_id = ? AND fase = ?
        `).bind(stato, stato === 'COMPLETATO' ? now : null, note || '', assistitoId, fase).run();
      } else {
        // Create new phase
        await this.db.prepare(`
          INSERT INTO workflow_tracking (assistito_id, fase, stato, data_inizio, data_completamento, note)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(assistitoId, fase, stato, now, stato === 'COMPLETATO' ? now : null, note || '').run();
      }

      return true;
    } catch (error) {
      console.error('Error updating workflow phase:', error);
      return false;
    }
  }

  // SYSTEM LOGS
  async getSystemLogs(page: number = 1, limit: number = 100, tipo?: string, livello?: string): Promise<{ logs: SystemLog[], total: number }> {
    const offset = (page - 1) * limit;
    
    try {
      let query = 'SELECT * FROM system_logs';
      let countQuery = 'SELECT COUNT(*) as total FROM system_logs';
      const params: any[] = [];
      
      const conditions: string[] = [];
      if (tipo) {
        conditions.push('tipo = ?');
        params.push(tipo);
      }
      if (livello) {
        conditions.push('livello = ?');
        params.push(livello);
      }
      
      if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const logsResult = await this.db.prepare(query).bind(...params).all();
      
      const countParams = params.slice(0, -2); // Remove limit and offset for count
      const countResult = await this.db.prepare(countQuery).bind(...countParams).first();

      return {
        logs: logsResult.results as SystemLog[],
        total: (countResult as any)?.total || 0
      };
    } catch (error) {
      console.error('Error fetching system logs:', error);
      throw new Error('Errore nel recupero dei logs di sistema');
    }
  }

  async addSystemLog(tipo: string, modulo: string, messaggio: string, dettagli?: any, livello: string = 'INFO', assistitoId?: number, leadId?: number): Promise<boolean> {
    try {
      await this.db.prepare(`
        INSERT INTO system_logs (tipo, modulo, messaggio, dettagli, livello, assistito_id, lead_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        tipo, 
        modulo, 
        messaggio, 
        dettagli ? JSON.stringify(dettagli) : null, 
        livello, 
        assistitoId || null, 
        leadId || null
      ).run();

      return true;
    } catch (error) {
      console.error('Error adding system log:', error);
      return false;
    }
  }

  // STATISTICS AND DASHBOARD DATA
  async getDataStats(): Promise<DataStats> {
    try {
      // Get leads stats
      const leadsStats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_leads,
          SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as leads_attivi,
          SUM(CASE WHEN status = 'CONVERTED' THEN 1 ELSE 0 END) as leads_convertiti
        FROM leads
      `).first();

      // Get assistiti stats
      const assistitiStats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_assistiti,
          SUM(CASE WHEN stato = 'ATTIVO' THEN 1 ELSE 0 END) as assistiti_attivi,
          SUM(CASE WHEN numero_contratto IS NOT NULL THEN 1 ELSE 0 END) as contratti_firmati
        FROM assistiti
      `).first();

      // Get workflow stats
      const workflowStats = await this.db.prepare(`
        SELECT COUNT(*) as workflow_completati
        FROM workflow_tracking 
        WHERE stato = 'COMPLETATO' AND fase = 'SPEDIZIONE_COMPLETATA'
      `).first();

      // Get today's logs count
      const logsStats = await this.db.prepare(`
        SELECT COUNT(*) as logs_oggi
        FROM system_logs 
        WHERE DATE(timestamp) = DATE('now')
      `).first();

      return {
        total_leads: (leadsStats as any)?.total_leads || 0,
        leads_attivi: (leadsStats as any)?.leads_attivi || 0,
        leads_convertiti: (leadsStats as any)?.leads_convertiti || 0,
        total_assistiti: (assistitiStats as any)?.total_assistiti || 0,
        assistiti_attivi: (assistitiStats as any)?.assistiti_attivi || 0,
        contratti_firmati: (assistitiStats as any)?.contratti_firmati || 0,
        workflow_completati: (workflowStats as any)?.workflow_completati || 0,
        logs_oggi: (logsStats as any)?.logs_oggi || 0
      };
    } catch (error) {
      console.error('Error fetching data stats:', error);
      return {
        total_leads: 0,
        leads_attivi: 0,
        leads_convertiti: 0,
        total_assistiti: 0,
        assistiti_attivi: 0,
        contratti_firmati: 0,
        workflow_completati: 0,
        logs_oggi: 0
      };
    }
  }

  // LEAD TO ASSISTITO CONVERSION
  async convertLeadToAssistito(leadId: string, tipoContratto: string = 'BASE', numeroContratto?: string, valoreContratto?: number): Promise<{ success: boolean, assistitoId?: number, error?: string }> {
    try {
      // Get lead data
      const lead = await this.getLeadById(leadId);
      if (!lead) {
        return { success: false, error: 'Lead non trovato' };
      }

      // Check if already converted
      const existing = await this.db.prepare(`
        SELECT id FROM assistiti WHERE lead_id = ?
      `).bind(leadId).first();

      if (existing) {
        return { success: false, error: 'Lead già convertito in assistito' };
      }

      // Generate codice assistito
      const codiceAssistito = `ASS${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Parse address from lead - assuming format "Via Roma 123, 20100 Milano MI"
      const addressParts = (lead.indirizzoAssistito || lead.indirizzoRichiedente || '').split(',');
      const street = addressParts[0]?.trim() || '';
      const cityInfo = addressParts[1]?.trim().split(' ') || [];
      const cap = cityInfo[0] || '';
      const city = cityInfo.slice(1, -1).join(' ') || '';
      const province = cityInfo[cityInfo.length - 1] || '';

      // Insert assistito
      const result = await this.db.prepare(`
        INSERT INTO assistiti (
          lead_id, codice_assistito, nome, cognome, email, telefono, data_nascita,
          codice_fiscale, indirizzo, citta, cap, provincia, tipo_contratto, 
          numero_contratto, valore_contratto, data_conversione
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        leadId, codiceAssistito, 
        lead.nomeAssistito || lead.nomeRichiedente, 
        lead.cognomeAssistito || lead.cognomeRichiedente, 
        lead.emailRichiedente, 
        lead.telefonoRichiedente,
        lead.dataNascitaAssistito || '1950-01-01',
        lead.cfAssistito || lead.cfRichiedente || '', 
        street, city, cap, province,
        tipoContratto, numeroContratto || null, valoreContratto || null,
        new Date().toISOString()
      ).run();

      const assistitoId = result.meta.last_row_id as number;

      // Update lead status
      await this.db.prepare(`
        UPDATE leads SET status = 'CONVERTED' WHERE id = ?
      `).bind(leadId).run();

      // Initialize workflow
      await this.updateWorkflowPhase(assistitoId, 'PROFORMA_INVIATA', 'COMPLETATO', 'Conversione automatica da lead');

      // Log conversion
      await this.addSystemLog(
        'CONVERSIONE_LEAD',
        'DataManagementService',
        `Lead ${leadId} convertito in assistito ${codiceAssistito}`,
        { leadId, assistitoId, tipoContratto },
        'INFO',
        assistitoId,
        parseInt(leadId)
      );

      return { success: true, assistitoId };
    } catch (error) {
      console.error('Error converting lead to assistito:', error);
      return { success: false, error: 'Errore durante la conversione' };
    }
  }
}