/**
 * Contract Manager - TeleMedCare V11.0
 * Gestione completa dei contratti: generazione, firma digitale, tracking
 */

import TemplateManager from './template-manager.js';

export interface ContractData {
  // Base contract
  id: string;
  leadId: string;
  contractType: string;
  contractTemplate: string;
  contractData: string;
  pdfUrl?: string;
  pdfGenerated: boolean;
  fileSize?: number;
  status: 'DRAFT' | 'GENERATED' | 'SENT' | 'SIGNED' | 'CANCELLED';
  generatedAt?: string;
  sentAt?: string;
  signedAt?: string;
  created_at: string;
  updated_at: string;

  // Contract details
  details?: ContractDetails;
}

export interface ContractDetails {
  contract_id: string;
  
  // Dati cliente completi
  cliente_nome: string;
  cliente_cognome: string;
  cliente_email: string;
  cliente_telefono?: string;
  cliente_indirizzo: string;
  cliente_citta: string;
  cliente_cap: string;
  cliente_provincia: string;
  cliente_codice_fiscale: string;

  // Dati assistito
  assistito_nome: string;
  assistito_cognome: string;
  assistito_data_nascita: string;
  assistito_codice_fiscale?: string;
  assistito_parentela?: string;
  assistito_condizioni_salute?: string;

  // Dettagli servizio
  tipo_contratto: string;
  durata_mesi: number;
  prezzo_mensile: number;
  prezzo_totale: number;
  data_inizio_servizio?: string;
  data_scadenza_contratto?: string;

  // Dispositivo
  dispositivo_imei?: string;
  dispositivo_modello: string;
  data_consegna_dispositivo?: string;
  indirizzo_spedizione?: string;

  // Configurazione servizio
  contatto_emergenza_1?: string;
  contatto_emergenza_2?: string;
  medico_curante?: string;
  centro_medico_riferimento?: string;
  note_mediche?: string;

  // Clausole
  clausole_personalizzate?: string;
  condizioni_speciali?: string;
  sconti_applicati?: string;

  // Firma digitale
  firmato_digitalmente: boolean;
  data_firma?: string;
  ip_firma?: string;
  user_agent_firma?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateContractRequest {
  leadId: string;
  contractType: 'BASE' | 'AVANZATO' | 'PREMIUM';
  proformaId?: string; // Se deriva da una proforma
  
  // Dati cliente (se non derivano da proforma/lead)
  cliente_nome?: string;
  cliente_cognome?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  cliente_indirizzo?: string;
  cliente_citta?: string;
  cliente_cap?: string;
  cliente_provincia?: string;
  cliente_codice_fiscale?: string;

  // Dati assistito personalizzati
  assistito_condizioni_salute?: string;
  contatto_emergenza_1?: string;
  contatto_emergenza_2?: string;
  medico_curante?: string;
  centro_medico_riferimento?: string;
  note_mediche?: string;

  // Personalizzazioni
  clausole_personalizzate?: string;
  condizioni_speciali?: string;
  durata_mesi?: number;
}

export interface SignContractRequest {
  contractId: string;
  firma_digitale: {
    ip_address: string;
    user_agent: string;
    timestamp: string;
  };
  accettazione_condizioni: boolean;
  consenso_privacy: boolean;
  consenso_marketing?: boolean;
}

export class ContractManager {
  private db: D1Database;
  private templateManager: TemplateManager;

  constructor(database: D1Database) {
    this.db = database;
    this.templateManager = new TemplateManager(database);
  }

  /**
   * Crea un nuovo contratto
   */
  async createContract(request: CreateContractRequest): Promise<ContractData> {
    // Genera ID e numero contratto
    const contractId = this.generateId();
    const numeroContratto = this.generateContractNumber();

    // Recupera i dati del lead
    const leadData = await this.getLeadData(request.leadId);
    if (!leadData) {
      throw new Error(`Lead non trovato: ${request.leadId}`);
    }

    // Se deriva da una proforma, recupera anche quei dati
    let proformaData = null;
    if (request.proformaId) {
      proformaData = await this.getProformaData(request.proformaId);
    }

    // Calcola prezzi e durata
    const prezzario = this.getPricing(request.contractType);
    const durataEffettiva = request.durata_mesi || 12;
    const prezzoTotale = prezzario.mensile * durataEffettiva;

    // Calcola date servizio
    const dataInizio = new Date();
    const dataScadenza = new Date();
    dataScadenza.setMonth(dataScadenza.getMonth() + durataEffettiva);

    // Inserisce il contratto base
    const contractData = {
      source_proforma_id: request.proformaId,
      numero_contratto: numeroContratto,
      generated_at: new Date().toISOString()
    };

    await this.db
      .prepare(`
        INSERT INTO contracts (
          id, leadId, contractType, contractTemplate, contractData,
          pdfGenerated, status, generatedAt, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      .bind(
        contractId,
        request.leadId,
        request.contractType,
        `contratto_${request.contractType.toLowerCase()}_v1`,
        JSON.stringify(contractData),
        0, // pdfGenerated = false
        'DRAFT'
      )
      .run();

    // Prepara i dati dettagliati del contratto
    const detailsData = {
      contract_id: contractId,
      
      // Dati cliente (priorità: request > proforma > lead)
      cliente_nome: request.cliente_nome || proformaData?.cliente_nome || leadData.nomeRichiedente,
      cliente_cognome: request.cliente_cognome || proformaData?.cliente_cognome || leadData.cognomeRichiedente,
      cliente_email: request.cliente_email || proformaData?.cliente_email || leadData.emailRichiedente,
      cliente_telefono: request.cliente_telefono || proformaData?.cliente_telefono || leadData.telefonoRichiedente,
      cliente_indirizzo: request.cliente_indirizzo || proformaData?.cliente_indirizzo || leadData.indirizzoRichiedente || '',
      cliente_citta: request.cliente_citta || proformaData?.cliente_citta || '',
      cliente_cap: request.cliente_cap || proformaData?.cliente_cap || '',
      cliente_provincia: request.cliente_provincia || proformaData?.cliente_provincia || '',
      cliente_codice_fiscale: request.cliente_codice_fiscale || proformaData?.cliente_codice_fiscale || leadData.cfRichiedente || '',

      // Dati assistito
      assistito_nome: leadData.nomeAssistito || '',
      assistito_cognome: leadData.cognomeAssistito || '',
      assistito_data_nascita: leadData.dataNascitaAssistito || '',
      assistito_codice_fiscale: leadData.cfAssistito,
      assistito_parentela: leadData.parentelaAssistito,
      assistito_condizioni_salute: request.assistito_condizioni_salute || leadData.condizioniSalute,

      // Dettagli servizio
      tipo_contratto: request.contractType,
      durata_mesi: durataEffettiva,
      prezzo_mensile: prezzario.mensile,
      prezzo_totale: prezzoTotale,
      data_inizio_servizio: dataInizio.toISOString().split('T')[0],
      data_scadenza_contratto: dataScadenza.toISOString().split('T')[0],

      // Dispositivo
      dispositivo_modello: 'SiDLY Care Pro',
      
      // Configurazione servizio
      contatto_emergenza_1: request.contatto_emergenza_1,
      contatto_emergenza_2: request.contatto_emergenza_2,
      medico_curante: request.medico_curante,
      centro_medico_riferimento: request.centro_medico_riferimento,
      note_mediche: request.note_mediche,

      // Clausole personalizzate
      clausole_personalizzate: request.clausole_personalizzate,
      condizioni_speciali: request.condizioni_speciali,

      // Firma
      firmato_digitalmente: false
    };

    // Inserisce i dettagli del contratto
    await this.insertContractDetails(detailsData);

    // Genera l'HTML del contratto
    await this.generateContractHTML(contractId);

    return await this.getContract(contractId) as ContractData;
  }

  /**
   * Genera l'HTML del contratto
   */
  async generateContractHTML(contractId: string): Promise<void> {
    const contract = await this.getContract(contractId);
    if (!contract || !contract.details) {
      throw new Error(`Contratto o dettagli non trovati: ${contractId}`);
    }

    const leadData = await this.getLeadData(contract.leadId);
    if (!leadData) {
      throw new Error(`Lead non trovato: ${contract.leadId}`);
    }

    // Genera HTML tramite TemplateManager
    const result = await this.templateManager.generateContract(leadData, contract.details);

    // Aggiorna il contratto con i dati di generazione
    await this.db
      .prepare(`
        UPDATE contracts 
        SET 
          pdfGenerated = 1,
          contractTemplate = ?,
          contractData = ?,
          status = 'GENERATED',
          generatedAt = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        result.template_utilizzato,
        JSON.stringify({
          html_length: result.html.length,
          generated_at: new Date().toISOString(),
          template_used: result.template_utilizzato
        }),
        contractId
      )
      .run();
  }

  /**
   * Ottiene un contratto completo
   */
  async getContract(contractId: string): Promise<ContractData | null> {
    // Recupera il contratto base
    const contractResult = await this.db
      .prepare(`SELECT * FROM contracts WHERE id = ?`)
      .bind(contractId)
      .first();

    if (!contractResult) {
      return null;
    }

    // Recupera i dettagli del contratto
    const detailsResult = await this.db
      .prepare(`SELECT * FROM contract_details WHERE contract_id = ?`)
      .bind(contractId)
      .first();

    return {
      ...this.parseContract(contractResult),
      details: detailsResult ? this.parseContractDetails(detailsResult) : undefined
    };
  }

  /**
   * Ottiene tutti i contratti per un lead
   */
  async getContractsByLead(leadId: string): Promise<ContractData[]> {
    const result = await this.db
      .prepare(`
        SELECT c.*, cd.* 
        FROM contracts c
        LEFT JOIN contract_details cd ON c.id = cd.contract_id
        WHERE c.leadId = ? 
        ORDER BY c.created_at DESC
      `)
      .bind(leadId)
      .all();

    return result.results.map(row => ({
      ...this.parseContract(row),
      details: row.contract_id ? this.parseContractDetails(row) : undefined
    }));
  }

  /**
   * Invia un contratto per la firma
   */
  async sendContractForSigning(contractId: string): Promise<void> {
    const contract = await this.getContract(contractId);
    if (!contract) {
      throw new Error(`Contratto non trovato: ${contractId}`);
    }

    if (contract.status !== 'GENERATED') {
      throw new Error(`Il contratto deve essere generato prima dell'invio`);
    }

    await this.db
      .prepare(`
        UPDATE contracts 
        SET 
          status = 'SENT',
          sentAt = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(contractId)
      .run();

    // Crea automation task per reminder
    await this.createSigningReminderTasks(contract);
  }

  /**
   * Firma digitalmente un contratto
   */
  async signContract(request: SignContractRequest): Promise<void> {
    const contract = await this.getContract(request.contractId);
    if (!contract) {
      throw new Error(`Contratto non trovato: ${request.contractId}`);
    }

    if (contract.status !== 'SENT') {
      throw new Error(`Il contratto deve essere inviato prima della firma`);
    }

    if (!request.accettazione_condizioni) {
      throw new Error(`Accettazione delle condizioni obbligatoria`);
    }

    if (!request.consenso_privacy) {
      throw new Error(`Consenso privacy obbligatorio`);
    }

    // Aggiorna il contratto come firmato
    await this.db
      .prepare(`
        UPDATE contracts 
        SET 
          status = 'SIGNED',
          signedAt = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(request.contractId)
      .run();

    // Aggiorna i dettagli con i dati di firma
    await this.db
      .prepare(`
        UPDATE contract_details 
        SET 
          firmato_digitalmente = 1,
          data_firma = CURRENT_TIMESTAMP,
          ip_firma = ?,
          user_agent_firma = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE contract_id = ?
      `)
      .bind(
        request.firma_digitale.ip_address,
        request.firma_digitale.user_agent,
        request.contractId
      )
      .run();

    // Avvia il processo post-firma
    await this.startPostSigningProcess(contract);
  }

  /**
   * Assegna un dispositivo a un contratto firmato
   */
  async assignDevice(contractId: string, deviceImei: string): Promise<void> {
    const contract = await this.getContract(contractId);
    if (!contract) {
      throw new Error(`Contratto non trovato: ${contractId}`);
    }

    if (contract.status !== 'SIGNED') {
      throw new Error(`Il contratto deve essere firmato per l'assegnazione del dispositivo`);
    }

    // Verifica che il dispositivo sia disponibile
    const device = await this.db
      .prepare(`SELECT * FROM dispositivi WHERE imei = ? AND status = 'INVENTORY'`)
      .bind(deviceImei)
      .first();

    if (!device) {
      throw new Error(`Dispositivo non disponibile: ${deviceImei}`);
    }

    // Assegna il dispositivo
    await this.db
      .prepare(`
        UPDATE dispositivi 
        SET 
          status = 'ASSIGNED',
          assigned_to_customer = ?,
          assignment_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE imei = ?
      `)
      .bind(contractId, deviceImei)
      .run();

    // Aggiorna il contratto
    await this.db
      .prepare(`
        UPDATE contract_details 
        SET 
          dispositivo_imei = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE contract_id = ?
      `)
      .bind(deviceImei, contractId)
      .run();

    // Registra l'assegnazione
    await this.db
      .prepare(`
        INSERT INTO dispositivi_assignments (
          device_id, customer_id, assignment_type, notes
        ) VALUES (?, ?, ?, ?)
      `)
      .bind(
        device.device_id,
        contractId,
        'CUSTOMER_ACTIVATION',
        `Assegnato a contratto ${contractId}`
      )
      .run();
  }

  /**
   * Ottiene statistiche contratti
   */
  async getContractStats(): Promise<any> {
    const stats = await this.db
      .prepare(`
        SELECT 
          COUNT(*) as totale,
          SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as bozze,
          SUM(CASE WHEN status = 'GENERATED' THEN 1 ELSE 0 END) as generati,
          SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) as inviati,
          SUM(CASE WHEN status = 'SIGNED' THEN 1 ELSE 0 END) as firmati
        FROM contracts
      `)
      .first();

    const detailsStats = await this.db
      .prepare(`
        SELECT 
          AVG(prezzo_totale) as valore_medio,
          SUM(prezzo_totale) as valore_totale,
          SUM(CASE WHEN firmato_digitalmente = 1 THEN 1 ELSE 0 END) as firmati_digitalmente
        FROM contract_details
      `)
      .first();

    return { ...stats, ...detailsStats };
  }

  /**
   * Metodi privati di supporto
   */
  private async getLeadData(leadId: string): Promise<any> {
    return await this.db
      .prepare(`SELECT * FROM leads WHERE id = ?`)
      .bind(leadId)
      .first();
  }

  private async getProformaData(proformaId: string): Promise<any> {
    return await this.db
      .prepare(`SELECT * FROM proforma WHERE id = ?`)
      .bind(proformaId)
      .first();
  }

  private async insertContractDetails(details: any): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO contract_details (
          contract_id, cliente_nome, cliente_cognome, cliente_email, cliente_telefono,
          cliente_indirizzo, cliente_citta, cliente_cap, cliente_provincia, cliente_codice_fiscale,
          assistito_nome, assistito_cognome, assistito_data_nascita, assistito_codice_fiscale, assistito_parentela,
          assistito_condizioni_salute, tipo_contratto, durata_mesi, prezzo_mensile, prezzo_totale,
          data_inizio_servizio, data_scadenza_contratto, dispositivo_modello,
          contatto_emergenza_1, contatto_emergenza_2, medico_curante, centro_medico_riferimento,
          note_mediche, clausole_personalizzate, condizioni_speciali, firmato_digitalmente,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `)
      .bind(
        details.contract_id, details.cliente_nome, details.cliente_cognome, 
        details.cliente_email, details.cliente_telefono, details.cliente_indirizzo,
        details.cliente_citta, details.cliente_cap, details.cliente_provincia, 
        details.cliente_codice_fiscale, details.assistito_nome, details.assistito_cognome,
        details.assistito_data_nascita, details.assistito_codice_fiscale, 
        details.assistito_parentela, details.assistito_condizioni_salute,
        details.tipo_contratto, details.durata_mesi, details.prezzo_mensile, 
        details.prezzo_totale, details.data_inizio_servizio, details.data_scadenza_contratto,
        details.dispositivo_modello, details.contatto_emergenza_1, details.contatto_emergenza_2,
        details.medico_curante, details.centro_medico_riferimento, details.note_mediche,
        details.clausole_personalizzate, details.condizioni_speciali, 
        details.firmato_digitalmente ? 1 : 0
      )
      .run();
  }

  private async createSigningReminderTasks(contract: ContractData): Promise<void> {
    const reminderDates = [3, 7]; // reminder dopo 3 e 7 giorni

    for (const days of reminderDates) {
      const taskId = this.generateId();
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + days);

      await this.db
        .prepare(`
          INSERT INTO automation_tasks (
            id, leadId, automationType, scheduledDate, scheduledTime,
            priority, status, executionData, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `)
        .bind(
          taskId, contract.leadId, 'PROMEMORIA_FIRMA_CONTRATTO',
          reminderDate.toISOString().split('T')[0],
          '10:00:00', 'MEDIUM', 'SCHEDULED',
          JSON.stringify({ contract_id: contract.id, reminder_day: days })
        )
        .run();
    }
  }

  private async startPostSigningProcess(contract: ContractData): Promise<void> {
    // Converte il lead in assistito
    await this.convertLeadToAssistito(contract);

    // Crea task per attivazione servizio
    const tasks = [
      { type: 'ASSEGNAZIONE_DISPOSITIVO', days: 0, priority: 'HIGH' },
      { type: 'CONFIGURAZIONE_SERVIZIO', days: 1, priority: 'HIGH' },
      { type: 'EMAIL_ATTIVAZIONE', days: 1, priority: 'MEDIUM' }
    ];

    for (const task of tasks) {
      const taskId = this.generateId();
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + task.days);

      await this.db
        .prepare(`
          INSERT INTO automation_tasks (
            id, leadId, automationType, scheduledDate, scheduledTime,
            priority, status, executionData, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `)
        .bind(
          taskId, contract.leadId, task.type,
          scheduledDate.toISOString().split('T')[0],
          '09:00:00', task.priority, 'SCHEDULED',
          JSON.stringify({ contract_id: contract.id })
        )
        .run();
    }
  }

  private async convertLeadToAssistito(contract: ContractData): Promise<void> {
    if (!contract.details) return;

    const codiceAssistito = this.generateAssistitoCode();

    await this.db
      .prepare(`
        INSERT INTO assistiti (
          lead_id, codice_assistito, nome, cognome, email, telefono,
          data_nascita, codice_fiscale, indirizzo, citta, cap, provincia,
          tipo_contratto, stato, data_conversione, numero_contratto,
          valore_contratto, note_mediche, contatto_emergenza, medico_curante,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `)
      .bind(
        contract.leadId, codiceAssistito, contract.details.assistito_nome,
        contract.details.assistito_cognome, contract.details.cliente_email,
        contract.details.cliente_telefono, contract.details.assistito_data_nascita,
        contract.details.assistito_codice_fiscale, contract.details.cliente_indirizzo,
        contract.details.cliente_citta, contract.details.cliente_cap,
        contract.details.cliente_provincia, contract.details.tipo_contratto,
        'ATTIVO', JSON.parse(contract.contractData || '{}').numero_contratto,
        contract.details.prezzo_totale, contract.details.note_mediche,
        contract.details.contatto_emergenza_1, contract.details.medico_curante
      )
      .run();
  }

  private parseContract(row: any): Omit<ContractData, 'details'> {
    return {
      id: row.id,
      leadId: row.leadId,
      contractType: row.contractType,
      contractTemplate: row.contractTemplate,
      contractData: row.contractData || '{}',
      pdfUrl: row.pdfUrl,
      pdfGenerated: Boolean(row.pdfGenerated),
      fileSize: row.fileSize,
      status: row.status,
      generatedAt: row.generatedAt,
      sentAt: row.sentAt,
      signedAt: row.signedAt,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private parseContractDetails(row: any): ContractDetails {
    return {
      contract_id: row.contract_id,
      cliente_nome: row.cliente_nome,
      cliente_cognome: row.cliente_cognome,
      cliente_email: row.cliente_email,
      cliente_telefono: row.cliente_telefono,
      cliente_indirizzo: row.cliente_indirizzo,
      cliente_citta: row.cliente_citta,
      cliente_cap: row.cliente_cap,
      cliente_provincia: row.cliente_provincia,
      cliente_codice_fiscale: row.cliente_codice_fiscale,
      assistito_nome: row.assistito_nome,
      assistito_cognome: row.assistito_cognome,
      assistito_data_nascita: row.assistito_data_nascita,
      assistito_codice_fiscale: row.assistito_codice_fiscale,
      assistito_parentela: row.assistito_parentela,
      assistito_condizioni_salute: row.assistito_condizioni_salute,
      tipo_contratto: row.tipo_contratto,
      durata_mesi: row.durata_mesi,
      prezzo_mensile: Number(row.prezzo_mensile),
      prezzo_totale: Number(row.prezzo_totale),
      data_inizio_servizio: row.data_inizio_servizio,
      data_scadenza_contratto: row.data_scadenza_contratto,
      dispositivo_imei: row.dispositivo_imei,
      dispositivo_modello: row.dispositivo_modello,
      data_consegna_dispositivo: row.data_consegna_dispositivo,
      indirizzo_spedizione: row.indirizzo_spedizione,
      contatto_emergenza_1: row.contatto_emergenza_1,
      contatto_emergenza_2: row.contatto_emergenza_2,
      medico_curante: row.medico_curante,
      centro_medico_riferimento: row.centro_medico_riferimento,
      note_mediche: row.note_mediche,
      clausole_personalizzate: row.clausole_personalizzate,
      condizioni_speciali: row.condizioni_speciali,
      sconti_applicati: row.sconti_applicati,
      firmato_digitalmente: Boolean(row.firmato_digitalmente),
      data_firma: row.data_firma,
      ip_firma: row.ip_firma,
      user_agent_firma: row.user_agent_firma,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private generateId(): string {
    return `ctr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateContractNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `CTR${year}${month}${random}`;
  }

  private generateAssistitoCode(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `ASS${year}${random}`;
  }

  private getPricing(tipo: string): { mensile: number } {
    const prezzi = {
      'BASE': { mensile: 89.90 },
      'AVANZATO': { mensile: 149.90 },
      'PREMIUM': { mensile: 249.90 }
    };

    return prezzi[tipo as keyof typeof prezzi] || prezzi.BASE;
  }
}

export default ContractManager;