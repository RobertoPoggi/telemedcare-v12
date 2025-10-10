/**
 * TELEMEDCARE V11.0 MODULARE
 * =================================
 * 
 * LEAD_REPORTS.TS - Business Intelligence e Dashboard Analytics
 * 
 * ✨ FUNZIONALITÀ ENTERPRISE:
 * • Real-time analytics con KPI business intelligence
 * • Dashboard interattive per management e operatori
 * • Report automatizzati con export Excel/PDF
 * • Analisi predittive ROI e performance partner
 * • Heatmap geografiche e segmentazione demografica
 * • Funnel analysis e conversion tracking avanzato
 * • Alert intelligenti e notifiche proattive
 * • Benchmark competitor e analisi mercato
 * 
 * 🎯 PERFORMANCE TARGET:
 * • Query real-time: <200ms
 * • Report generation: <5s
 * • Dashboard refresh: <1s
 * • Data retention: 24 mesi
 * • Concurrent users: 100+
 * 
 * @version 11.0-ENTERPRISE
 * @author TeleMedCare Development Team
 * @date 2024-10-03
 */

export interface KPIMetrics {
  // ===== METRICHE CORE BUSINESS =====
  leadsTotali: number;
  leadsOggi: number;
  conversionRate: number;        // % Lead → Assistiti
  revenueTotale: number;         // € fatturato
  revenueProiettato: number;     // € proiezione mensile
  
  // ===== PERFORMANCE OPERATIVA =====
  tempoRispostaMedia: number;    // Minuti risposta media
  tassoContatto: number;         // % lead contattati
  tassoChiusura: number;         // % contratti firmati
  scoreMedio: number;            // Score qualità lead medio
  
  // ===== ANALISI PARTNER =====
  partnerAttivi: number;
  leadPerPartner: Record<string, number>;
  roiPerPartner: Record<string, number>;
  qualitaPerPartner: Record<string, number>;
  
  // ===== TREND TEMPORALI =====
  crescitaSettimanale: number;   // % crescita lead ultima settimana
  crescitaMensile: number;       // % crescita lead ultimo mese
  stagionalita: Record<string, number>; // Andamento per mese
  
  // ===== SEGMENTAZIONE =====
  distribuzioneScore: Record<'HOT' | 'WARM' | 'COLD', number>;
  distribuzioneDemografica: Record<string, number>;
  distribuzioneGeografica: Record<string, number>;
  
  // ===== METADATA =====
  ultimoAggiornamento: Date;
  periodoAnalisi: {
    dataInizio: Date;
    dataFine: Date;
  };
}

export interface DashboardWidget {
  id: string;
  titolo: string;
  tipo: 'chart' | 'number' | 'table' | 'heatmap' | 'funnel';
  dati: any;
  configurazione: {
    refresh: number;              // Secondi auto-refresh
    altezza: number;              // Pixel altezza widget
    responsive: boolean;
    esportabile: boolean;
  };
  permessi: string[];             // Ruoli autorizzati
}

export interface ReportTemplate {
  id: string;
  nome: string;
  descrizione: string;
  categoria: 'operativo' | 'strategico' | 'compliance' | 'partner';
  frequenza: 'real-time' | 'giornaliero' | 'settimanale' | 'mensile';
  
  // ===== CONFIGURAZIONE REPORT =====
  parametri: {
    periodoDefault: number;       // Giorni default
    filtriDisponibili: string[];  // Filtri applicabili
    formatOutput: 'pdf' | 'excel' | 'json' | 'csv';
    schedualzione?: {
      orario: string;             // HH:MM formato
      destinatari: string[];      // Email destinatari
      giorniSettimana?: number[]; // 1=Lun, 7=Dom
    };
  };
  
  // ===== SEZIONI REPORT =====
  sezioni: Array<{
    titolo: string;
    query: string;                // Query dati o function name
    visualizzazione: 'table' | 'chart' | 'text' | 'image';
    configurazione: any;
  }>;
  
  dataCreazione: Date;
  ultimoUtilizzo: Date;
  utilizzi: number;
}

export interface AnalyticsQuery {
  nome: string;
  sql: string;
  parametri: Record<string, any>;
  cache: {
    enabled: boolean;
    ttl: number;                  // Secondi TTL cache
  };
  performance: {
    tempoEsecuzione: number;      // Millisecondi ultima esecuzione
    utilizzi: number;
    ultimoUtilizzo: Date;
  };
}

export interface AlertRule {
  id: string;
  nome: string;
  descrizione: string;
  
  // ===== CONDIZIONI TRIGGER =====
  condizione: {
    metrica: string;              // Nome KPI da monitorare
    operatore: '>' | '<' | '=' | '>=' | '<=' | '!=' | 'trend';
    valore: number;
    periodo: number;              // Minuti per valutazione
  };
  
  // ===== CONFIGURAZIONE ALERT =====
  severita: 'info' | 'warning' | 'critical';
  azioni: Array<{
    tipo: 'email' | 'sms' | 'webhook' | 'dashboard';
    destinatari: string[];
    template: string;
    parametri?: Record<string, any>;
  }>;
  
  // ===== STATO E PERFORMANCE =====
  attivo: boolean;
  ultimoTrigger?: Date;
  triggerCount: number;
  falsePositives: number;
  
  dataCreazione: Date;
  createdBy: string;
}

export interface ExportOptions {
  formato: 'pdf' | 'excel' | 'csv' | 'json';
  dati: any[];
  template?: string;
  
  // ===== CONFIGURAZIONE EXPORT =====
  opzioni: {
    includiGrafici: boolean;
    includiMetadata: boolean;
    compressione: boolean;
    password?: string;
    watermark?: string;
  };
  
  // ===== PERSONALIZZAZIONE =====
  layout: {
    orientamento: 'portrait' | 'landscape';
    margini: number;
    header?: string;
    footer?: string;
    logo?: string;
  };
}

export class TeleMedCareReports {
  private _queryCache?: Map<string, {data: any, timestamp: number, ttl: number}>;
  private _alertsAttivi?: Map<string, AlertRule>;
  private _dashboardWidgets?: Map<string, DashboardWidget>;
  
  private get queryCache() {
    if (!this._queryCache) {
      this._queryCache = new Map<string, {data: any, timestamp: number, ttl: number}>();
    }
    return this._queryCache;
  }
  
  private get alertsAttivi() {
    if (!this._alertsAttivi) {
      this._alertsAttivi = new Map<string, AlertRule>();
    }
    return this._alertsAttivi;
  }
  
  private get dashboardWidgets() {
    if (!this._dashboardWidgets) {
      this._dashboardWidgets = new Map<string, DashboardWidget>();
    }
    return this._dashboardWidgets;
  }
  
  constructor() {
    this.inizializzaDashboardDefault();
    this.inizializzaAlertsDefault();
  }

  // ===================================
  // 📊 KPI METRICS E ANALYTICS CORE
  // ===================================
  
  /**
   * Calcola KPI completi real-time
   * Ottimizzato per performance con caching intelligente
   */
  async calcolaKPICompleti(
    dataInizio: Date,
    dataFine: Date,
    filtri?: Record<string, any>
  ): Promise<KPIMetrics> {
    try {
      console.log(`📊 [REPORTS] Calcolando KPI per periodo ${dataInizio.toISOString().split('T')[0]} - ${dataFine.toISOString().split('T')[0]}`);
      
      const cacheKey = `kpi_${dataInizio.getTime()}_${dataFine.getTime()}_${JSON.stringify(filtri || {})}`;
      
      // Verifica cache (TTL: 5 minuti per KPI real-time)
      const cached = this.queryCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < (5 * 60 * 1000)) {
        console.log(`📋 [CACHE] KPI trovati in cache`);
        return cached.data;
      }
      
      // 1. METRICHE CORE BUSINESS (queries parallele per performance)
      const [
        leadsTotali,
        leadsOggi, 
        conversioni,
        fatturato,
        tempiRisposta,
        contatti,
        contratti,
        scores
      ] = await Promise.all([
        this.queryLeadsTotali(dataInizio, dataFine, filtri),
        this.queryLeadsOggi(),
        this.queryConversioni(dataInizio, dataFine, filtri),
        this.queryFatturato(dataInizio, dataFine, filtri),
        this.queryTempiRisposta(dataInizio, dataFine, filtri),
        this.queryContatti(dataInizio, dataFine, filtri),
        this.queryContratti(dataInizio, dataFine, filtri),
        this.queryScores(dataInizio, dataFine, filtri)
      ]);
      
      // 2. CALCOLI DERIVATI
      const conversionRate = leadsTotali > 0 ? (conversioni / leadsTotali) * 100 : 0;
      const tassoContatto = leadsTotali > 0 ? (contatti / leadsTotali) * 100 : 0;
      const tassoChiusura = contatti > 0 ? (contratti / contatti) * 100 : 0;
      
      // 3. PROIEZIONI E TREND
      const giorniPeriodo = Math.ceil((dataFine.getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24));
      const revenueGiornaliero = fatturato / giorniPeriodo;
      const giorniMese = 30;
      const revenueProiettato = revenueGiornaliero * giorniMese;
      
      // 4. ANALISI PARTNER (query batch ottimizzata)
      const analisiPartner = await this.calcolaAnalisiPartner(dataInizio, dataFine, filtri);
      
      // 5. TREND TEMPORALI
      const trend = await this.calcolaTrendTemporali(dataInizio, dataFine);
      
      // 6. SEGMENTAZIONI
      const segmentazioni = await this.calcolaSegmentazioni(dataInizio, dataFine, filtri);
      
      // 7. ASSEMBLAGGIO RISULTATO FINALE
      const kpi: KPIMetrics = {
        // Core business
        leadsTotali,
        leadsOggi,
        conversionRate: Math.round(conversionRate * 100) / 100,
        revenueTotale: fatturato,
        revenueProiettato: Math.round(revenueProiettato),
        
        // Performance operativa
        tempoRispostaMedia: Math.round(tempiRisposta),
        tassoContatto: Math.round(tassoContatto * 100) / 100,
        tassoChiusura: Math.round(tassoChiusura * 100) / 100,
        scoreMedio: Math.round(scores * 100) / 100,
        
        // Partner analysis
        partnerAttivi: analisiPartner.partnerAttivi,
        leadPerPartner: analisiPartner.leadPerPartner,
        roiPerPartner: analisiPartner.roiPerPartner,
        qualitaPerPartner: analisiPartner.qualitaPerPartner,
        
        // Trend
        crescitaSettimanale: trend.settimanale,
        crescitaMensile: trend.mensile,
        stagionalita: trend.stagionalita,
        
        // Segmentazioni
        distribuzioneScore: segmentazioni.score,
        distribuzioneDemografica: segmentazioni.demografica,
        distribuzioneGeografica: segmentazioni.geografica,
        
        // Metadata
        ultimoAggiornamento: new Date(),
        periodoAnalisi: {
          dataInizio,
          dataFine
        }
      };
      
      // 8. SALVATAGGIO IN CACHE
      this.queryCache.set(cacheKey, {
        data: kpi,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000 // 5 minuti
      });
      
      console.log(`✅ [REPORTS] KPI calcolati - Leads: ${leadsTotali}, Conversion: ${conversionRate.toFixed(2)}%`);
      return kpi;
      
    } catch (error) {
      console.error(`❌ [REPORTS] Errore calcolo KPI:`, error);
      throw new Error(`Impossibile calcolare KPI: ${error}`);
    }
  }

  // ===================================
  // 🔍 QUERY HELPERS OTTIMIZZATE
  // ===================================
  
  private async queryLeadsTotali(dataInizio: Date, dataFine: Date, filtri?: Record<string, any>): Promise<number> {
    // Simulazione query database - In produzione: query D1
    const baseCount = 1500;
    const giorniPeriodo = Math.ceil((dataFine.getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24));
    const leadGiornalieri = Math.floor(Math.random() * 50) + 30; // 30-80 lead/giorno
    
    return Math.min(baseCount, leadGiornalieri * giorniPeriodo);
  }
  
  private async queryLeadsOggi(): Promise<number> {
    // Lead odierni (simulazione real-time)
    const now = new Date();
    const hour = now.getHours();
    
    // Distribuzione realistica oraria: picco 10-16
    let leadOrari: Record<number, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 2, 8: 5, 9: 8,
      10: 12, 11: 15, 12: 10, 13: 8, 14: 18, 15: 22, 16: 20, 17: 15,
      18: 12, 19: 8, 20: 5, 21: 3, 22: 2, 23: 1
    };
    
    let leadAccumulati = 0;
    for (let h = 0; h <= hour; h++) {
      leadAccumulati += leadOrari[h] + Math.floor(Math.random() * 3); // Variazione casuale
    }
    
    return leadAccumulati;
  }
  
  private async queryConversioni(dataInizio: Date, dataFine: Date, filtri?: Record<string, any>): Promise<number> {
    const leadsTotali = await this.queryLeadsTotali(dataInizio, dataFine, filtri);
    
    // Conversion rate realistico: 12-18% per TeleMedicine
    const conversionRate = 0.14 + (Math.random() * 0.04); // 14%-18%
    
    return Math.floor(leadsTotali * conversionRate);
  }
  
  private async queryFatturato(dataInizio: Date, dataFine: Date, filtri?: Record<string, any>): Promise<number> {
    const conversioni = await this.queryConversioni(dataInizio, dataFine, filtri);
    
    // Prezzo medio SiDLY Care Pro: €299 + variazioni
    const prezzoMedio = 299 + (Math.random() * 100); // €299-399 medio
    
    return Math.round(conversioni * prezzoMedio);
  }
  
  private async queryTempiRisposta(dataInizio: Date, dataFine: Date, filtri?: Record<string, any>): Promise<number> {
    // Tempo risposta medio simulato: 45-120 minuti
    return 45 + Math.floor(Math.random() * 75);
  }
  
  private async queryContatti(dataInizio: Date, dataFine: Date, filtri?: Record<string, any>): Promise<number> {
    const leadsTotali = await this.queryLeadsTotali(dataInizio, dataFine, filtri);
    
    // Tasso contatto realistico: 75-85%
    const tassoContatto = 0.75 + (Math.random() * 0.1);
    
    return Math.floor(leadsTotali * tassoContatto);
  }
  
  private async queryContratti(dataInizio: Date, dataFine: Date, filtri?: Record<string, any>): Promise<number> {
    const contatti = await this.queryContatti(dataInizio, dataFine, filtri);
    
    // Tasso chiusura post-contatto: 18-25%
    const tassoChiusura = 0.18 + (Math.random() * 0.07);
    
    return Math.floor(contatti * tassoChiusura);
  }
  
  private async queryScores(dataInizio: Date, dataFine: Date, filtri?: Record<string, any>): Promise<number> {
    // Score medio simulato: 55-75 (range realistico)
    return 55 + Math.floor(Math.random() * 20);
  }

  // ===================================
  // 🤝 ANALISI PARTNER AVANZATE  
  // ===================================
  
  private async calcolaAnalisiPartner(dataInizio: Date, dataFine: Date, filtri?: Record<string, any>): Promise<{
    partnerAttivi: number;
    leadPerPartner: Record<string, number>;
    roiPerPartner: Record<string, number>;
    qualitaPerPartner: Record<string, number>;
  }> {
    
    // Simulazione dati realistici partner TeleMedCare
    const partners = ['IRBEMA', 'AON', 'MONDADORI', 'ENDERED', 'CORPORATE', 'WEB_DIRECT'];
    
    const leadPerPartner: Record<string, number> = {};
    const roiPerPartner: Record<string, number> = {};
    const qualitaPerPartner: Record<string, number> = {};
    
    partners.forEach(partner => {
      // Distribuzione realistica per partner
      switch (partner) {
        case 'IRBEMA':
          leadPerPartner[partner] = 450 + Math.floor(Math.random() * 100); // Partner premium
          roiPerPartner[partner] = 3.2 + (Math.random() * 0.8); // ROI alto
          qualitaPerPartner[partner] = 75 + Math.floor(Math.random() * 15); // Qualità alta
          break;
        case 'AON':
          leadPerPartner[partner] = 320 + Math.floor(Math.random() * 80);
          roiPerPartner[partner] = 2.8 + (Math.random() * 0.6);
          qualitaPerPartner[partner] = 70 + Math.floor(Math.random() * 12);
          break;
        case 'MONDADORI':
          leadPerPartner[partner] = 180 + Math.floor(Math.random() * 60);
          roiPerPartner[partner] = 2.1 + (Math.random() * 0.5);
          qualitaPerPartner[partner] = 60 + Math.floor(Math.random() * 15);
          break;
        case 'ENDERED':
          leadPerPartner[partner] = 220 + Math.floor(Math.random() * 70);
          roiPerPartner[partner] = 2.4 + (Math.random() * 0.6);
          qualitaPerPartner[partner] = 65 + Math.floor(Math.random() * 12);
          break;
        case 'CORPORATE':
          leadPerPartner[partner] = 150 + Math.floor(Math.random() * 50);
          roiPerPartner[partner] = 4.1 + (Math.random() * 0.9); // ROI altissimo corporate
          qualitaPerPartner[partner] = 85 + Math.floor(Math.random() * 10); // Qualità premium
          break;
        case 'WEB_DIRECT':
          leadPerPartner[partner] = 280 + Math.floor(Math.random() * 90);
          roiPerPartner[partner] = 1.8 + (Math.random() * 0.4); // ROI più basso (costi marketing)
          qualitaPerPartner[partner] = 50 + Math.floor(Math.random() * 20);
          break;
      }
    });
    
    return {
      partnerAttivi: partners.length,
      leadPerPartner,
      roiPerPartner,
      qualitaPerPartner
    };
  }

  // ===================================
  // 📈 TREND E STAGIONALITÀ
  // ===================================
  
  private async calcolaTrendTemporali(dataInizio: Date, dataFine: Date): Promise<{
    settimanale: number;
    mensile: number;
    stagionalita: Record<string, number>;
  }> {
    
    // Simulazione trend realistici
    const crescitaSettimanale = -2 + (Math.random() * 10); // -2% a +8% settimanale
    const crescitaMensile = 5 + (Math.random() * 15); // 5% a 20% mensile
    
    // Stagionalità TeleMedicine (picchi inverno/primavera)
    const stagionalita: Record<string, number> = {
      'Gennaio': 120,     // Picco post-feste
      'Febbraio': 115,    // Inverno alto
      'Marzo': 110,       // Primavera
      'Aprile': 105,      // Stabile
      'Maggio': 95,       // Leggero calo
      'Giugno': 85,       // Estate bassa
      'Luglio': 75,       // Vacanze estive
      'Agosto': 70,       // Minimo annuale
      'Settembre': 100,   // Ripresa
      'Ottobre': 110,     // Autunno attivo
      'Novembre': 125,    // Pre-inverno picco
      'Dicembre': 105     // Fine anno
    };
    
    return {
      settimanale: Math.round(crescitaSettimanale * 100) / 100,
      mensile: Math.round(crescitaMensile * 100) / 100,
      stagionalita
    };
  }

  // ===================================
  // 🎯 SEGMENTAZIONI AVANZATE
  // ===================================
  
  private async calcolaSegmentazioni(dataInizio: Date, dataFine: Date, filtri?: Record<string, any>): Promise<{
    score: Record<'HOT' | 'WARM' | 'COLD', number>;
    demografica: Record<string, number>;
    geografica: Record<string, number>;
  }> {
    
    // Distribuzione score realistica (piramide qualità)
    const score: Record<'HOT' | 'WARM' | 'COLD', number> = {
      'HOT': 15 + Math.floor(Math.random() * 10),   // 15-25% HOT
      'WARM': 45 + Math.floor(Math.random() * 15),  // 45-60% WARM  
      'COLD': 25 + Math.floor(Math.random() * 15)   // 25-40% COLD
    };
    
    // Distribuzione demografica (target TeleMedicine)
    const demografica: Record<string, number> = {
      '18-30': 8,   // Giovani: 8%
      '31-45': 25,  // Adulti: 25%
      '46-60': 35,  // Target principale: 35%
      '61-75': 28,  // Senior attivi: 28%
      '76+': 4      // Grandi anziani: 4%
    };
    
    // Distribuzione geografica (macro-regioni Italia)
    const geografica: Record<string, number> = {
      'Nord-Ovest': 28,  // Lombardia, Piemonte, etc.
      'Nord-Est': 22,    // Veneto, Emilia-Romagna, etc.
      'Centro': 25,      // Lazio, Toscana, etc.
      'Sud': 18,         // Campania, Puglia, etc.
      'Isole': 7         // Sicilia, Sardegna
    };
    
    return { score, demografica, geografica };
  }

  // ===================================
  // 📱 DASHBOARD MANAGEMENT
  // ===================================
  
  private inizializzaDashboardDefault(): void {
    // Widget KPI Summary
    this.dashboardWidgets.set('kpi-summary', {
      id: 'kpi-summary',
      titolo: 'KPI Summary Real-time',
      tipo: 'number',
      dati: {},
      configurazione: {
        refresh: 30, // 30 secondi
        altezza: 200,
        responsive: true,
        esportabile: true
      },
      permessi: ['admin', 'manager', 'operatore']
    });
    
    // Widget Conversion Funnel
    this.dashboardWidgets.set('conversion-funnel', {
      id: 'conversion-funnel',
      titolo: 'Funnel Conversione Lead→Assistiti',
      tipo: 'funnel',
      dati: {},
      configurazione: {
        refresh: 300, // 5 minuti
        altezza: 400,
        responsive: true,
        esportabile: true
      },
      permessi: ['admin', 'manager']
    });
    
    // Widget Partner Performance
    this.dashboardWidgets.set('partner-performance', {
      id: 'partner-performance',
      titolo: 'Performance Partner (ROI & Volume)',
      tipo: 'chart',
      dati: {},
      configurazione: {
        refresh: 600, // 10 minuti
        altezza: 350,
        responsive: true,
        esportabile: true
      },
      permessi: ['admin', 'manager', 'partner']
    });
    
    // Widget Geographic Heatmap
    this.dashboardWidgets.set('geo-heatmap', {
      id: 'geo-heatmap',
      titolo: 'Distribuzione Geografica Lead',
      tipo: 'heatmap',
      dati: {},
      configurazione: {
        refresh: 1800, // 30 minuti
        altezza: 500,
        responsive: true,
        esportabile: false
      },
      permessi: ['admin', 'manager']
    });
    
    // Widget Alerts Monitor
    this.dashboardWidgets.set('alerts-monitor', {
      id: 'alerts-monitor',
      titolo: 'Monitor Alerts e Notifiche',
      tipo: 'table',
      dati: {},
      configurazione: {
        refresh: 60, // 1 minuto
        altezza: 300,
        responsive: true,
        esportabile: false
      },
      permessi: ['admin', 'operatore']
    });
    
    console.log(`📊 [DASHBOARD] Inizializzati ${this.dashboardWidgets.size} widget default`);
  }
  
  /**
   * Genera dati real-time per dashboard widget specifico
   */
  async generaDatiWidget(widgetId: string, parametri?: Record<string, any>): Promise<any> {
    try {
      const widget = this.dashboardWidgets.get(widgetId);
      if (!widget) {
        throw new Error(`Widget ${widgetId} non trovato`);
      }
      
      console.log(`📊 [WIDGET] Generando dati per ${widget.titolo}`);
      
      switch (widgetId) {
        case 'kpi-summary':
          return await this.generaDatiKPISummary(parametri);
          
        case 'conversion-funnel':
          return await this.generaDatiConversionFunnel(parametri);
          
        case 'partner-performance':
          return await this.generaDatiPartnerPerformance(parametri);
          
        case 'geo-heatmap':
          return await this.generaDatiGeoHeatmap(parametri);
          
        case 'alerts-monitor':
          return await this.generaDatiAlertsMonitor(parametri);
          
        default:
          throw new Error(`Generatore dati non implementato per widget ${widgetId}`);
      }
      
    } catch (error) {
      console.error(`❌ [WIDGET] Errore generazione dati per ${widgetId}:`, error);
      throw error;
    }
  }
  
  private async generaDatiKPISummary(parametri?: Record<string, any>): Promise<any> {
    const dataFine = new Date();
    const dataInizio = new Date(dataFine.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 giorni
    
    const kpi = await this.calcolaKPICompleti(dataInizio, dataFine);
    
    return {
      leadsTotali: {
        valore: kpi.leadsTotali,
        variazione: '+' + kpi.crescitaSettimanale.toFixed(1) + '%',
        trend: kpi.crescitaSettimanale > 0 ? 'up' : 'down'
      },
      conversionRate: {
        valore: kpi.conversionRate.toFixed(2) + '%',
        variazione: '+2.3%', // Simulato
        trend: 'up'
      },
      revenueTotale: {
        valore: '€' + kpi.revenueTotale.toLocaleString(),
        variazione: '+' + ((kpi.revenueProiettato / kpi.revenueTotale - 1) * 100).toFixed(1) + '%',
        trend: 'up'
      },
      leadsOggi: {
        valore: kpi.leadsOggi,
        variazione: 'Real-time',
        trend: 'neutral'
      },
      scoreMedio: {
        valore: kpi.scoreMedio.toFixed(1),
        variazione: '+1.2pt', // Simulato
        trend: 'up'
      },
      tempoRisposta: {
        valore: kpi.tempoRispostaMedia + 'm',
        variazione: '-15m', // Simulato
        trend: 'up' // Miglioramento = up
      }
    };
  }
  
  private async generaDatiConversionFunnel(parametri?: Record<string, any>): Promise<any> {
    const dataFine = new Date();
    const dataInizio = new Date(dataFine.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 giorni
    
    const kpi = await this.calcolaKPICompleti(dataInizio, dataFine);
    
    const leadsTotali = kpi.leadsTotali;
    const contatti = Math.floor(leadsTotali * (kpi.tassoContatto / 100));
    const conversioni = Math.floor(leadsTotali * (kpi.conversionRate / 100));
    const contratti = Math.floor(contatti * (kpi.tassoChiusura / 100));
    
    return {
      steps: [
        {
          nome: 'Lead Acquisiti',
          valore: leadsTotali,
          percentuale: 100,
          colore: '#3B82F6'
        },
        {
          nome: 'Lead Contattati', 
          valore: contatti,
          percentuale: Math.round((contatti / leadsTotali) * 100),
          colore: '#10B981'
        },
        {
          nome: 'Interessati',
          valore: conversioni,
          percentuale: Math.round((conversioni / leadsTotali) * 100),
          colore: '#F59E0B'
        },
        {
          nome: 'Contratti Firmati',
          valore: contratti,
          percentuale: Math.round((contratti / leadsTotali) * 100),
          colore: '#EF4444'
        }
      ],
      metriche: {
        dropOffMaggiore: 'Lead→Contatti: -' + (100 - Math.round((contatti / leadsTotali) * 100)) + '%',
        conversione: kpi.conversionRate.toFixed(2) + '%',
        efficacia: contratti > (leadsTotali * 0.12) ? 'Ottima' : 'Buona'
      }
    };
  }
  
  private async generaDatiPartnerPerformance(parametri?: Record<string, any>): Promise<any> {
    const dataFine = new Date();
    const dataInizio = new Date(dataFine.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const kpi = await this.calcolaKPICompleti(dataInizio, dataFine);
    
    const chartData = Object.keys(kpi.leadPerPartner).map(partner => ({
      partner,
      lead: kpi.leadPerPartner[partner],
      roi: kpi.roiPerPartner[partner].toFixed(2),
      qualita: kpi.qualitaPerPartner[partner],
      revenue: Math.round(kpi.leadPerPartner[partner] * kpi.roiPerPartner[partner] * 299)
    }));
    
    return {
      chartType: 'bubble', // Bubble chart: X=Lead, Y=ROI, Size=Revenue
      data: chartData,
      assi: {
        x: { label: 'Volume Lead', min: 0 },
        y: { label: 'ROI', min: 0, max: 5 },
        size: { label: 'Revenue €', scale: 'linear' }
      },
      top3: chartData
        .sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi))
        .slice(0, 3)
        .map(p => ({
          partner: p.partner,
          roi: p.roi + 'x',
          badge: p.roi > '3.0' ? 'Eccellente' : p.roi > '2.0' ? 'Buono' : 'Sufficiente'
        }))
    };
  }
  
  private async generaDatiGeoHeatmap(parametri?: Record<string, any>): Promise<any> {
    const kpi = await this.calcolaKPICompleti(new Date(Date.now() - 30*24*60*60*1000), new Date());
    
    // Mappa province italiane con dati simulati realistici
    const provincie = [
      // Nord-Ovest (Milano, Torino cluster)
      { nome: 'Milano', lat: 45.4642, lng: 9.1900, lead: 450, score: 78, regione: 'Lombardia' },
      { nome: 'Torino', lat: 45.0703, lng: 7.6869, lead: 280, score: 72, regione: 'Piemonte' },
      { nome: 'Genova', lat: 44.4056, lng: 8.9463, lead: 180, score: 69, regione: 'Liguria' },
      
      // Nord-Est (Veneto, Emilia cluster)
      { nome: 'Venezia', lat: 45.4408, lng: 12.3155, lead: 220, score: 71, regione: 'Veneto' },
      { nome: 'Bologna', lat: 44.4949, lng: 11.3426, lead: 320, score: 75, regione: 'Emilia-Romagna' },
      { nome: 'Verona', lat: 45.4384, lng: 10.9916, lead: 190, score: 68, regione: 'Veneto' },
      
      // Centro (Roma cluster principale)
      { nome: 'Roma', lat: 41.9028, lng: 12.4964, lead: 520, score: 76, regione: 'Lazio' },
      { nome: 'Firenze', lat: 43.7696, lng: 11.2558, lead: 250, score: 73, regione: 'Toscana' },
      { nome: 'Ancona', lat: 43.6047, lng: 13.5186, lead: 120, score: 65, regione: 'Marche' },
      
      // Sud
      { nome: 'Napoli', lat: 40.8518, lng: 14.2681, lead: 380, score: 67, regione: 'Campania' },
      { nome: 'Bari', lat: 41.1171, lng: 16.8719, lead: 190, score: 64, regione: 'Puglia' },
      { nome: 'Catania', lat: 37.5079, lng: 15.0830, lead: 150, score: 62, regione: 'Sicilia' }
    ];
    
    return {
      type: 'heatmap',
      center: { lat: 42.5, lng: 12.5 }, // Centro Italia
      zoom: 6,
      punti: provincie.map(p => ({
        ...p,
        intensita: p.lead / 520, // Normalizzato su Roma (max)
        colore: p.score > 75 ? '#10B981' : p.score > 70 ? '#F59E0B' : '#EF4444',
        popup: {
          titolo: p.nome + ' (' + p.regione + ')',
          lead: p.lead,
          score: p.score,
          trend: Math.random() > 0.5 ? 'up' : 'down'
        }
      })),
      legenda: {
        'Verde': 'Score > 75 (Eccellente)',
        'Giallo': 'Score 70-75 (Buono)', 
        'Rosso': 'Score < 70 (Da migliorare)'
      },
      statistiche: {
        provincieAttive: provincie.length,
        leadTotali: provincie.reduce((sum, p) => sum + p.lead, 0),
        scoreMediaNazionale: Math.round(provincie.reduce((sum, p) => sum + p.score, 0) / provincie.length)
      }
    };
  }
  
  private async generaDatiAlertsMonitor(parametri?: Record<string, any>): Promise<any> {
    const alertsAttivi = Array.from(this.alertsAttivi.values());
    
    // Simulazione alerts recent
    const alertsRecenti = [
      {
        id: 'alert_001',
        severita: 'warning',
        messaggio: 'Conversion rate sotto soglia (11.2% vs 15% target)',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min fa
        stato: 'attivo',
        azioni: ['Email inviata a manager', 'Dashboard evidenziata']
      },
      {
        id: 'alert_002', 
        severita: 'info',
        messaggio: 'Picco lead da partner IRBEMA (+35% vs media)',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min fa
        stato: 'risolto',
        azioni: ['Capacità allocata', 'Team notificato']
      },
      {
        id: 'alert_003',
        severita: 'critical',
        messaggio: 'Tempo risposta elevato (>120min vs <60min SLA)',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 ore fa
        stato: 'in_corso',
        azioni: ['Escalation manager', 'Risorse aggiuntive']
      }
    ];
    
    return {
      alertsAttivi: alertsAttivi.length,
      alertsUltima24h: alertsRecenti.length + 12, // Simulato
      severityBreakdown: {
        critical: 1,
        warning: 3,
        info: 8
      },
      alertsRecenti: alertsRecenti.map(alert => ({
        ...alert,
        timestampFormatted: this.formatTimeAgo(alert.timestamp),
        severityBadge: this.getSeverityBadge(alert.severita),
        statusBadge: this.getStatusBadge(alert.stato)
      })),
      tempoRisoluzioneMedia: '24 minuti',
      alertsRicorrenti: [
        { pattern: 'Conversion rate bassa', frequenza: 15, trend: 'decreasing' },
        { pattern: 'Picco lead serali', frequenza: 8, trend: 'stable' }
      ]
    };
  }

  // ===================================
  // 🚨 ALERT SYSTEM INTELLIGENTE
  // ===================================
  
  private inizializzaAlertsDefault(): void {
    // Alert Conversion Rate Critico
    this.alertsAttivi.set('conv-rate-critical', {
      id: 'conv-rate-critical',
      nome: 'Conversion Rate Critico',
      descrizione: 'Alert quando conversion rate scende sotto 10%',
      condizione: {
        metrica: 'conversionRate',
        operatore: '<',
        valore: 10,
        periodo: 60 // 1 ora
      },
      severita: 'critical',
      azioni: [
        {
          tipo: 'email',
          destinatari: ['manager@telemedcare.it', 'operations@telemedcare.it'],
          template: 'conversion_critical',
          parametri: { escalation: true }
        },
        {
          tipo: 'sms',
          destinatari: ['+393331234567'], // Manager reperibilità
          template: 'sms_alert',
          parametri: { urgenza: 'alta' }
        }
      ],
      attivo: true,
      ultimoTrigger: undefined,
      triggerCount: 0,
      falsePositives: 0,
      dataCreazione: new Date(),
      createdBy: 'system'
    });
    
    // Alert Lead Volume Spike
    this.alertsAttivi.set('lead-volume-spike', {
      id: 'lead-volume-spike',
      nome: 'Picco Volume Lead',
      descrizione: 'Alert per aumento improvviso lead (+50% vs media)',
      condizione: {
        metrica: 'leadsOggi',
        operatore: 'trend',
        valore: 50, // +50%
        periodo: 30 // 30 minuti
      },
      severita: 'info',
      azioni: [
        {
          tipo: 'dashboard',
          destinatari: ['operatori'],
          template: 'highlight_widget',
          parametri: { widget: 'kpi-summary' }
        },
        {
          tipo: 'email',
          destinatari: ['operations@telemedcare.it'],
          template: 'volume_spike',
          parametri: { action: 'scale_resources' }
        }
      ],
      attivo: true,
      ultimoTrigger: undefined,
      triggerCount: 0,
      falsePositives: 0,
      dataCreazione: new Date(),
      createdBy: 'system'
    });
    
    // Alert Tempo Risposta SLA
    this.alertsAttivi.set('response-time-sla', {
      id: 'response-time-sla',
      nome: 'Violazione SLA Tempo Risposta', 
      descrizione: 'Alert quando tempo risposta supera 90 minuti',
      condizione: {
        metrica: 'tempoRispostaMedia',
        operatore: '>',
        valore: 90,
        periodo: 45 // 45 minuti
      },
      severita: 'warning',
      azioni: [
        {
          tipo: 'email',
          destinatari: ['operations@telemedcare.it', 'team-lead@telemedcare.it'],
          template: 'sla_warning',
          parametri: { sla_target: 60 }
        },
        {
          tipo: 'webhook',
          destinatari: ['https://api.telemedcare.it/alerts/sla'],
          template: 'webhook_sla',
          parametri: { auto_scale: true }
        }
      ],
      attivo: true,
      ultimoTrigger: undefined,
      triggerCount: 0,
      falsePositives: 0,
      dataCreazione: new Date(),
      createdBy: 'system'
    });
    
    console.log(`🚨 [ALERTS] Inizializzati ${this.alertsAttivi.size} alert rules`);
  }
  
  /**
   * Valuta tutti gli alert attivi contro i KPI correnti
   */
  async valutaAlerts(kpi: KPIMetrics): Promise<Array<{alert: AlertRule, triggered: boolean, dettagli?: any}>> {
    const risultati: Array<{alert: AlertRule, triggered: boolean, dettagli?: any}> = [];
    
    console.log(`🚨 [ALERTS] Valutando ${this.alertsAttivi.size} alert rules`);
    
    for (const alert of this.alertsAttivi.values()) {
      if (!alert.attivo) continue;
      
      try {
        const triggered = await this.valutaSingoloAlert(alert, kpi);
        
        if (triggered) {
          console.log(`🚨 [ALERT TRIGGERED] ${alert.nome}`);
          
          // Esegui azioni alert
          await this.eseguiAzioniAlert(alert, kpi);
          
          // Update statistiche
          alert.ultimoTrigger = new Date();
          alert.triggerCount++;
          
          risultati.push({
            alert,
            triggered: true,
            dettagli: {
              valore: this.estraiValore(alert.condizione.metrica, kpi),
              soglia: alert.condizione.valore,
              timestamp: new Date()
            }
          });
        } else {
          risultati.push({ alert, triggered: false });
        }
        
      } catch (error) {
        console.error(`❌ [ALERT] Errore valutazione ${alert.id}:`, error);
        
        // Incrementa false positives in caso di errore
        alert.falsePositives++;
      }
    }
    
    return risultati;
  }
  
  private async valutaSingoloAlert(alert: AlertRule, kpi: KPIMetrics): Promise<boolean> {
    const valore = this.estraiValore(alert.condizione.metrica, kpi);
    const soglia = alert.condizione.valore;
    const operatore = alert.condizione.operatore;
    
    switch (operatore) {
      case '>': return valore > soglia;
      case '<': return valore < soglia;
      case '>=': return valore >= soglia;
      case '<=': return valore <= soglia;
      case '=': return valore === soglia;
      case '!=': return valore !== soglia;
      case 'trend':
        // Per trend, confronta con valore storico (simulato)
        const valoreStorico = valore * (0.8 + Math.random() * 0.4); // ±20% simulato
        const variazione = ((valore - valoreStorico) / valoreStorico) * 100;
        return Math.abs(variazione) > soglia;
      default:
        return false;
    }
  }
  
  private estraiValore(metrica: string, kpi: KPIMetrics): number {
    switch (metrica) {
      case 'conversionRate': return kpi.conversionRate;
      case 'leadsOggi': return kpi.leadsOggi;
      case 'leadsTotali': return kpi.leadsTotali;
      case 'tempoRispostaMedia': return kpi.tempoRispostaMedia;
      case 'tassoContatto': return kpi.tassoContatto;
      case 'tassoChiusura': return kpi.tassoChiusura;
      case 'scoreMedio': return kpi.scoreMedio;
      case 'revenueTotale': return kpi.revenueTotale;
      default: return 0;
    }
  }
  
  private async eseguiAzioniAlert(alert: AlertRule, kpi: KPIMetrics): Promise<void> {
    for (const azione of alert.azioni) {
      try {
        switch (azione.tipo) {
          case 'email':
            await this.inviaEmailAlert(azione, alert, kpi);
            break;
          case 'sms':
            await this.inviaSMSAlert(azione, alert, kpi);
            break;
          case 'webhook':
            await this.inviaWebhookAlert(azione, alert, kpi);
            break;
          case 'dashboard':
            await this.aggiornaDashboardAlert(azione, alert, kpi);
            break;
        }
        
        console.log(`✅ [ALERT ACTION] Eseguita azione ${azione.tipo} per ${alert.id}`);
        
      } catch (error) {
        console.error(`❌ [ALERT ACTION] Errore azione ${azione.tipo} per ${alert.id}:`, error);
      }
    }
  }

  // ===================================
  // 📧 ALERT ACTIONS IMPLEMENTATIONS
  // ===================================
  
  private async inviaEmailAlert(azione: any, alert: AlertRule, kpi: KPIMetrics): Promise<void> {
    // In produzione: integrazione con servizio email (SendGrid, etc.)
    console.log(`📧 [EMAIL ALERT] Inviando a: ${azione.destinatari.join(', ')}`);
    console.log(`📧 Subject: [TeleMedCare Alert] ${alert.nome}`);
    console.log(`📧 Template: ${azione.template}`);
    
    // Simulazione invio email
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  private async inviaSMSAlert(azione: any, alert: AlertRule, kpi: KPIMetrics): Promise<void> {
    // In produzione: integrazione SMS provider
    console.log(`📱 [SMS ALERT] Inviando a: ${azione.destinatari.join(', ')}`);
    console.log(`📱 Messaggio: Alert ${alert.nome} - Verificare dashboard`);
    
    // Simulazione invio SMS
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  private async inviaWebhookAlert(azione: any, alert: AlertRule, kpi: KPIMetrics): Promise<void> {
    // In produzione: HTTP POST al webhook
    console.log(`🔗 [WEBHOOK] POST a: ${azione.destinatari[0]}`);
    console.log(`🔗 Payload:`, { alert: alert.id, kpi: kpi.ultimoAggiornamento });
    
    // Simulazione webhook call
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  private async aggiornaDashboardAlert(azione: any, alert: AlertRule, kpi: KPIMetrics): Promise<void> {
    // Aggiorna widget dashboard per evidenziare alert
    console.log(`📊 [DASHBOARD] Evidenziando widget: ${azione.parametri?.widget || 'all'}`);
    
    // In produzione: WebSocket push ai client connessi
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // ===================================
  // 📊 EXPORT E REPORT GENERATION
  // ===================================
  
  /**
   * Genera ed esporta report in formato specificato
   */
  async generaExportReport(
    templateId: string,
    dataInizio: Date,
    dataFine: Date,
    opzioni: ExportOptions,
    filtri?: Record<string, any>
  ): Promise<{
    file: string;      // Path o URL del file generato
    dimensione: number; // Bytes
    formato: string;
    dataGenerazione: Date;
  }> {
    try {
      console.log(`📄 [EXPORT] Generando report ${templateId} formato ${opzioni.formato}`);
      
      // 1. Raccolta dati per il report
      const kpi = await this.calcolaKPICompleti(dataInizio, dataFine, filtri);
      
      // 2. Generazione contenuto basato su formato
      let contenuto: any;
      let nomeFile: string;
      let dimensione: number;
      
      switch (opzioni.formato) {
        case 'pdf':
          const pdfResult = await this.generaPDFReport(templateId, kpi, opzioni);
          contenuto = pdfResult.contenuto;
          nomeFile = pdfResult.nomeFile;
          dimensione = pdfResult.dimensione;
          break;
          
        case 'excel':
          const excelResult = await this.generaExcelReport(templateId, kpi, opzioni);
          contenuto = excelResult.contenuto;
          nomeFile = excelResult.nomeFile;
          dimensione = excelResult.dimensione;
          break;
          
        case 'csv':
          const csvResult = await this.generaCSVReport(templateId, kpi, opzioni);
          contenuto = csvResult.contenuto;
          nomeFile = csvResult.nomeFile;
          dimensione = csvResult.dimensione;
          break;
          
        case 'json':
          const jsonResult = await this.generaJSONReport(templateId, kpi, opzioni);
          contenuto = jsonResult.contenuto;
          nomeFile = jsonResult.nomeFile;
          dimensione = jsonResult.dimensione;
          break;
          
        default:
          throw new Error(`Formato export non supportato: ${opzioni.formato}`);
      }
      
      // 3. Salvataggio file (in produzione: Cloudflare R2 o storage)
      const fileUrl = await this.salvaFileReport(nomeFile, contenuto, opzioni);
      
      console.log(`✅ [EXPORT] Report generato: ${nomeFile} (${dimensione} bytes)`);
      
      return {
        file: fileUrl,
        dimensione,
        formato: opzioni.formato,
        dataGenerazione: new Date()
      };
      
    } catch (error) {
      console.error(`❌ [EXPORT] Errore generazione report:`, error);
      throw new Error(`Impossibile generare report: ${error}`);
    }
  }
  
  private async generaPDFReport(templateId: string, kpi: KPIMetrics, opzioni: ExportOptions): Promise<{
    contenuto: string;
    nomeFile: string;
    dimensione: number;
  }> {
    // Simulazione generazione PDF (in produzione: libreria PDF come jsPDF o Puppeteer)
    
    const htmlContent = this.generaHTMLReport(templateId, kpi, opzioni);
    
    // Simulazione conversione HTML→PDF
    const pdfBase64 = btoa(htmlContent); // Simulazione encoding
    const nomeFile = `telemedcare_report_${templateId}_${Date.now()}.pdf`;
    const dimensione = pdfBase64.length;
    
    return {
      contenuto: pdfBase64,
      nomeFile,
      dimensione
    };
  }
  
  private async generaExcelReport(templateId: string, kpi: KPIMetrics, opzioni: ExportOptions): Promise<{
    contenuto: string;
    nomeFile: string;
    dimensione: number;
  }> {
    // Simulazione generazione Excel (in produzione: libreria come SheetJS)
    
    const datiTabellari = this.convertiKPIInTabella(kpi);
    const csvContent = this.generaCSVDaTabella(datiTabellari);
    
    // Simulazione conversione CSV→Excel
    const excelBase64 = btoa(csvContent);
    const nomeFile = `telemedcare_report_${templateId}_${Date.now()}.xlsx`;
    const dimensione = excelBase64.length * 1.3; // Excel maggiore di CSV
    
    return {
      contenuto: excelBase64,
      nomeFile,
      dimensione: Math.round(dimensione)
    };
  }
  
  private async generaCSVReport(templateId: string, kpi: KPIMetrics, opzioni: ExportOptions): Promise<{
    contenuto: string;
    nomeFile: string;
    dimensione: number;
  }> {
    const datiTabellari = this.convertiKPIInTabella(kpi);
    const csvContent = this.generaCSVDaTabella(datiTabellari);
    
    const nomeFile = `telemedcare_report_${templateId}_${Date.now()}.csv`;
    const dimensione = csvContent.length;
    
    return {
      contenuto: csvContent,
      nomeFile,
      dimensione
    };
  }
  
  private async generaJSONReport(templateId: string, kpi: KPIMetrics, opzioni: ExportOptions): Promise<{
    contenuto: string;
    nomeFile: string;
    dimensione: number;
  }> {
    const jsonContent = JSON.stringify({
      metadata: {
        template: templateId,
        generatoIl: new Date().toISOString(),
        periodo: kpi.periodoAnalisi,
        versione: '11.0'
      },
      kpi,
      opzioni
    }, null, 2);
    
    const nomeFile = `telemedcare_report_${templateId}_${Date.now()}.json`;
    const dimensione = jsonContent.length;
    
    return {
      contenuto: jsonContent,
      nomeFile,
      dimensione
    };
  }

  // ===================================
  // 🔧 UTILITY FUNCTIONS
  // ===================================
  
  private generaHTMLReport(templateId: string, kpi: KPIMetrics, opzioni: ExportOptions): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>TeleMedCare Report - ${templateId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .kpi-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .numero { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .label { font-size: 12px; color: #666; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>TeleMedCare V11.0 - Business Report</h1>
        <p>Periodo: ${kpi.periodoAnalisi.dataInizio.toLocaleDateString()} - ${kpi.periodoAnalisi.dataFine.toLocaleDateString()}</p>
      </div>
      
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="label">Lead Totali</div>
          <div class="numero">${kpi.leadsTotali.toLocaleString()}</div>
        </div>
        <div class="kpi-card">
          <div class="label">Conversion Rate</div>
          <div class="numero">${kpi.conversionRate.toFixed(2)}%</div>
        </div>
        <div class="kpi-card">
          <div class="label">Revenue Totale</div>
          <div class="numero">€${kpi.revenueTotale.toLocaleString()}</div>
        </div>
      </div>
      
      <h2>Analisi Partner</h2>
      <table border="1" style="width:100%; border-collapse: collapse;">
        <tr style="background: #f5f5f5;">
          <th>Partner</th><th>Lead</th><th>ROI</th><th>Qualità</th>
        </tr>
        ${Object.keys(kpi.leadPerPartner).map(partner => `
          <tr>
            <td>${partner}</td>
            <td>${kpi.leadPerPartner[partner]}</td>
            <td>${kpi.roiPerPartner[partner].toFixed(2)}x</td>
            <td>${kpi.qualitaPerPartner[partner]}/100</td>
          </tr>
        `).join('')}
      </table>
      
      <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #666;">
        Generato il ${new Date().toLocaleString()} - TeleMedCare V11.0 Enterprise
      </div>
    </body>
    </html>
    `;
  }
  
  private convertiKPIInTabella(kpi: KPIMetrics): Array<Record<string, any>> {
    return [
      { Metrica: 'Lead Totali', Valore: kpi.leadsTotali, Tipo: 'Numero' },
      { Metrica: 'Lead Oggi', Valore: kpi.leadsOggi, Tipo: 'Numero' },
      { Metrica: 'Conversion Rate', Valore: kpi.conversionRate + '%', Tipo: 'Percentuale' },
      { Metrica: 'Revenue Totale', Valore: '€' + kpi.revenueTotale.toLocaleString(), Tipo: 'Valuta' },
      { Metrica: 'Revenue Proiettato', Valore: '€' + kpi.revenueProiettato.toLocaleString(), Tipo: 'Valuta' },
      { Metrica: 'Tempo Risposta Medio', Valore: kpi.tempoRispostaMedia + ' min', Tipo: 'Tempo' },
      { Metrica: 'Tasso Contatto', Valore: kpi.tassoContatto + '%', Tipo: 'Percentuale' },
      { Metrica: 'Tasso Chiusura', Valore: kpi.tassoChiusura + '%', Tipo: 'Percentuale' },
      { Metrica: 'Score Medio', Valore: kpi.scoreMedio, Tipo: 'Numero' },
      { Metrica: 'Partner Attivi', Valore: kpi.partnerAttivi, Tipo: 'Numero' },
      { Metrica: 'Crescita Settimanale', Valore: kpi.crescitaSettimanale + '%', Tipo: 'Percentuale' },
      { Metrica: 'Crescita Mensile', Valore: kpi.crescitaMensile + '%', Tipo: 'Percentuale' }
    ];
  }
  
  private generaCSVDaTabella(dati: Array<Record<string, any>>): string {
    if (dati.length === 0) return '';
    
    const headers = Object.keys(dati[0]).join(',');
    const rows = dati.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
  
  private async salvaFileReport(nomeFile: string, contenuto: string, opzioni: ExportOptions): Promise<string> {
    // In produzione: salvataggio su Cloudflare R2 o storage cloud
    
    console.log(`💾 [STORAGE] Salvando file: ${nomeFile}`);
    
    // Simulazione upload cloud
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Ritorna URL simulato
    return `https://reports.telemedcare.it/exports/${nomeFile}`;
  }
  
  private formatTimeAgo(timestamp: Date): string {
    const now = Date.now();
    const diff = now - timestamp.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}g fa`;
    if (hours > 0) return `${hours}h fa`;
    if (minutes > 0) return `${minutes}m fa`;
    return 'Ora';
  }
  
  private getSeverityBadge(severita: string): string {
    const badges: Record<string, string> = {
      'critical': '🔴 Critico',
      'warning': '🟡 Attenzione', 
      'info': '🔵 Info'
    };
    return badges[severita] || '⚪ Sconosciuto';
  }
  
  private getStatusBadge(stato: string): string {
    const badges: Record<string, string> = {
      'attivo': '🔴 Attivo',
      'in_corso': '🟡 In Corso',
      'risolto': '🟢 Risolto'
    };
    return badges[stato] || '⚪ Sconosciuto';
  }

  // ===================================
  // 🧹 PERFORMANCE E CLEANUP
  // ===================================
  
  /**
   * Ottimizza performance sistema reports
   */
  ottimizzaPerformance(): void {
    const maxCacheSize = 500;
    
    // Pulizia cache queries
    if (this.queryCache.size > maxCacheSize) {
      const entries = Array.from(this.queryCache.entries());
      
      // Rimuovi entries scadute
      const now = Date.now();
      const validEntries = entries.filter(([key, value]) => 
        (now - value.timestamp) < value.ttl
      );
      
      // Se ancora troppe, rimuovi le più vecchie
      if (validEntries.length > maxCacheSize) {
        validEntries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        validEntries.splice(maxCacheSize);
      }
      
      this.queryCache.clear();
      validEntries.forEach(([key, value]) => {
        this.queryCache.set(key, value);
      });
      
      console.log(`🧹 [CACHE] Ottimizzata cache queries: ${this.queryCache.size} entries`);
    }
  }
  
  /**
   * Statistiche performance sistema
   */
  getStatistichePerformance(): {
    cacheHitRate: number;
    queryMediaTime: number;
    alertsProcessed24h: number;
    dashboardViews: number;
    reportsGenerated: number;
  } {
    // Simulazione statistiche performance
    return {
      cacheHitRate: 0.73, // 73% hit rate
      queryMediaTime: 145, // 145ms query media
      alertsProcessed24h: 28,
      dashboardViews: 156,
      reportsGenerated: 12
    };
  }
}

// ===================================
// 🚀 EXPORT SINGLETON INSTANCE
// ===================================

export const reportsEngine = new TeleMedCareReports();

/**
 * UTILITIES PER INTEGRAZIONE RAPIDA
 */

export async function getKPIDashboard(): Promise<any> {
  const dataFine = new Date();
  const dataInizio = new Date(dataFine.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 giorni
  
  return await reportsEngine.calcolaKPICompleti(dataInizio, dataFine);
}

export async function getDashboardWidget(widgetId: string): Promise<any> {
  return await reportsEngine.generaDatiWidget(widgetId);
}

export async function exportReportRapido(
  formato: 'pdf' | 'excel' | 'csv' | 'json',
  giorni: number = 30
): Promise<string> {
  const dataFine = new Date();
  const dataInizio = new Date(dataFine.getTime() - (giorni * 24 * 60 * 60 * 1000));
  
  const risultato = await reportsEngine.generaExportReport(
    'standard',
    dataInizio,
    dataFine,
    {
      formato,
      dati: [],
      opzioni: {
        includiGrafici: true,
        includiMetadata: true,
        compressione: false
      },
      layout: {
        orientamento: 'portrait',
        margini: 20
      }
    }
  );
  
  return risultato.file;
}

/**
 * CORREZIONI: Funzioni mancanti richieste dall'index
 */

export async function calcolaKPICompleti(
  dataInizio?: Date,
  dataFine?: Date,
  filtri?: any
): Promise<{
  success: boolean
  kpi?: KPIMetrics
  error?: string
}> {
  try {
    console.log('📊 Calcolo KPI completi')

    const inizio = dataInizio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 giorni fa
    const fine = dataFine || new Date()

    const kpi = await reportsEngine.calcolaKPICompleti(inizio, fine)

    return {
      success: true,
      kpi
    }

  } catch (error) {
    console.error('❌ Errore calcolo KPI:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore calcolo KPI'
    }
  }
}

export async function generaDatiWidget(
  widgetId: string,
  parametri?: any
): Promise<{
  success: boolean
  widget?: DashboardWidget
  error?: string
}> {
  try {
    console.log(`📈 Generazione dati widget: ${widgetId}`)

    const widget = await reportsEngine.generaDatiWidget(widgetId, parametri)

    return {
      success: true,
      widget
    }

  } catch (error) {
    console.error('❌ Errore generazione widget:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore generazione widget'
    }
  }
}

export async function generaExportReport(
  templateId: string,
  dataInizio: Date,
  dataFine: Date,
  configurazione?: any
): Promise<{
  success: boolean
  file?: string
  formato?: string
  dimensione?: number
  error?: string
}> {
  try {
    console.log(`📄 Generazione export report: ${templateId}`)

    const risultato = await reportsEngine.generaExportReport(
      templateId,
      dataInizio,
      dataFine,
      configurazione
    )

    return {
      success: true,
      file: risultato.file,
      formato: risultato.formato,
      dimensione: risultato.dimensione
    }

  } catch (error) {
    console.error('❌ Errore export report:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore export report'
    }
  }
}

