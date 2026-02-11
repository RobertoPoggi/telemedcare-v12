/**
 * Template Manager - TeleMedCare V12.0
 * Gestione templates per contratti, proforma e documenti
 */

export interface DocumentTemplate {
  id: number;
  nome_template: string;
  tipo_documento: 'CONTRACT' | 'PROFORMA' | 'EMAIL' | 'BROCHURE';
  categoria: 'BASE' | 'AVANZATO' | 'PREMIUM';
  versione: string;
  html_template: string;
  css_styles?: string;
  variabili_disponibili: string[];
  formato_output: 'PDF' | 'HTML' | 'DOCX';
  orientamento: 'portrait' | 'landscape';
  formato_carta: string;
  margini: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  attivo: boolean;
  template_predefinito: boolean;
  utilizzi_totali: number;
  ultimo_utilizzo?: string;
  descrizione?: string;
  autore?: string;
  note_versione?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateRenderData {
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

  // Dati servizio
  pacchetto_tipo: string;
  pacchetto_descrizione?: string;
  prezzo_mensile: number;
  numero_mesi?: number;
  prezzo_totale: number;
  durata_mesi?: number;

  // Dati documento
  numero_proforma?: string;
  numero_contratto?: string;
  data_emissione?: string;
  data_scadenza?: string;
  data_inizio_servizio?: string;
  data_scadenza_contratto?: string;

  // Dispositivo
  dispositivo_tipo?: string;
  dispositivo_modello?: string;
  dispositivo_imei?: string;
  spedizione_inclusa?: boolean;

  // Contatti emergenza
  contatto_emergenza_1?: string;
  contatto_emergenza_2?: string;
  medico_curante?: string;
  centro_medico_riferimento?: string;

  // Note e personalizzazioni
  note_aggiuntive?: string;
  note_mediche?: string;
  sconto_applicato?: number;
  sconto_descrizione?: string;

  // Firma
  data_firma?: string;

  [key: string]: any; // Per altre proprietà dinamiche
}

export class TemplateManager {
  private db: D1Database;

  constructor(database: D1Database) {
    this.db = database;
  }

  /**
   * Ottiene tutti i template disponibili
   */
  async getAllTemplates(): Promise<DocumentTemplate[]> {
    const result = await this.db
      .prepare(`
        SELECT 
          id, nome_template, tipo_documento, categoria, versione,
          html_template, css_styles, variabili_disponibili,
          formato_output, orientamento, formato_carta, margini,
          attivo, template_predefinito, utilizzi_totali,
          ultimo_utilizzo, descrizione, autore, note_versione,
          created_at, updated_at
        FROM document_templates 
        WHERE attivo = 1
        ORDER BY tipo_documento, categoria, nome_template
      `)
      .all();

    return result.results.map(this.parseTemplate);
  }

  /**
   * Ottiene un template specifico per tipo e categoria
   */
  async getTemplate(
    tipo_documento: string, 
    categoria: string = 'BASE'
  ): Promise<DocumentTemplate | null> {
    const result = await this.db
      .prepare(`
        SELECT 
          id, nome_template, tipo_documento, categoria, versione,
          html_template, css_styles, variabili_disponibili,
          formato_output, orientamento, formato_carta, margini,
          attivo, template_predefinito, utilizzi_totali,
          ultimo_utilizzo, descrizione, autore, note_versione,
          created_at, updated_at
        FROM document_templates 
        WHERE tipo_documento = ? AND categoria = ? AND attivo = 1
        ORDER BY template_predefinito DESC, versione DESC
        LIMIT 1
      `)
      .bind(tipo_documento, categoria)
      .first();

    return result ? this.parseTemplate(result) : null;
  }

  /**
   * Renderizza un template con i dati forniti
   */
  async renderTemplate(
    templateId: number | string, 
    data: TemplateRenderData
  ): Promise<string> {
    let template: DocumentTemplate | null;

    if (typeof templateId === 'number') {
      template = await this.getTemplateById(templateId);
    } else {
      // Se è una stringa, assume che sia nome_template
      template = await this.getTemplateByName(templateId);
    }

    if (!template) {
      throw new Error(`Template non trovato: ${templateId}`);
    }

    // Incrementa il contatore di utilizzi
    await this.incrementUsageCount(template.id);

    // Renderizza il template usando semplice sostituzione
    return this.processTemplate(template.html_template, data);
  }

  /**
   * Genera una proforma utilizzando il template appropriato
   */
  async generateProforma(
    leadData: any, 
    proformaData: any
  ): Promise<{ html: string; template_utilizzato: string }> {
    const categoria = proformaData.pacchetto_tipo || 'BASE';
    const template = await this.getTemplate('PROFORMA', categoria);

    if (!template) {
      throw new Error(`Template PROFORMA non trovato per categoria: ${categoria}`);
    }

    // Combina i dati del lead con quelli della proforma
    const renderData: TemplateRenderData = {
      // Dati cliente dal lead
      cliente_nome: leadData.nomeRichiedente || '',
      cliente_cognome: leadData.cognomeRichiedente || '',
      cliente_email: leadData.email || '',
      cliente_telefono: leadData.telefono || '',
      cliente_indirizzo: leadData.indirizzoIntestatario || '',
      cliente_codice_fiscale: leadData.cfIntestatario || '',

      // Dati assistito dal lead
      assistito_nome: leadData.nomeAssistito || '',
      assistito_cognome: leadData.cognomeAssistito || '',
      assistito_data_nascita: leadData.dataNascitaAssistito || '',
      assistito_parentela: leadData.parentelaAssistito || '',

      // Dati proforma
      numero_proforma: proformaData.numero_proforma || '',
      data_emissione: proformaData.data_emissione || new Date().toLocaleDateString('it-IT'),
      data_scadenza: proformaData.data_scadenza || '',
      pacchetto_tipo: proformaData.pacchetto_tipo || 'BASE',
      pacchetto_descrizione: this.getPackageDescription(proformaData.pacchetto_tipo || 'BASE'),
      prezzo_mensile: proformaData.prezzo_mensile || 0,
      numero_mesi: proformaData.numero_mesi || 12,
      prezzo_totale: proformaData.prezzo_totale || 0,
      dispositivo_tipo: proformaData.dispositivo_tipo || 'SiDLY Care Pro',
      spedizione_inclusa: proformaData.spedizione_inclusa !== false,
      sconto_applicato: proformaData.sconto_applicato || 0,
      sconto_descrizione: proformaData.sconto_descrizione || '',
      note_aggiuntive: proformaData.note_aggiuntive || '',

      // Dati aggiuntivi per completezza
      cliente_cap: proformaData.cliente_cap || '',
      cliente_citta: proformaData.cliente_citta || '',
      cliente_provincia: proformaData.cliente_provincia || ''
    };

    const html = await this.renderTemplate(template.id, renderData);
    
    return {
      html,
      template_utilizzato: template.nome_template
    };
  }

  /**
   * Genera un contratto utilizzando il template appropriato
   */
  async generateContract(
    leadData: any, 
    contractData: any
  ): Promise<{ html: string; template_utilizzato: string }> {
    const categoria = contractData.tipo_contratto || 'BASE';
    const template = await this.getTemplate('CONTRACT', categoria);

    if (!template) {
      throw new Error(`Template CONTRACT non trovato per categoria: ${categoria}`);
    }

    const renderData: TemplateRenderData = {
      // Dati cliente
      cliente_nome: contractData.cliente_nome || leadData.nomeRichiedente || '',
      cliente_cognome: contractData.cliente_cognome || leadData.cognomeRichiedente || '',
      cliente_email: contractData.cliente_email || leadData.email || '',
      cliente_telefono: contractData.cliente_telefono || leadData.telefono || '',
      cliente_indirizzo: contractData.cliente_indirizzo || leadData.indirizzoIntestatario || '',
      cliente_cap: contractData.cliente_cap || '',
      cliente_citta: contractData.cliente_citta || '',
      cliente_provincia: contractData.cliente_provincia || '',
      cliente_codice_fiscale: contractData.cliente_codice_fiscale || leadData.cfIntestatario || '',

      // Dati assistito
      assistito_nome: contractData.assistito_nome || leadData.nomeAssistito || '',
      assistito_cognome: contractData.assistito_cognome || leadData.cognomeAssistito || '',
      assistito_data_nascita: contractData.assistito_data_nascita || leadData.dataNascitaAssistito || '',
      assistito_codice_fiscale: contractData.assistito_codice_fiscale || leadData.cfAssistito || '',
      assistito_parentela: contractData.assistito_parentela || leadData.parentelaAssistito || '',

      // Dati contratto
      numero_contratto: contractData.numero_contratto || '',
      tipo_contratto: contractData.tipo_contratto || 'BASE',
      durata_mesi: contractData.durata_mesi || 12,
      prezzo_mensile: contractData.prezzo_mensile || 0,
      prezzo_totale: contractData.prezzo_totale || 0,
      data_inizio_servizio: contractData.data_inizio_servizio || new Date().toLocaleDateString('it-IT'),
      data_scadenza_contratto: contractData.data_scadenza_contratto || '',

      // Dispositivo
      dispositivo_modello: contractData.dispositivo_modello || 'SiDLY Care Pro',
      dispositivo_imei: contractData.dispositivo_imei || '',

      // Contatti emergenza
      contatto_emergenza_1: contractData.contatto_emergenza_1 || '',
      contatto_emergenza_2: contractData.contatto_emergenza_2 || '',
      medico_curante: contractData.medico_curante || '',
      centro_medico_riferimento: contractData.centro_medico_riferimento || '',

      // Note
      note_mediche: contractData.note_mediche || '',

      // Firma
      data_firma: new Date().toLocaleDateString('it-IT'),

      // Pacchetto
      pacchetto_tipo: contractData.tipo_contratto || 'BASE'
    };

    const html = await this.renderTemplate(template.id, renderData);
    
    return {
      html,
      template_utilizzato: template.nome_template
    };
  }

  /**
   * Metodi privati di supporto
   */
  private async getTemplateById(id: number): Promise<DocumentTemplate | null> {
    const result = await this.db
      .prepare(`SELECT * FROM document_templates WHERE id = ? AND attivo = 1`)
      .bind(id)
      .first();

    return result ? this.parseTemplate(result) : null;
  }

  private async getTemplateByName(name: string): Promise<DocumentTemplate | null> {
    const result = await this.db
      .prepare(`SELECT * FROM document_templates WHERE nome_template = ? AND attivo = 1`)
      .bind(name)
      .first();

    return result ? this.parseTemplate(result) : null;
  }

  private async incrementUsageCount(templateId: number): Promise<void> {
    await this.db
      .prepare(`
        UPDATE document_templates 
        SET utilizzi_totali = utilizzi_totali + 1, 
            ultimo_utilizzo = CURRENT_TIMESTAMP 
        WHERE id = ?
      `)
      .bind(templateId)
      .run();
  }

  private parseTemplate(row: any): DocumentTemplate {
    return {
      id: row.id,
      nome_template: row.nome_template,
      tipo_documento: row.tipo_documento,
      categoria: row.categoria,
      versione: row.versione,
      html_template: row.html_template,
      css_styles: row.css_styles,
      variabili_disponibili: row.variabili_disponibili ? JSON.parse(row.variabili_disponibili) : [],
      formato_output: row.formato_output,
      orientamento: row.orientamento,
      formato_carta: row.formato_carta,
      margini: row.margini ? JSON.parse(row.margini) : { top: 20, bottom: 20, left: 20, right: 20 },
      attivo: Boolean(row.attivo),
      template_predefinito: Boolean(row.template_predefinito),
      utilizzi_totali: row.utilizzi_totali || 0,
      ultimo_utilizzo: row.ultimo_utilizzo,
      descrizione: row.descrizione,
      autore: row.autore,
      note_versione: row.note_versione,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private processTemplate(template: string, data: TemplateRenderData): string {
    let processed = template;

    // Sostituzione semplice delle variabili {{variabile}}
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        // Sostituisce sia {{key}} che {{key|default}}
        const regex = new RegExp(`{{\\s*${key}(\\|[^}]*)?\\s*}}`, 'g');
        processed = processed.replace(regex, String(value));
      }
    });

    // Gestione delle sezioni condizionali {{#variabile}}...{{/variabile}}
    processed = this.processConditionalSections(processed, data);

    // Rimuove eventuali variabili non sostituite
    processed = processed.replace(/{{[^}]*}}/g, '');

    return processed;
  }

  private processConditionalSections(template: string, data: TemplateRenderData): string {
    let processed = template;
    
    // Pattern per sezioni condizionali: {{#variable}}content{{/variable}}
    const conditionalRegex = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
    
    processed = processed.replace(conditionalRegex, (match, variable, content) => {
      const value = data[variable];
      // Mostra il contenuto solo se la variabile esiste ed è truthy
      if (value && value !== '' && value !== '0') {
        return content;
      }
      return '';
    });

    return processed;
  }

  private getPackageDescription(tipo: string): string {
    const descriptions = {
      'BASE': 'Monitoraggio continuo 24/7, assistenza telefonica, dispositivo SiDLY Care Pro',
      'AVANZATO': 'Servizio BASE + consulenze mediche, analisi approfondite, report personalizzati',
      'PREMIUM': 'Servizio AVANZATO + visite domiciliari, medico dedicato, priorità massima'
    };
    
    return descriptions[tipo as keyof typeof descriptions] || descriptions.BASE;
  }
}

export default TemplateManager;