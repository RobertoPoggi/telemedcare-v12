/**
 * CONFIGURATION_MANAGER.TS - Sistema Gestione Configurazioni
 * TeleMedCare V11.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Configurazioni sistema TeleMedCare (form_configurazione.gs equivalent)
 * - Configurazioni cliente personalizzate
 * - Configurazioni dispositivi medici
 * - Configurazioni workflow e automazioni
 * - Configurazioni email templates e notifiche
 * - Configurazioni pricing e tariffe
 * - Cache distribuito per performance ottimali
 */

export interface SystemConfiguration {
  id: string
  category: 'SYSTEM' | 'CUSTOMER' | 'DEVICE' | 'WORKFLOW' | 'EMAIL' | 'PRICING' | 'INTEGRATION'
  key: string
  value: any
  description?: string
  
  // Metadata
  isActive: boolean
  isSecret: boolean // Per API keys, password etc
  lastModified: string
  modifiedBy: string
  
  // Validation
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'ARRAY' | 'DATE'
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
    options?: string[]
  }
  
  // Environment
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'ALL'
  
  // Cache
  cacheable: boolean
  cacheExpiry?: number // secondi
}

export interface ConfigurationResult {
  success: boolean
  data?: any
  error?: string
  timestamp: string
  cached?: boolean
}

// =====================================================================
// SYSTEM CONFIGURATIONS DEFAULTS
// =====================================================================

export const DEFAULT_SYSTEM_CONFIGURATIONS: Omit<SystemConfiguration, 'id' | 'lastModified' | 'modifiedBy'>[] = [
  // === SYSTEM CONFIGURATIONS ===
  {
    category: 'SYSTEM',
    key: 'APP_NAME',
    value: 'TeleMedCare V11.0',
    description: 'Nome applicazione',
    isActive: true,
    isSecret: false,
    dataType: 'STRING',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 3600
  },
  {
    category: 'SYSTEM',
    key: 'APP_VERSION',
    value: '11.0.0',
    description: 'Versione applicazione',
    isActive: true,
    isSecret: false,
    dataType: 'STRING',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 3600
  },
  {
    category: 'SYSTEM',
    key: 'COMPANY_INFO',
    value: {
      name: 'TeleMedCare S.r.l.',
      address: 'Via Roma 123, 20100 Milano, Italy',
      phone: '+39 02 1234567',
      email: 'info@telemedcare.it',
      website: 'https://telemedcare.it',
      vatNumber: 'IT12345678901',
      fiscalCode: 'TMC12345678'
    },
    description: 'Informazioni azienda',
    isActive: true,
    isSecret: false,
    dataType: 'JSON',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 86400
  },
  
  // === EMAIL CONFIGURATIONS ===
  {
    category: 'EMAIL',
    key: 'SMTP_SETTINGS',
    value: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'noreply@telemedcare.it',
        pass: '${SMTP_PASSWORD}' // Da sostituire con variabile ambiente
      }
    },
    description: 'Configurazioni SMTP per invio email',
    isActive: true,
    isSecret: true,
    dataType: 'JSON',
    environment: 'ALL',
    cacheable: false
  },
  {
    category: 'EMAIL',
    key: 'EMAIL_FROM_DEFAULT',
    value: 'TeleMedCare <noreply@telemedcare.it>',
    description: 'Email mittente di default',
    isActive: true,
    isSecret: false,
    dataType: 'STRING',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 3600
  },
  {
    category: 'EMAIL',
    key: 'EMAIL_SUPPORT',
    value: 'supporto@telemedcare.it',
    description: 'Email supporto clienti',
    isActive: true,
    isSecret: false,
    dataType: 'STRING',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 3600
  },
  
  // === WORKFLOW CONFIGURATIONS ===
  {
    category: 'WORKFLOW',
    key: 'LEAD_ASSIGNMENT_RULES',
    value: {
      autoAssign: true,
      defaultAgent: 'sistema',
      priorities: {
        'HIGH': 0, // Immediato
        'MEDIUM': 300, // 5 minuti
        'LOW': 1800 // 30 minuti
      },
      workingHours: {
        start: '09:00',
        end: '18:00',
        timezone: 'Europe/Rome',
        weekends: false
      }
    },
    description: 'Regole assegnazione leads',
    isActive: true,
    isSecret: false,
    dataType: 'JSON',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 1800
  },
  {
    category: 'WORKFLOW',
    key: 'SIGNATURE_EXPIRY_DAYS',
    value: 7,
    description: 'Giorni scadenza richieste firma',
    isActive: true,
    isSecret: false,
    dataType: 'NUMBER',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 3600
  },
  {
    category: 'WORKFLOW',
    key: 'PAYMENT_TIMEOUT_HOURS',
    value: 48,
    description: 'Ore timeout pagamenti pending',
    isActive: true,
    isSecret: false,
    dataType: 'NUMBER',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 3600
  },
  
  // === PRICING CONFIGURATIONS ===
  {
    category: 'PRICING',
    key: 'SERVICE_PRICES',
    value: {
      'CONSULTATION_BASIC': 89.00,
      'CONSULTATION_PREMIUM': 149.00,
      'DEVICE_MONITORING': 29.00,
      'SUBSCRIPTION_MONTHLY': 199.00,
      'SUBSCRIPTION_YEARLY': 1990.00,
      'TELEMEDICINE_VISIT': 65.00
    },
    description: 'Prezzi servizi TeleMedCare',
    isActive: true,
    isSecret: false,
    dataType: 'JSON',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 1800
  },
  {
    category: 'PRICING',
    key: 'VAT_RATE_DEFAULT',
    value: 22,
    description: 'Aliquota IVA di default (%)',
    isActive: true,
    isSecret: false,
    dataType: 'NUMBER',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 86400
  },
  
  // === DEVICE CONFIGURATIONS ===
  {
    category: 'DEVICE',
    key: 'SUPPORTED_DEVICES',
    value: [
      'GLUCOSE_METER',
      'BLOOD_PRESSURE_MONITOR',
      'OXIMETER',
      'THERMOMETER',
      'WEIGHT_SCALE',
      'ECG_MONITOR',
      'HEART_RATE_MONITOR'
    ],
    description: 'Dispositivi medici supportati',
    isActive: true,
    isSecret: false,
    dataType: 'ARRAY',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 3600
  },
  {
    category: 'DEVICE',
    key: 'DEVICE_SYNC_INTERVAL',
    value: 300,
    description: 'Intervallo sync dispositivi (secondi)',
    isActive: true,
    isSecret: false,
    dataType: 'NUMBER',
    environment: 'ALL',
    cacheable: true,
    cacheExpiry: 1800
  },
  
  // === INTEGRATION CONFIGURATIONS ===
  {
    category: 'INTEGRATION',
    key: 'STRIPE_CONFIG',
    value: {
      publishableKey: '${STRIPE_PUBLISHABLE_KEY}',
      webhookSecret: '${STRIPE_WEBHOOK_SECRET}',
      currency: 'EUR',
      allowedCountries: ['IT', 'DE', 'FR', 'ES', 'AT']
    },
    description: 'Configurazione Stripe',
    isActive: true,
    isSecret: true,
    dataType: 'JSON',
    environment: 'ALL',
    cacheable: false
  },
  {
    category: 'INTEGRATION',
    key: 'DOCUSIGN_CONFIG',
    value: {
      integrationKey: '${DOCUSIGN_INTEGRATION_KEY}',
      baseUrl: 'https://demo.docusign.net/restapi',
      callbackUrl: 'https://telemedcare.it/api/docusign/callback'
    },
    description: 'Configurazione DocuSign',
    isActive: true,
    isSecret: true,
    dataType: 'JSON',
    environment: 'ALL',
    cacheable: false
  }
]

// =====================================================================
// CUSTOMER CONFIGURATIONS TEMPLATES
// =====================================================================

export const CUSTOMER_CONFIGURATION_TEMPLATES = {
  BASIC_PLAN: {
    emailNotifications: true,
    smsNotifications: false,
    deviceMonitoring: false,
    consultationReminders: true,
    dataRetentionDays: 365,
    allowedDevices: 1,
    consultationsPerMonth: 2
  },
  PREMIUM_PLAN: {
    emailNotifications: true,
    smsNotifications: true,
    deviceMonitoring: true,
    consultationReminders: true,
    dataRetentionDays: 1095, // 3 anni
    allowedDevices: 5,
    consultationsPerMonth: 8
  },
  ENTERPRISE_PLAN: {
    emailNotifications: true,
    smsNotifications: true,
    deviceMonitoring: true,
    consultationReminders: true,
    dataRetentionDays: -1, // Illimitato
    allowedDevices: -1, // Illimitato
    consultationsPerMonth: -1 // Illimitato
  }
}

// =====================================================================
// CONFIGURATION MANAGER SERVICE
// =====================================================================

export class ConfigurationManager {
  private static instance: ConfigurationManager | null = null
  private cache: Map<string, { data: any; expiry: number }> = new Map()

  // Lazy loading per Cloudflare Workers
  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager()
    }
    return ConfigurationManager.instance
  }

  /**
   * Inizializza configurazioni di sistema
   */
  async initializeSystemConfigurations(): Promise<void> {
    try {
      console.log('⚙️ Inizializzazione configurazioni sistema TeleMedCare...')
      
      for (const config of DEFAULT_SYSTEM_CONFIGURATIONS) {
        await this.setConfiguration(
          config.category,
          config.key,
          config.value,
          {
            description: config.description,
            isActive: config.isActive,
            isSecret: config.isSecret,
            dataType: config.dataType,
            environment: config.environment,
            cacheable: config.cacheable,
            cacheExpiry: config.cacheExpiry
          }
        )
      }
      
      console.log('✅ Configurazioni sistema inizializzate')

    } catch (error) {
      console.error('❌ Errore inizializzazione configurazioni:', error)
      throw error
    }
  }

  /**
   * Ottieni configurazione
   */
  async getConfiguration(category: string, key: string): Promise<ConfigurationResult> {
    try {
      const cacheKey = `${category}:${key}`
      
      // Check cache prima
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!
        if (cached.expiry > Date.now()) {
          return {
            success: true,
            data: cached.data,
            timestamp: new Date().toISOString(),
            cached: true
          }
        } else {
          this.cache.delete(cacheKey)
        }
      }

      // Simula lettura da database
      console.log(`📖 Lettura configurazione: ${category}.${key}`)
      
      // In produzione: query D1 database
      // const result = await env.DB.prepare('SELECT * FROM configurations WHERE category = ? AND key = ?')
      //   .bind(category, key).first()
      
      const mockConfig = this.findDefaultConfig(category, key)
      
      if (!mockConfig) {
        return {
          success: false,
          error: `Configurazione non trovata: ${category}.${key}`,
          timestamp: new Date().toISOString()
        }
      }

      // Processa variabili ambiente
      const processedValue = this.processEnvironmentVariables(mockConfig.value)
      
      // Cache se configurato
      if (mockConfig.cacheable && mockConfig.cacheExpiry) {
        this.cache.set(cacheKey, {
          data: processedValue,
          expiry: Date.now() + (mockConfig.cacheExpiry * 1000)
        })
      }

      return {
        success: true,
        data: processedValue,
        timestamp: new Date().toISOString(),
        cached: false
      }

    } catch (error) {
      console.error('❌ Errore lettura configurazione:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore lettura configurazione',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Imposta configurazione
   */
  async setConfiguration(
    category: string,
    key: string,
    value: any,
    options?: {
      description?: string
      isActive?: boolean
      isSecret?: boolean
      dataType?: SystemConfiguration['dataType']
      environment?: SystemConfiguration['environment']
      cacheable?: boolean
      cacheExpiry?: number
    }
  ): Promise<ConfigurationResult> {
    try {
      console.log(`💾 Salvataggio configurazione: ${category}.${key}`)
      
      const configId = `CFG_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      const configuration: SystemConfiguration = {
        id: configId,
        category: category as SystemConfiguration['category'],
        key,
        value,
        description: options?.description,
        isActive: options?.isActive ?? true,
        isSecret: options?.isSecret ?? false,
        lastModified: new Date().toISOString(),
        modifiedBy: 'sistema',
        dataType: options?.dataType ?? 'STRING',
        environment: options?.environment ?? 'ALL',
        cacheable: options?.cacheable ?? true,
        cacheExpiry: options?.cacheExpiry
      }

      // Validazione valore
      const validationResult = this.validateConfigurationValue(configuration)
      if (!validationResult.success) {
        return validationResult
      }

      // In produzione: salva in D1 database
      // await env.DB.prepare(`
      //   INSERT OR REPLACE INTO configurations 
      //   (id, category, key, value, description, isActive, isSecret, lastModified, modifiedBy, dataType, environment, cacheable, cacheExpiry)
      //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      // `).bind(
      //   configuration.id, configuration.category, configuration.key, 
      //   JSON.stringify(configuration.value), configuration.description,
      //   configuration.isActive, configuration.isSecret, configuration.lastModified,
      //   configuration.modifiedBy, configuration.dataType, configuration.environment,
      //   configuration.cacheable, configuration.cacheExpiry
      // ).run()

      // Invalida cache
      const cacheKey = `${category}:${key}`
      this.cache.delete(cacheKey)

      console.log(`✅ Configurazione salvata: ${category}.${key}`)

      return {
        success: true,
        data: configuration,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('❌ Errore salvataggio configurazione:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore salvataggio configurazione',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Ottieni tutte le configurazioni di una categoria
   */
  async getConfigurationsByCategory(category: string): Promise<ConfigurationResult> {
    try {
      console.log(`📂 Lettura configurazioni categoria: ${category}`)
      
      // In produzione: query D1 database
      // const results = await env.DB.prepare('SELECT * FROM configurations WHERE category = ? AND isActive = 1')
      //   .bind(category).all()
      
      const mockConfigs = DEFAULT_SYSTEM_CONFIGURATIONS
        .filter(config => config.category === category)
        .map(config => ({
          ...config,
          value: this.processEnvironmentVariables(config.value)
        }))

      return {
        success: true,
        data: mockConfigs,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('❌ Errore lettura configurazioni categoria:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore lettura configurazioni',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Crea configurazione cliente da template
   */
  async createCustomerConfiguration(
    customerId: string,
    planType: keyof typeof CUSTOMER_CONFIGURATION_TEMPLATES,
    overrides?: Partial<typeof CUSTOMER_CONFIGURATION_TEMPLATES.BASIC_PLAN>
  ): Promise<ConfigurationResult> {
    try {
      console.log(`👤 Creazione configurazione cliente: ${customerId} - ${planType}`)
      
      const baseConfig = CUSTOMER_CONFIGURATION_TEMPLATES[planType]
      const finalConfig = { ...baseConfig, ...overrides }
      
      return await this.setConfiguration(
        'CUSTOMER',
        `CUSTOMER_${customerId}`,
        finalConfig,
        {
          description: `Configurazione cliente ${customerId} - Piano ${planType}`,
          dataType: 'JSON',
          environment: 'ALL',
          cacheable: true,
          cacheExpiry: 1800
        }
      )

    } catch (error) {
      console.error('❌ Errore creazione configurazione cliente:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore creazione configurazione cliente',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Ottieni configurazione cliente
   */
  async getCustomerConfiguration(customerId: string): Promise<ConfigurationResult> {
    return await this.getConfiguration('CUSTOMER', `CUSTOMER_${customerId}`)
  }

  /**
   * Invalida cache configurazioni
   */
  invalidateCache(category?: string, key?: string): void {
    if (category && key) {
      const cacheKey = `${category}:${key}`
      this.cache.delete(cacheKey)
      console.log(`🗑️ Cache invalidata: ${cacheKey}`)
    } else if (category) {
      for (const [cacheKey] of this.cache) {
        if (cacheKey.startsWith(`${category}:`)) {
          this.cache.delete(cacheKey)
        }
      }
      console.log(`🗑️ Cache invalidata categoria: ${category}`)
    } else {
      this.cache.clear()
      console.log('🗑️ Cache completamente invalidata')
    }
  }

  /**
   * Statistiche configurazioni
   */
  getConfigurationStats(): {
    totalConfigurations: number
    cachedItems: number
    cacheHitRate: number
    categoriesCount: Record<string, number>
  } {
    const categoriesCount: Record<string, number> = {}
    
    for (const config of DEFAULT_SYSTEM_CONFIGURATIONS) {
      categoriesCount[config.category] = (categoriesCount[config.category] || 0) + 1
    }

    return {
      totalConfigurations: DEFAULT_SYSTEM_CONFIGURATIONS.length,
      cachedItems: this.cache.size,
      cacheHitRate: 0.85, // Mock - in produzione calcolare reale
      categoriesCount
    }
  }

  // =====================================================================
  // PRIVATE METHODS
  // =====================================================================

  private findDefaultConfig(category: string, key: string) {
    return DEFAULT_SYSTEM_CONFIGURATIONS.find(
      config => config.category === category && config.key === key
    )
  }

  private processEnvironmentVariables(value: any): any {
    if (typeof value === 'string' && value.includes('${')) {
      // Processa variabili ambiente tipo ${VAR_NAME}
      return value.replace(/\$\{([^}]+)\}/g, (match, varName) => {
        return process.env[varName] || match
      })
    } else if (typeof value === 'object' && value !== null) {
      // Processa ricorsivamente oggetti
      const processed: any = Array.isArray(value) ? [] : {}
      for (const [k, v] of Object.entries(value)) {
        processed[k] = this.processEnvironmentVariables(v)
      }
      return processed
    }
    return value
  }

  private validateConfigurationValue(config: SystemConfiguration): ConfigurationResult {
    try {
      if (config.validation?.required && (config.value === null || config.value === undefined)) {
        return {
          success: false,
          error: 'Valore richiesto',
          timestamp: new Date().toISOString()
        }
      }

      switch (config.dataType) {
        case 'NUMBER':
          if (typeof config.value !== 'number') {
            return {
              success: false,
              error: 'Valore deve essere un numero',
              timestamp: new Date().toISOString()
            }
          }
          break
        case 'BOOLEAN':
          if (typeof config.value !== 'boolean') {
            return {
              success: false,
              error: 'Valore deve essere boolean',
              timestamp: new Date().toISOString()
            }
          }
          break
        case 'ARRAY':
          if (!Array.isArray(config.value)) {
            return {
              success: false,
              error: 'Valore deve essere un array',
              timestamp: new Date().toISOString()
            }
          }
          break
      }

      return {
        success: true,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      return {
        success: false,
        error: 'Errore validazione valore',
        timestamp: new Date().toISOString()
      }
    }
  }
}

// =====================================================================
// CONFIGURATION UTILITIES
// =====================================================================

export class ConfigurationUtils {
  /**
   * Helper per ottenere configurazione con fallback
   */
  static async getConfigWithFallback<T>(
    category: string,
    key: string,
    fallback: T
  ): Promise<T> {
    try {
      const configManager = ConfigurationManager.getInstance()
      const result = await configManager.getConfiguration(category, key)
      
      return result.success ? result.data : fallback
    } catch (error) {
      console.warn(`⚠️ Fallback configurazione ${category}.${key}:`, error)
      return fallback
    }
  }

  /**
   * Helper per ottenere prezzo servizio
   */
  static async getServicePrice(serviceKey: string): Promise<number> {
    const prices = await this.getConfigWithFallback('PRICING', 'SERVICE_PRICES', {})
    return prices[serviceKey] || 0
  }

  /**
   * Helper per ottenere info azienda
   */
  static async getCompanyInfo(): Promise<any> {
    return await this.getConfigWithFallback('SYSTEM', 'COMPANY_INFO', {})
  }

  /**
   * Helper per ottenere configurazioni email
   */
  static async getEmailConfig(): Promise<any> {
    const configManager = ConfigurationManager.getInstance()
    const [smtpResult, fromResult] = await Promise.all([
      configManager.getConfiguration('EMAIL', 'SMTP_SETTINGS'),
      configManager.getConfiguration('EMAIL', 'EMAIL_FROM_DEFAULT')
    ])

    return {
      smtp: smtpResult.success ? smtpResult.data : null,
      from: fromResult.success ? fromResult.data : 'noreply@telemedcare.it'
    }
  }
}

// =====================================================================
// EXPORT DEFAULTS
// =====================================================================

export default ConfigurationManager