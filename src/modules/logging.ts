/**
 * TELEMEDCARE V11.0 MODULARE
 * =================================
 * 
 * LOGGING.TS - Audit Trail e Sistema di Logging Enterprise
 * 
 * ✨ FUNZIONALITÀ ENTERPRISE:
 * • Audit trail completo per compliance GDPR/ISO27001
 * • Logging strutturato con correlazione eventi
 * • Sistema alerting real-time per eventi critici
 * • Log retention automatico con archiviazione
 * • Performance monitoring e metriche applicative
 * • Security event detection e incident response
 * • Multi-level logging (DEBUG, INFO, WARN, ERROR, CRITICAL)
 * • Export logs per analisi forensi
 * 
 * 🎯 PERFORMANCE TARGET:
 * • Log write: <5ms per evento
 * • Query performance: <200ms
 * • Retention: 7 anni audit, 1 anno operativo
 * • Throughput: 10,000 eventi/sec
 * 
 * @version 10.3.8-ENTERPRISE
 * @author TeleMedCare Development Team
 * @date 2024-10-03
 */

export interface LogEvent {
  // ===== IDENTIFICAZIONE EVENTO =====
  id: string;
  timestamp: Date;
  correlationId?: string;        // Per tracciare operazioni correlate
  sessionId?: string;            // Sessione utente
  
  // ===== CLASSIFICAZIONE =====
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  category: 'AUDIT' | 'SECURITY' | 'PERFORMANCE' | 'BUSINESS' | 'SYSTEM' | 'API';
  source: string;                // Modulo che ha generato l'evento
  
  // ===== CONTENUTO EVENTO =====
  message: string;
  details?: Record<string, any>;
  
  // ===== CONTESTO OPERATIVO =====
  user?: {
    id?: string;
    email?: string;
    role?: string;
    ip?: string;
  };
  
  operation?: {
    name: string;               // Nome operazione (es. "lead_creation")
    resource?: string;          // Risorsa coinvolta (es. "lead_12345")
    action?: string;           // Azione eseguita (CREATE, READ, UPDATE, DELETE)
    result?: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
    duration?: number;         // Millisecondi
  };
  
  // ===== DATI TECNICI =====
  environment: 'development' | 'staging' | 'production';
  version: string;
  
  // ===== COMPLIANCE E PRIVACY =====
  gdprCategory?: 'PERSONAL_DATA' | 'SENSITIVE_DATA' | 'ANONYMOUS' | 'PSEUDONYMOUS';
  retentionYears?: number;       // Anni di retention richiesti
  encrypted?: boolean;           // Se i dati sensibili sono crittografati
  
  // ===== METADATA =====
  tags?: string[];              // Tag per ricerca e categorizzazione
  priority?: number;            // Priorità per alerting (1-10)
}

export interface SecurityEvent extends LogEvent {
  // ===== EVENTI SICUREZZA =====
  securityType: 'LOGIN_ATTEMPT' | 'UNAUTHORIZED_ACCESS' | 'DATA_BREACH' | 'SUSPICIOUS_ACTIVITY' | 'CONFIGURATION_CHANGE' | 'PRIVILEGE_ESCALATION';
  
  threat: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    indicators: string[];        // Indicatori di compromissione
    affectedResources: string[]; // Risorse potenzialmente compromesse
    mitigationActions?: string[]; // Azioni di mitigazione applicate
  };
  
  // ===== CONTESTO SICUREZZA =====
  authentication?: {
    method: string;             // password, 2FA, SSO, etc.
    success: boolean;
    failureReason?: string;
    attempts: number;
  };
  
  networkInfo?: {
    sourceIp: string;
    userAgent?: string;
    geolocation?: string;
    vpnDetected?: boolean;
    reputation?: 'GOOD' | 'SUSPICIOUS' | 'MALICIOUS';
  };
}

export interface AuditEvent extends LogEvent {
  // ===== AUDIT TRAIL SPECIFICO =====
  auditType: 'DATA_ACCESS' | 'CONFIGURATION_CHANGE' | 'USER_ACTION' | 'SYSTEM_EVENT' | 'COMPLIANCE_EVENT';
  
  // ===== DATI AUDIT =====
  before?: Record<string, any>; // Stato precedente
  after?: Record<string, any>;  // Stato successivo
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  
  // ===== COMPLIANCE =====
  complianceFramework?: string[]; // GDPR, ISO27001, HIPAA, etc.
  legalBasis?: string;           // Base giuridica per il trattamento
  dataSubject?: {
    id: string;
    type: 'CUSTOMER' | 'EMPLOYEE' | 'PARTNER' | 'VISITOR';
  };
  
  // ===== APPROVAZIONI =====
  approval?: {
    required: boolean;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: string;
    approvalDate?: Date;
    comments?: string;
  };
}

export interface PerformanceEvent extends LogEvent {
  // ===== METRICHE PERFORMANCE =====
  metrics: {
    responseTime: number;       // Millisecondi
    throughput?: number;        // Operazioni per secondo
    errorRate?: number;         // Percentuale errori
    cpuUsage?: number;         // Percentuale CPU
    memoryUsage?: number;      // MB memoria utilizzata
  };
  
  // ===== SOGLIE E ALERT =====
  thresholds?: {
    responseTimeMs: number;
    errorRatePercent: number;
    exceeded: string[];         // Soglie superate
  };
  
  // ===== CONTESTO PERFORMANCE =====
  endpoint?: string;
  queryCount?: number;
  cacheHitRate?: number;
}

export interface LogQuery {
  // ===== FILTRI TEMPORALI =====
  startTime?: Date;
  endTime?: Date;
  
  // ===== FILTRI CONTENUTO =====
  levels?: LogEvent['level'][];
  categories?: LogEvent['category'][];
  sources?: string[];
  
  // ===== FILTRI OPERAZIONALI =====
  userId?: string;
  correlationId?: string;
  sessionId?: string;
  
  // ===== FILTRI AVANZATI =====
  messagePattern?: string;      // Regex per ricerca nel messaggio
  tags?: string[];             // Tag da cercare
  
  // ===== PAGINAZIONE =====
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'level' | 'category';
  sortOrder?: 'ASC' | 'DESC';
}

export interface LogRetentionPolicy {
  category: LogEvent['category'];
  level: LogEvent['level'];
  retentionDays: number;
  archiveAfterDays?: number;    // Giorni dopo i quali archiviare
  compressionEnabled: boolean;
  encryptionRequired: boolean;
  
  // ===== COMPLIANCE =====
  legalRequirement?: {
    regulation: string;         // GDPR, ISO27001, etc.
    minimumRetention: number;   // Giorni minimi richiesti
    maximumRetention?: number;  // Giorni massimi consentiti
  };
  
  // ===== AZIONI AUTOMATICHE =====
  autoActions: Array<{
    trigger: 'AGE' | 'SIZE' | 'COMPLIANCE';
    threshold: number;
    action: 'ARCHIVE' | 'DELETE' | 'COMPRESS' | 'ANONYMIZE';
  }>;
}

export class TeleMedCareLogger {
  private static instance: TeleMedCareLogger;
  private events: LogEvent[] = [];
  private retentionPolicies: LogRetentionPolicy[] = [];
  private _alertRules?: Map<string, Function>;
  private _correlationContext?: Map<string, {
    startTime: Date;
    operations: string[];
    eventCount: number;
  }>;
  
  private get alertRules() {
    if (!this._alertRules) {
      this._alertRules = new Map<string, Function>();
    }
    return this._alertRules;
  }
  
  private get correlationContext() {
    if (!this._correlationContext) {
      this._correlationContext = new Map<string, {
        startTime: Date;
        operations: string[];
        eventCount: number;
      }>();
    }
    return this._correlationContext;
  }
  
  private performanceMetrics = {
    eventsLogged: 0,
    averageLogTime: 0,
    errorCount: 0,
    lastCleanup: new Date()
  };
  
  constructor() {
    this.inizializzaRetentionPolicies();
    this.inizializzaAlertRules();
    
    // Note: setInterval removed to avoid global scope issues in Cloudflare Workers
    // Auto-cleanup will be triggered manually or via scheduled job
  }
  
  static getInstance(): TeleMedCareLogger {
    if (!TeleMedCareLogger.instance) {
      TeleMedCareLogger.instance = new TeleMedCareLogger();
    }
    return TeleMedCareLogger.instance;
  }

  // ===================================
  // 📝 LOGGING METHODS PRINCIPALI
  // ===================================
  
  /**
   * Log evento generico
   */
  async log(event: Omit<LogEvent, 'id' | 'timestamp' | 'version' | 'environment'>): Promise<string> {
    const startTime = Date.now();
    
    try {
      const logEvent: LogEvent = {
        ...event,
        id: this.generateEventId(),
        timestamp: new Date(),
        version: '10.3.8',
        environment: this.detectEnvironment()
      };
      
      // Validazione evento
      this.validateEvent(logEvent);
      
      // Crittografia dati sensibili se necessario
      if (logEvent.gdprCategory && ['PERSONAL_DATA', 'SENSITIVE_DATA'].includes(logEvent.gdprCategory)) {
        logEvent.details = await this.encryptSensitiveData(logEvent.details || {});
        logEvent.encrypted = true;
      }
      
      // Salvataggio evento
      this.events.push(logEvent);
      
      // Aggiornamento correlazione
      if (logEvent.correlationId) {
        this.updateCorrelationContext(logEvent.correlationId, logEvent.operation?.name || 'unknown');
      }
      
      // Verifica alert rules
      await this.checkAlertRules(logEvent);
      
      // Aggiornamento metriche
      const logTime = Date.now() - startTime;
      this.updatePerformanceMetrics(logTime, true);
      
      console.log(`📝 [LOG] ${logEvent.level} - ${logEvent.category} - ${logEvent.message}`);
      
      return logEvent.id;
      
    } catch (error) {
      this.updatePerformanceMetrics(Date.now() - startTime, false);
      console.error(`❌ [LOGGER] Errore logging:`, error);
      throw error;
    }
  }
  
  /**
   * Log evento di audit per compliance
   */
  async audit(event: Omit<AuditEvent, 'id' | 'timestamp' | 'version' | 'environment' | 'category'>): Promise<string> {
    const auditEvent: AuditEvent = {
      ...event,
      category: 'AUDIT',
      level: event.level || 'INFO',
      retentionYears: event.retentionYears || 7, // Default 7 anni per audit
      gdprCategory: event.gdprCategory || 'PERSONAL_DATA'
    };
    
    return await this.log(auditEvent);
  }
  
  /**
   * Log evento di sicurezza
   */
  async security(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'version' | 'environment' | 'category'>): Promise<string> {
    const securityEvent: SecurityEvent = {
      ...event,
      category: 'SECURITY',
      level: event.level || 'WARN',
      priority: event.priority || 8, // Alta priorità per sicurezza
      retentionYears: 7 // Requisito compliance sicurezza
    };
    
    const eventId = await this.log(securityEvent);
    
    // Azioni automatiche per eventi critici
    if (securityEvent.threat.level === 'CRITICAL') {
      await this.handleCriticalSecurityEvent(securityEvent);
    }
    
    return eventId;
  }
  
  /**
   * Log evento di performance
   */
  async performance(event: Omit<PerformanceEvent, 'id' | 'timestamp' | 'version' | 'environment' | 'category'>): Promise<string> {
    const perfEvent: PerformanceEvent = {
      ...event,
      category: 'PERFORMANCE',
      level: event.level || 'INFO',
      retentionYears: 1 // Performance logs: retention più breve
    };
    
    return await this.log(perfEvent);
  }

  // ===================================
  // 🔍 QUERY E RICERCA LOGS
  // ===================================
  
  /**
   * Cerca eventi nei logs con filtri avanzati
   */
  async queryLogs(query: LogQuery): Promise<{
    events: LogEvent[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      console.log(`🔍 [QUERY] Cercando eventi con filtri:`, query);
      
      let filteredEvents = [...this.events];
      
      // Applica filtri temporali
      if (query.startTime) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= query.startTime!);
      }
      
      if (query.endTime) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= query.endTime!);
      }
      
      // Applica filtri di livello
      if (query.levels && query.levels.length > 0) {
        filteredEvents = filteredEvents.filter(e => query.levels!.includes(e.level));
      }
      
      // Applica filtri di categoria
      if (query.categories && query.categories.length > 0) {
        filteredEvents = filteredEvents.filter(e => query.categories!.includes(e.category));
      }
      
      // Applica filtri source
      if (query.sources && query.sources.length > 0) {
        filteredEvents = filteredEvents.filter(e => query.sources!.includes(e.source));
      }
      
      // Filtri utente
      if (query.userId) {
        filteredEvents = filteredEvents.filter(e => e.user?.id === query.userId);
      }
      
      if (query.correlationId) {
        filteredEvents = filteredEvents.filter(e => e.correlationId === query.correlationId);
      }
      
      if (query.sessionId) {
        filteredEvents = filteredEvents.filter(e => e.sessionId === query.sessionId);
      }
      
      // Ricerca nel messaggio
      if (query.messagePattern) {
        const regex = new RegExp(query.messagePattern, 'i');
        filteredEvents = filteredEvents.filter(e => regex.test(e.message));
      }
      
      // Filtri tag
      if (query.tags && query.tags.length > 0) {
        filteredEvents = filteredEvents.filter(e => 
          e.tags && query.tags!.some(tag => e.tags!.includes(tag))
        );
      }
      
      const totalCount = filteredEvents.length;
      
      // Ordinamento
      const sortBy = query.sortBy || 'timestamp';
      const sortOrder = query.sortOrder || 'DESC';
      
      filteredEvents.sort((a, b) => {
        let compareResult = 0;
        
        switch (sortBy) {
          case 'timestamp':
            compareResult = a.timestamp.getTime() - b.timestamp.getTime();
            break;
          case 'level':
            const levelOrder = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
            compareResult = levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
            break;
          case 'category':
            compareResult = a.category.localeCompare(b.category);
            break;
        }
        
        return sortOrder === 'DESC' ? -compareResult : compareResult;
      });
      
      // Paginazione
      const offset = query.offset || 0;
      const limit = query.limit || 100;
      
      const paginatedEvents = filteredEvents.slice(offset, offset + limit);
      const hasMore = offset + limit < totalCount;
      
      console.log(`🔍 [QUERY] Trovati ${totalCount} eventi, restituiti ${paginatedEvents.length}`);
      
      return {
        events: paginatedEvents,
        totalCount,
        hasMore
      };
      
    } catch (error) {
      console.error(`❌ [QUERY] Errore ricerca logs:`, error);
      throw new Error(`Impossibile eseguire query logs: ${error}`);
    }
  }
  
  /**
   * Ottieni statistiche logs aggregate
   */
  async getLogStatistics(startTime?: Date, endTime?: Date): Promise<{
    totalEvents: number;
    eventsByLevel: Record<string, number>;
    eventsByCategory: Record<string, number>;
    eventsBySource: Record<string, number>;
    topUsers: Array<{userId: string, count: number}>;
    errorRate: number;
    averageEventsPerHour: number;
  }> {
    
    let events = this.events;
    
    // Applica filtri temporali se specificati
    if (startTime) {
      events = events.filter(e => e.timestamp >= startTime);
    }
    
    if (endTime) {
      events = events.filter(e => e.timestamp <= endTime);
    }
    
    const totalEvents = events.length;
    
    // Aggregazioni per livello
    const eventsByLevel: Record<string, number> = {};
    events.forEach(e => {
      eventsByLevel[e.level] = (eventsByLevel[e.level] || 0) + 1;
    });
    
    // Aggregazioni per categoria
    const eventsByCategory: Record<string, number> = {};
    events.forEach(e => {
      eventsByCategory[e.category] = (eventsByCategory[e.category] || 0) + 1;
    });
    
    // Aggregazioni per source
    const eventsBySource: Record<string, number> = {};
    events.forEach(e => {
      eventsBySource[e.source] = (eventsBySource[e.source] || 0) + 1;
    });
    
    // Top utenti
    const userCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.user?.id) {
        userCounts[e.user.id] = (userCounts[e.user.id] || 0) + 1;
      }
    });
    
    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({userId, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calcolo error rate
    const errorEvents = events.filter(e => ['ERROR', 'CRITICAL'].includes(e.level)).length;
    const errorRate = totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;
    
    // Eventi per ora (se filtro temporale)
    const timeSpanHours = startTime && endTime 
      ? (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      : 24; // Default ultime 24 ore
    
    const averageEventsPerHour = totalEvents / timeSpanHours;
    
    return {
      totalEvents,
      eventsByLevel,
      eventsByCategory,
      eventsBySource,
      topUsers,
      errorRate: Math.round(errorRate * 100) / 100,
      averageEventsPerHour: Math.round(averageEventsPerHour * 100) / 100
    };
  }

  // ===================================
  // 🚨 SISTEMA ALERTING
  // ===================================
  
  /**
   * Registra regola di alert personalizzata
   */
  registerAlertRule(
    name: string,
    condition: (event: LogEvent) => boolean,
    action: (event: LogEvent) => Promise<void>
  ): void {
    this.alertRules.set(name, async (event: LogEvent) => {
      if (condition(event)) {
        try {
          await action(event);
          console.log(`🚨 [ALERT] Triggered rule: ${name} for event ${event.id}`);
        } catch (error) {
          console.error(`❌ [ALERT] Error executing rule ${name}:`, error);
        }
      }
    });
    
    console.log(`🚨 [ALERT] Registered rule: ${name}`);
  }
  
  private async checkAlertRules(event: LogEvent): Promise<void> {
    for (const [name, rule] of this.alertRules.entries()) {
      try {
        await rule(event);
      } catch (error) {
        console.error(`❌ [ALERT] Error in rule ${name}:`, error);
      }
    }
  }
  
  private async handleCriticalSecurityEvent(event: SecurityEvent): Promise<void> {
    console.log(`🚨 [SECURITY] CRITICAL EVENT DETECTED: ${event.securityType}`);
    
    // Azioni automatiche per eventi critici
    const actions = [
      'ALERT_SECURITY_TEAM',
      'LOG_INCIDENT',
      'ENABLE_ENHANCED_MONITORING'
    ];
    
    if (event.threat.level === 'CRITICAL') {
      actions.push('INITIATE_INCIDENT_RESPONSE');
    }
    
    // Simulazione azioni (in produzione: chiamate API reali)
    for (const action of actions) {
      console.log(`🔧 [SECURITY] Executing action: ${action}`);
    }
  }

  // ===================================
  // 🗃️ RETENTION E ARCHIVIAZIONE
  // ===================================
  
  /**
   * Esegue pulizia automatica basata su retention policies
   */
  async executeRetentionCleanup(): Promise<{
    deletedEvents: number;
    archivedEvents: number;
    compressedEvents: number;
  }> {
    console.log(`🗃️ [RETENTION] Avviando pulizia automatica logs`);
    
    let deletedEvents = 0;
    let archivedEvents = 0;
    let compressedEvents = 0;
    
    const now = Date.now();
    const eventsToKeep: LogEvent[] = [];
    
    for (const event of this.events) {
      const policy = this.findRetentionPolicy(event);
      if (!policy) {
        eventsToKeep.push(event);
        continue;
      }
      
      const eventAge = now - event.timestamp.getTime();
      const maxAge = policy.retentionDays * 24 * 60 * 60 * 1000;
      
      if (eventAge > maxAge) {
        // Evento scaduto - verifica azioni automatiche
        let shouldDelete = true;
        
        for (const autoAction of policy.autoActions) {
          if (autoAction.trigger === 'AGE' && eventAge > (autoAction.threshold * 24 * 60 * 60 * 1000)) {
            switch (autoAction.action) {
              case 'ARCHIVE':
                await this.archiveEvent(event);
                archivedEvents++;
                shouldDelete = false;
                break;
              case 'COMPRESS':
                // In produzione: compressione reale
                compressedEvents++;
                eventsToKeep.push(event);
                shouldDelete = false;
                break;
              case 'ANONYMIZE':
                const anonymizedEvent = await this.anonymizeEvent(event);
                eventsToKeep.push(anonymizedEvent);
                shouldDelete = false;
                break;
            }
          }
        }
        
        if (shouldDelete) {
          deletedEvents++;
        }
      } else {
        eventsToKeep.push(event);
      }
    }
    
    // Aggiorna array eventi
    this.events = eventsToKeep;
    
    // Aggiorna timestamp ultimo cleanup
    this.performanceMetrics.lastCleanup = new Date();
    
    console.log(`🗃️ [RETENTION] Cleanup completato: ${deletedEvents} eliminati, ${archivedEvents} archiviati, ${compressedEvents} compressi`);
    
    return { deletedEvents, archivedEvents, compressedEvents };
  }
  
  private findRetentionPolicy(event: LogEvent): LogRetentionPolicy | null {
    return this.retentionPolicies.find(policy => 
      policy.category === event.category && policy.level === event.level
    ) || this.retentionPolicies.find(policy => 
      policy.category === event.category && policy.level === 'INFO' // Fallback
    ) || null;
  }
  
  private async archiveEvent(event: LogEvent): Promise<void> {
    // In produzione: salvataggio su storage long-term (Cloudflare R2, AWS S3)
    console.log(`📦 [ARCHIVE] Archiviando evento ${event.id}`);
    
    // Simulazione archiviazione
    const archiveData = {
      ...event,
      archived: true,
      archiveDate: new Date()
    };
    
    // In produzione: upload su storage remoto
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  private async anonymizeEvent(event: LogEvent): Promise<LogEvent> {
    // Anonimizza dati personali per compliance GDPR
    const anonymizedEvent = { ...event };
    
    if (anonymizedEvent.user) {
      anonymizedEvent.user = {
        ...anonymizedEvent.user,
        id: this.hashValue(anonymizedEvent.user.id || 'unknown'),
        email: this.hashValue(anonymizedEvent.user.email || 'unknown')
      };
    }
    
    // Rimuovi dettagli sensibili
    if (anonymizedEvent.details) {
      const sanitizedDetails: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(anonymizedEvent.details)) {
        if (this.isSensitiveField(key)) {
          sanitizedDetails[key] = '[ANONYMIZED]';
        } else {
          sanitizedDetails[key] = value;
        }
      }
      
      anonymizedEvent.details = sanitizedDetails;
    }
    
    anonymizedEvent.gdprCategory = 'ANONYMOUS';
    
    return anonymizedEvent;
  }

  // ===================================
  // 📊 CORRELAZIONE EVENTI
  // ===================================
  
  /**
   * Inizia nuova correlazione per operazione complessa
   */
  startCorrelation(operation: string): string {
    const correlationId = this.generateCorrelationId();
    
    this.correlationContext.set(correlationId, {
      startTime: new Date(),
      operations: [operation],
      eventCount: 0
    });
    
    console.log(`🔗 [CORRELATION] Started: ${correlationId} for operation: ${operation}`);
    
    return correlationId;
  }
  
  /**
   * Conclude correlazione con summary
   */
  async endCorrelation(
    correlationId: string, 
    result: 'SUCCESS' | 'FAILURE' | 'PARTIAL',
    summary?: string
  ): Promise<void> {
    
    const context = this.correlationContext.get(correlationId);
    if (!context) {
      console.warn(`⚠️ [CORRELATION] Context not found: ${correlationId}`);
      return;
    }
    
    const duration = Date.now() - context.startTime.getTime();
    
    await this.log({
      level: result === 'SUCCESS' ? 'INFO' : 'WARN',
      category: 'SYSTEM',
      source: 'correlation_engine',
      message: `Correlation completed: ${correlationId}`,
      correlationId,
      details: {
        result,
        duration,
        operationsCount: context.operations.length,
        eventsCount: context.eventCount,
        operations: context.operations,
        summary
      },
      operation: {
        name: 'correlation_end',
        result,
        duration
      }
    });
    
    // Rimuovi contesto
    this.correlationContext.delete(correlationId);
    
    console.log(`🔗 [CORRELATION] Ended: ${correlationId} - ${result} (${duration}ms, ${context.eventCount} events)`);
  }
  
  private updateCorrelationContext(correlationId: string, operation: string): void {
    const context = this.correlationContext.get(correlationId);
    if (context) {
      if (!context.operations.includes(operation)) {
        context.operations.push(operation);
      }
      context.eventCount++;
    }
  }

  // ===================================
  // 🔧 UTILITY E HELPER FUNCTIONS
  // ===================================
  
  private validateEvent(event: LogEvent): void {
    if (!event.message) {
      throw new Error('Message è obbligatorio per eventi log');
    }
    
    if (!event.source) {
      throw new Error('Source è obbligatorio per eventi log');
    }
    
    // Validazione livelli
    const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    if (!validLevels.includes(event.level)) {
      throw new Error(`Level non valido: ${event.level}`);
    }
    
    // Validazione categorie
    const validCategories = ['AUDIT', 'SECURITY', 'PERFORMANCE', 'BUSINESS', 'SYSTEM', 'API'];
    if (!validCategories.includes(event.category)) {
      throw new Error(`Category non valida: ${event.category}`);
    }
  }
  
  private generateEventId(): string {
    return `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
  
  private generateCorrelationId(): string {
    return `CORR_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
  
  private detectEnvironment(): 'development' | 'staging' | 'production' {
    // In produzione: rilevamento basato su variabili ambiente
    if (typeof globalThis !== 'undefined' && globalThis.location) {
      if (globalThis.location.hostname.includes('localhost')) {
        return 'development';
      } else if (globalThis.location.hostname.includes('staging')) {
        return 'staging';
      }
    }
    
    return 'production'; // Default
  }
  
  private async encryptSensitiveData(data: Record<string, any>): Promise<Record<string, any>> {
    // In produzione: crittografia con Web Crypto API
    const encrypted: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (this.isSensitiveField(key)) {
        // Simulazione crittografia
        encrypted[key] = `ENCRYPTED:${btoa(JSON.stringify(value))}`;
      } else {
        encrypted[key] = value;
      }
    }
    
    return encrypted;
  }
  
  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'password', 'ssn', 'tax_id', 'credit_card', 'email', 
      'phone', 'address', 'name', 'surname', 'birth_date',
      'codice_fiscale', 'partita_iva', 'iban'
    ];
    
    return sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field)
    );
  }
  
  private hashValue(value: string): string {
    // Hash semplificato per anonimizzazione
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `HASH_${Math.abs(hash).toString(36)}`;
  }
  
  private updatePerformanceMetrics(logTime: number, success: boolean): void {
    this.performanceMetrics.eventsLogged++;
    
    if (success) {
      this.performanceMetrics.averageLogTime = 
        (this.performanceMetrics.averageLogTime + logTime) / 2;
    } else {
      this.performanceMetrics.errorCount++;
    }
  }
  
  private inizializzaRetentionPolicies(): void {
    this.retentionPolicies = [
      // AUDIT: 7 anni (compliance)
      {
        category: 'AUDIT',
        level: 'INFO',
        retentionDays: 7 * 365, // 7 anni
        archiveAfterDays: 365,   // Archivia dopo 1 anno
        compressionEnabled: true,
        encryptionRequired: true,
        legalRequirement: {
          regulation: 'GDPR + ISO27001',
          minimumRetention: 7 * 365
        },
        autoActions: [
          {
            trigger: 'AGE',
            threshold: 365,
            action: 'ARCHIVE'
          }
        ]
      },
      
      // SECURITY: 7 anni
      {
        category: 'SECURITY',
        level: 'WARN',
        retentionDays: 7 * 365,
        archiveAfterDays: 180,
        compressionEnabled: true,
        encryptionRequired: true,
        legalRequirement: {
          regulation: 'ISO27001',
          minimumRetention: 7 * 365
        },
        autoActions: [
          {
            trigger: 'AGE',
            threshold: 180,
            action: 'ARCHIVE'
          }
        ]
      },
      
      // PERFORMANCE: 1 anno
      {
        category: 'PERFORMANCE',
        level: 'INFO',
        retentionDays: 365,
        archiveAfterDays: 90,
        compressionEnabled: true,
        encryptionRequired: false,
        autoActions: [
          {
            trigger: 'AGE',
            threshold: 90,
            action: 'COMPRESS'
          }
        ]
      },
      
      // SYSTEM: 6 mesi
      {
        category: 'SYSTEM',
        level: 'INFO',
        retentionDays: 180,
        compressionEnabled: true,
        encryptionRequired: false,
        autoActions: [
          {
            trigger: 'AGE',
            threshold: 30,
            action: 'COMPRESS'
          }
        ]
      },
      
      // DEBUG: 30 giorni
      {
        category: 'SYSTEM',
        level: 'DEBUG',
        retentionDays: 30,
        compressionEnabled: false,
        encryptionRequired: false,
        autoActions: []
      }
    ];
    
    console.log(`🗃️ [RETENTION] Configurate ${this.retentionPolicies.length} policy di retention`);
  }
  
  private inizializzaAlertRules(): void {
    // Alert per errori critici
    this.registerAlertRule(
      'critical_errors',
      (event) => event.level === 'CRITICAL',
      async (event) => {
        console.log(`🚨 [ALERT] CRITICAL ERROR: ${event.message}`);
        // In produzione: notifica immediata via email/SMS/Slack
      }
    );
    
    // Alert per tentativi login falliti
    this.registerAlertRule(
      'failed_logins',
      (event) => event.category === 'SECURITY' && 
                 event.source === 'authentication' && 
                 event.operation?.result === 'FAILURE',
      async (event) => {
        console.log(`🚨 [ALERT] Failed login attempt: ${event.user?.email || 'unknown'}`);
      }
    );
    
    // Alert per performance degradata
    this.registerAlertRule(
      'performance_degradation',
      (event) => event.category === 'PERFORMANCE' && 
                 (event as PerformanceEvent).metrics?.responseTime > 5000,
      async (event) => {
        const perfEvent = event as PerformanceEvent;
        console.log(`🚨 [ALERT] Performance degradation: ${perfEvent.metrics.responseTime}ms`);
      }
    );
    
    // Alert per eventi GDPR
    this.registerAlertRule(
      'gdpr_events',
      (event) => event.gdprCategory === 'SENSITIVE_DATA',
      async (event) => {
        console.log(`🚨 [ALERT] GDPR sensitive data processed: ${event.id}`);
      }
    );
  }

  // ===================================
  // 📈 METRICHE E EXPORT
  // ===================================
  
  /**
   * Ottieni metriche performance sistema logging
   */
  getSystemMetrics(): {
    eventsLogged: number;
    averageLogTime: number;
    errorCount: number;
    errorRate: number;
    memoryUsage: number;
    lastCleanup: Date;
    activeCorrelations: number;
    alertRulesCount: number;
  } {
    const errorRate = this.performanceMetrics.eventsLogged > 0 
      ? (this.performanceMetrics.errorCount / this.performanceMetrics.eventsLogged) * 100 
      : 0;
    
    return {
      ...this.performanceMetrics,
      errorRate: Math.round(errorRate * 100) / 100,
      memoryUsage: this.events.length * 1024, // Stima 1KB per evento
      activeCorrelations: this.correlationContext.size,
      alertRulesCount: this.alertRules.size
    };
  }
  
  /**
   * Esporta logs in formato JSON per analisi esterna
   */
  async exportLogs(
    query: LogQuery,
    format: 'JSON' | 'CSV' | 'XML' = 'JSON'
  ): Promise<string> {
    
    const result = await this.queryLogs(query);
    
    switch (format) {
      case 'JSON':
        return JSON.stringify(result.events, null, 2);
        
      case 'CSV':
        return this.convertToCSV(result.events);
        
      case 'XML':
        return this.convertToXML(result.events);
        
      default:
        return JSON.stringify(result.events);
    }
  }
  
  private convertToCSV(events: LogEvent[]): string {
    if (events.length === 0) return '';
    
    const headers = ['id', 'timestamp', 'level', 'category', 'source', 'message', 'userId', 'correlationId'];
    const csvLines = [headers.join(',')];
    
    events.forEach(event => {
      const row = [
        event.id,
        event.timestamp.toISOString(),
        event.level,
        event.category,
        event.source,
        `"${event.message.replace(/"/g, '""')}"`, // Escape quotes
        event.user?.id || '',
        event.correlationId || ''
      ];
      csvLines.push(row.join(','));
    });
    
    return csvLines.join('\n');
  }
  
  private convertToXML(events: LogEvent[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<logs>\n';
    
    events.forEach(event => {
      xml += '  <event>\n';
      xml += `    <id>${event.id}</id>\n`;
      xml += `    <timestamp>${event.timestamp.toISOString()}</timestamp>\n`;
      xml += `    <level>${event.level}</level>\n`;
      xml += `    <category>${event.category}</category>\n`;
      xml += `    <source>${event.source}</source>\n`;
      xml += `    <message><![CDATA[${event.message}]]></message>\n`;
      
      if (event.user?.id) {
        xml += `    <userId>${event.user.id}</userId>\n`;
      }
      
      if (event.correlationId) {
        xml += `    <correlationId>${event.correlationId}</correlationId>\n`;
      }
      
      xml += '  </event>\n';
    });
    
    xml += '</logs>';
    return xml;
  }
}

// ===================================
// 🚀 EXPORT SINGLETON INSTANCE (LAZY INITIALIZATION)
// ===================================

let _logger: TeleMedCareLogger | null = null;

export function getLogger(): TeleMedCareLogger {
  if (!_logger) {
    _logger = new TeleMedCareLogger();
  }
  return _logger;
}

// Backward compatibility - create proxy object
export const logger = {
  get log() { return getLogger().log.bind(getLogger()); },
  get audit() { return getLogger().audit.bind(getLogger()); },
  get security() { return getLogger().security.bind(getLogger()); },
  get performance() { return getLogger().performance.bind(getLogger()); },
  get queryLogs() { return getLogger().queryLogs.bind(getLogger()); },
  get getLogStatistics() { return getLogger().getLogStatistics.bind(getLogger()); },
  get registerAlertRule() { return getLogger().registerAlertRule.bind(getLogger()); },
  get executeRetentionCleanup() { return getLogger().executeRetentionCleanup.bind(getLogger()); },
  get startCorrelation() { return getLogger().startCorrelation.bind(getLogger()); },
  get endCorrelation() { return getLogger().endCorrelation.bind(getLogger()); },
  get getSystemMetrics() { return getLogger().getSystemMetrics.bind(getLogger()); },
  get exportLogs() { return getLogger().exportLogs.bind(getLogger()); }
};

/**
 * UTILITIES PER INTEGRAZIONE RAPIDA
 */

export async function logInfo(message: string, source: string, details?: any): Promise<string> {
  return await getLogger().log({
    level: 'INFO',
    category: 'SYSTEM',
    source,
    message,
    details
  });
}

export async function logError(message: string, source: string, error?: Error): Promise<string> {
  return await getLogger().log({
    level: 'ERROR',
    category: 'SYSTEM',
    source,
    message,
    details: error ? {
      error: error.message,
      stack: error.stack
    } : undefined
  });
}

export async function logAudit(
  action: string,
  userId: string,
  resource: string,
  details?: any
): Promise<string> {
  return await getLogger().audit({
    level: 'INFO',
    source: 'audit_system',
    message: `User ${userId} performed ${action} on ${resource}`,
    auditType: 'USER_ACTION',
    user: { id: userId },
    operation: {
      name: action,
      resource,
      action: action.toUpperCase(),
      result: 'SUCCESS'
    },
    details,
    before: details?.before,
    after: details?.after
  });
}

export async function logSecurity(
  securityType: SecurityEvent['securityType'],
  message: string,
  threatLevel: SecurityEvent['threat']['level'],
  userId?: string,
  ip?: string
): Promise<string> {
  return await getLogger().security({
    level: threatLevel === 'CRITICAL' ? 'CRITICAL' : 'WARN',
    source: 'security_system',
    message,
    securityType,
    threat: {
      level: threatLevel,
      indicators: [],
      affectedResources: []
    },
    user: userId ? { id: userId, ip } : undefined
  });
}

export async function logPerformance(
  operation: string,
  responseTime: number,
  endpoint?: string
): Promise<string> {
  return await getLogger().performance({
    level: responseTime > 1000 ? 'WARN' : 'INFO',
    source: 'performance_monitor',
    message: `Operation ${operation} completed in ${responseTime}ms`,
    metrics: {
      responseTime,
      throughput: responseTime > 0 ? 1000 / responseTime : 0
    },
    endpoint,
    operation: {
      name: operation,
      duration: responseTime,
      result: 'SUCCESS'
    }
  });
}

export function startOperation(operationName: string): string {
  return getLogger().startCorrelation(operationName);
}

export async function endOperation(
  correlationId: string, 
  success: boolean,
  summary?: string
): Promise<void> {
  await getLogger().endCorrelation(
    correlationId, 
    success ? 'SUCCESS' : 'FAILURE',
    summary
  );
}

// Export missing functions to match import requirements
export async function log(message: string, source: string, details?: any): Promise<string> {
  return await logInfo(message, source, details);
}

export async function audit(action: string, userId: string, resource: string, details?: any): Promise<string> {
  return await logAudit(action, userId, resource, details);
}

export async function queryLogs(query: LogQuery) {
  return await getLogger().queryLogs(query);
}

export async function queryAuditLogs(query: LogQuery) {
  return await getLogger().queryLogs({
    ...query,
    categories: ['AUDIT']
  });
}

export async function querySecurityLogs(query: LogQuery) {
  return await getLogger().queryLogs({
    ...query,
    categories: ['SECURITY']
  });
}

