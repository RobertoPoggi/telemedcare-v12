/**
 * Proforma Manager - TeleMedCare V12.0
 * Gestione completa delle proforma: creazione, generazione PDF, invio
 */

import TemplateManager, { TemplateRenderData } from './template-manager.js';

export interface ProformaData {
  id: string;
  leadId: string;
  numero_proforma: string;
  data_emissione: string;
  data_scadenza: string;
  valuta: string;

  // Dati cliente
  cliente_nome: string;
  cliente_cognome: string;
  cliente_email: string;
  cliente_telefono?: string;
  cliente_indirizzo?: string;
  cliente_citta?: string;
  cliente_cap?: string;
  cliente_provincia?: string;
  cliente_codice_fiscale?: string;

  // Dati assistito
  assistito_nome?: string;
  assistito_cognome?: string;
  assistito_data_nascita?: string;
  assistito_codice_fiscale?: string;
  assistito_parentela?: string;

  // Servizio
  pacchetto_tipo: string;
  pacchetto_descrizione?: string;
  prezzo_mensile: number;
  numero_mesi: number;
  prezzo_totale: number;

  // Dispositivo
  dispositivo_incluso: boolean;
  dispositivo_tipo: string;
  dispositivo_imei?: string;
  spedizione_inclusa: boolean;
  costo_spedizione: number;

  // Personalizzazioni
  note_aggiuntive?: string;
  condizioni_speciali?: string;
  sconto_applicato: number;
  sconto_descrizione?: string;

  // File e status
  pdf_url?: string;
  pdf_generated: boolean;
  template_utilizzato?: string;
  dati_personalizzazione?: string; // JSON

  // Status workflow
  status: 'DRAFT' | 'GENERATED' | 'SENT' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  inviata_il?: string;
  accettata_il?: string;
  scaduta_il?: string;

  // Pagamento
  pagamento_ricevuto: boolean;
  data_pagamento?: string;
  modalita_pagamento?: string;
  importo_pagato?: number;

  // Conversione
  convertita_in_contratto: boolean;
  contratto_id?: string;
  data_conversione?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateProformaRequest {
  leadId: string;
  pacchetto_tipo: 'BASE' | 'AVANZATO' | 'PREMIUM';
  durata_mesi?: number;
  sconto_applicato?: number;
  sconto_descrizione?: string;
  note_aggiuntive?: string;
  condizioni_speciali?: string;
}

export class ProformaManager {
  private db: D1Database;
  private templateManager: TemplateManager;

  constructor(database: D1Database) {
    this.db = database;
    this.templateManager = new TemplateManager(database);
  }

  /**
   * Crea una nuova proforma per un lead
   */
  async createProforma(request: CreateProformaRequest): Promise<ProformaData> {
    // Recupera i dati del lead
    const leadData = await this.getLeadData(request.leadId);
    if (!leadData) {
      throw new Error(`Lead non trovato: ${request.leadId}`);
    }

    // Genera ID e numero proforma
    const proformaId = this.generateId();
    const numeroProforma = this.generateProformaNumber();
    
    // Calcola prezzi basati sul pacchetto
    const prezzario = this.getPricing(request.pacchetto_tipo);
    const durataEffettiva = request.durata_mesi || 12;
    const prezzoMensile = prezzario.mensile;
    const prezzoTotale = (prezzoMensile * durataEffettiva) - (request.sconto_applicato || 0);

    // Calcola scadenza (30 giorni dalla creazione)
    const dataEmissione = new Date();
    const dataScadenza = new Date();
    dataScadenza.setDate(dataScadenza.getDate() + 30);

    // Prepara i dati della proforma
    const proformaData: Partial<ProformaData> = {
      id: proformaId,
      leadId: request.leadId,
      numero_proforma: numeroProforma,
      data_emissione: dataEmissione.toISOString().split('T')[0],
      data_scadenza: dataScadenza.toISOString().split('T')[0],
      valuta: 'EUR',

      // Dati cliente dal lead
      cliente_nome: leadData.nomeRichiedente,
      cliente_cognome: leadData.cognomeRichiedente,
      cliente_email: leadData.email,
      cliente_telefono: leadData.telefono,
      cliente_indirizzo: leadData.indirizzoIntestatario,
      cliente_codice_fiscale: leadData.cfIntestatario,

      // Dati assistito
      assistito_nome: leadData.nomeAssistito,
      assistito_cognome: leadData.cognomeAssistito,
      assistito_data_nascita: leadData.dataNascitaAssistito,
      assistito_codice_fiscale: leadData.cfAssistito,
      assistito_parentela: leadData.parentelaAssistito,

      // Servizio
      pacchetto_tipo: request.pacchetto_tipo,
      pacchetto_descrizione: prezzario.descrizione,
      prezzo_mensile: prezzoMensile,
      numero_mesi: durataEffettiva,
      prezzo_totale: prezzoTotale,

      // Dispositivo
      dispositivo_incluso: true,
      dispositivo_tipo: 'SiDLY Care Pro',
      spedizione_inclusa: true,
      costo_spedizione: 0,

      // Personalizzazioni
      note_aggiuntive: request.note_aggiuntive,
      condizioni_speciali: request.condizioni_speciali,
      sconto_applicato: request.sconto_applicato || 0,
      sconto_descrizione: request.sconto_descrizione,

      // Status
      status: 'DRAFT',
      pdf_generated: false,
      pagamento_ricevuto: false,
      convertita_in_contratto: false
    };

    // Salva nel database
    await this.insertProforma(proformaData);

    // Genera l'HTML della proforma
    await this.generateProformaHTML(proformaId);

    return await this.getProforma(proformaId) as ProformaData;
  }

  /**
   * Genera l'HTML della proforma
   */
  async generateProformaHTML(proformaId: string): Promise<void> {
    const proforma = await this.getProforma(proformaId);
    if (!proforma) {
      throw new Error(`Proforma non trovata: ${proformaId}`);
    }

    const leadData = await this.getLeadData(proforma.leadId);
    if (!leadData) {
      throw new Error(`Lead non trovato: ${proforma.leadId}`);
    }

    // Genera HTML tramite TemplateManager
    const result = await this.templateManager.generateProforma(leadData, proforma);

    // Aggiorna la proforma con i dati di generazione
    await this.db
      .prepare(`
        UPDATE proforma 
        SET 
          pdf_generated = 1,
          template_utilizzato = ?,
          dati_personalizzazione = ?,
          status = 'GENERATED',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        result.template_utilizzato,
        JSON.stringify({
          html_length: result.html.length,
          generated_at: new Date().toISOString(),
          variables_used: Object.keys(proforma).length
        }),
        proformaId
      )
      .run();
  }

  /**
   * Ottiene una proforma per ID
   */
  async getProforma(proformaId: string): Promise<ProformaData | null> {
    const result = await this.db
      .prepare(`SELECT * FROM proforma WHERE id = ?`)
      .bind(proformaId)
      .first();

    return result ? this.parseProforma(result) : null;
  }

  /**
   * Ottiene tutte le proforma per un lead
   */
  async getProformeByLead(leadId: string): Promise<ProformaData[]> {
    const result = await this.db
      .prepare(`
        SELECT * FROM proforma 
        WHERE leadId = ? 
        ORDER BY created_at DESC
      `)
      .bind(leadId)
      .all();

    return result.results.map(this.parseProforma);
  }

  /**
   * Segna una proforma come inviata
   */
  async markProformaAsSent(proformaId: string): Promise<void> {
    await this.db
      .prepare(`
        UPDATE proforma 
        SET 
          status = 'SENT',
          inviata_il = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(proformaId)
      .run();
  }

  /**
   * Accetta una proforma e avvia il processo di conversione
   */
  async acceptProforma(proformaId: string, paymentData?: any): Promise<void> {
    const proforma = await this.getProforma(proformaId);
    if (!proforma) {
      throw new Error(`Proforma non trovata: ${proformaId}`);
    }

    // Aggiorna status proforma
    await this.db
      .prepare(`
        UPDATE proforma 
        SET 
          status = 'ACCEPTED',
          accettata_il = CURRENT_TIMESTAMP,
          pagamento_ricevuto = ?,
          data_pagamento = ?,
          modalita_pagamento = ?,
          importo_pagato = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        paymentData ? 1 : 0,
        paymentData?.data_pagamento || null,
        paymentData?.modalita_pagamento || null,
        paymentData?.importo_pagato || null,
        proformaId
      )
      .run();

    // Crea automation task per il follow-up
    await this.createAcceptanceFollowUpTasks(proforma);
  }

  /**
   * Converte una proforma in contratto
   */
  async convertToContract(proformaId: string): Promise<string> {
    const proforma = await this.getProforma(proformaId);
    if (!proforma) {
      throw new Error(`Proforma non trovata: ${proformaId}`);
    }

    if (proforma.status !== 'ACCEPTED') {
      throw new Error(`La proforma deve essere accettata prima della conversione`);
    }

    // Genera ID contratto
    const contractId = this.generateId();
    const numeroContratto = this.generateContractNumber();

    // Inserisce il contratto base
    await this.db
      .prepare(`
        INSERT INTO contracts (
          id, leadId, contractType, contractTemplate, contractData,
          status, generatedAt, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      .bind(
        contractId,
        proforma.leadId,
        proforma.pacchetto_tipo,
        'contratto_base_v1',
        JSON.stringify({
          source_proforma_id: proformaId,
          numero_contratto: numeroContratto
        })
      )
      .run();

    // Inserisce i dettagli del contratto
    await this.insertContractDetails(contractId, proforma, numeroContratto);

    // Aggiorna la proforma
    await this.db
      .prepare(`
        UPDATE proforma 
        SET 
          convertita_in_contratto = 1,
          contratto_id = ?,
          data_conversione = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(contractId, proformaId)
      .run();

    return contractId;
  }

  /**
   * Ottiene statistiche proforma
   */
  async getProformaStats(): Promise<any> {
    const stats = await this.db
      .prepare(`
        SELECT 
          COUNT(*) as totale,
          SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as bozze,
          SUM(CASE WHEN status = 'GENERATED' THEN 1 ELSE 0 END) as generate,
          SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) as inviate,
          SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accettate,
          SUM(CASE WHEN convertita_in_contratto = 1 THEN 1 ELSE 0 END) as convertite,
          AVG(prezzo_totale) as valore_medio,
          SUM(prezzo_totale) as valore_totale
        FROM proforma
      `)
      .first();

    return stats;
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

  private async insertProforma(data: Partial<ProformaData>): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO proforma (
          id, leadId, numero_proforma, data_emissione, data_scadenza, valuta,
          cliente_nome, cliente_cognome, cliente_email, cliente_telefono,
          cliente_indirizzo, cliente_citta, cliente_cap, cliente_provincia, cliente_codice_fiscale,
          assistito_nome, assistito_cognome, assistito_data_nascita, assistito_codice_fiscale, assistito_parentela,
          pacchetto_tipo, pacchetto_descrizione, prezzo_mensile, numero_mesi, prezzo_totale,
          dispositivo_incluso, dispositivo_tipo, dispositivo_imei, spedizione_inclusa, costo_spedizione,
          note_aggiuntive, condizioni_speciali, sconto_applicato, sconto_descrizione,
          pdf_generated, template_utilizzato, dati_personalizzazione,
          status, pagamento_ricevuto, convertita_in_contratto,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `)
      .bind(
        data.id, data.leadId, data.numero_proforma, data.data_emissione, data.data_scadenza, data.valuta,
        data.cliente_nome, data.cliente_cognome, data.cliente_email, data.cliente_telefono,
        data.cliente_indirizzo, data.cliente_citta, data.cliente_cap, data.cliente_provincia, data.cliente_codice_fiscale,
        data.assistito_nome, data.assistito_cognome, data.assistito_data_nascita, data.assistito_codice_fiscale, data.assistito_parentela,
        data.pacchetto_tipo, data.pacchetto_descrizione, data.prezzo_mensile, data.numero_mesi, data.prezzo_totale,
        data.dispositivo_incluso, data.dispositivo_tipo, data.dispositivo_imei, data.spedizione_inclusa, data.costo_spedizione,
        data.note_aggiuntive, data.condizioni_speciali, data.sconto_applicato, data.sconto_descrizione,
        data.pdf_generated, data.template_utilizzato, data.dati_personalizzazione,
        data.status, data.pagamento_ricevuto, data.convertita_in_contratto
      )
      .run();
  }

  private async insertContractDetails(contractId: string, proforma: ProformaData, numeroContratto: string): Promise<void> {
    const dataInizio = new Date();
    const dataScadenza = new Date();
    dataScadenza.setMonth(dataScadenza.getMonth() + proforma.numero_mesi);

    await this.db
      .prepare(`
        INSERT INTO contract_details (
          contract_id, cliente_nome, cliente_cognome, cliente_email, cliente_telefone,
          cliente_indirizzo, cliente_citta, cliente_cap, cliente_provincia, cliente_codice_fiscale,
          assistito_nome, assistito_cognome, assistito_data_nascita, assistito_codice_fiscale, assistito_parentela,
          tipo_contratto, durata_mesi, prezzo_mensile, prezzo_totale,
          data_inizio_servizio, data_scadenza_contratto,
          dispositivo_modello, numero_contratto,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?,
          ?, ?,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `)
      .bind(
        contractId, proforma.cliente_nome, proforma.cliente_cognome, proforma.cliente_email, proforma.cliente_telefono,
        proforma.cliente_indirizzo, proforma.cliente_citta, proforma.cliente_cap, proforma.cliente_provincia, proforma.cliente_codice_fiscale,
        proforma.assistito_nome, proforma.assistito_cognome, proforma.assistito_data_nascita, proforma.assistito_codice_fiscale, proforma.assistito_parentela,
        proforma.pacchetto_tipo, proforma.numero_mesi, proforma.prezzo_mensile, proforma.prezzo_totale,
        dataInizio.toISOString().split('T')[0], dataScadenza.toISOString().split('T')[0],
        proforma.dispositivo_tipo, numeroContratto
      )
      .run();
  }

  private async createAcceptanceFollowUpTasks(proforma: ProformaData): Promise<void> {
    const tasks = [
      {
        automationType: 'EMAIL_BENVENUTO',
        scheduledDate: new Date(),
        priority: 'HIGH'
      },
      {
        automationType: 'INVIO_CONTRATTO',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 giorno
        priority: 'HIGH'
      }
    ];

    for (const task of tasks) {
      const taskId = this.generateId();
      await this.db
        .prepare(`
          INSERT INTO automation_tasks (
            id, leadId, automationType, scheduledDate, scheduledTime, 
            priority, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `)
        .bind(
          taskId, proforma.leadId, task.automationType, 
          task.scheduledDate.toISOString().split('T')[0],
          task.scheduledDate.toTimeString().split(' ')[0],
          task.priority, 'SCHEDULED'
        )
        .run();
    }
  }

  private parseProforma(row: any): ProformaData {
    return {
      id: row.id,
      leadId: row.leadId,
      numero_proforma: row.numero_proforma,
      data_emissione: row.data_emissione,
      data_scadenza: row.data_scadenza,
      valuta: row.valuta || 'EUR',

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

      pacchetto_tipo: row.pacchetto_tipo,
      pacchetto_descrizione: row.pacchetto_descrizione,
      prezzo_mensile: Number(row.prezzo_mensile),
      numero_mesi: row.numero_mesi,
      prezzo_totale: Number(row.prezzo_totale),

      dispositivo_incluso: Boolean(row.dispositivo_incluso),
      dispositivo_tipo: row.dispositivo_tipo,
      dispositivo_imei: row.dispositivo_imei,
      spedizione_inclusa: Boolean(row.spedizione_inclusa),
      costo_spedizione: Number(row.costo_spedizione),

      note_aggiuntive: row.note_aggiuntive,
      condizioni_speciali: row.condizioni_speciali,
      sconto_applicato: Number(row.sconto_applicato),
      sconto_descrizione: row.sconto_descrizione,

      pdf_url: row.pdf_url,
      pdf_generated: Boolean(row.pdf_generated),
      template_utilizzato: row.template_utilizzato,
      dati_personalizzazione: row.dati_personalizzazione,

      status: row.status,
      inviata_il: row.inviata_il,
      accettata_il: row.accettata_il,
      scaduta_il: row.scaduta_il,

      pagamento_ricevuto: Boolean(row.pagamento_ricevuto),
      data_pagamento: row.data_pagamento,
      modalita_pagamento: row.modalita_pagamento,
      importo_pagato: row.importo_pagato ? Number(row.importo_pagato) : undefined,

      convertita_in_contratto: Boolean(row.convertita_in_contratto),
      contratto_id: row.contratto_id,
      data_conversione: row.data_conversione,

      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private generateId(): string {
    return `prf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateProformaNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `PRF${year}${month}${random}`;
  }

  private generateContractNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `CTR${year}${month}${random}`;
  }

  private getPricing(pacchetto: string): { mensile: number; descrizione: string } {
    const prezzi = {
      'BASE': { 
        mensile: 89.90, 
        descrizione: 'Monitoraggio continuo 24/7, assistenza telefonica, dispositivo SiDLY Care Pro incluso' 
      },
      'AVANZATO': { 
        mensile: 149.90, 
        descrizione: 'Servizio BASE + consulenze mediche, analisi approfondite, report personalizzati' 
      },
      'PREMIUM': { 
        mensile: 249.90, 
        descrizione: 'Servizio AVANZATO + visite domiciliari, medico dedicato, priorità massima' 
      }
    };

    return prezzi[pacchetto as keyof typeof prezzi] || prezzi.BASE;
  }
}

export default ProformaManager;