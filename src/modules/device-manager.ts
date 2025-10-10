/**
 * DEVICE_MANAGER.TS - Sistema Gestione Dispositivi Medici
 * TeleMedCare V11.0-Cloudflare - Sistema Modulare
 * 
 * Equivalente di dispositivi.gs - Gestisce:
 * - Associazione dispositivi medici a clienti
 * - Configurazione e calibrazione dispositivi
 * - Sincronizzazione dati medici da dispositivi
 * - Monitoraggio real-time parametri vitali
 * - Allerte e notifiche per valori anomali
 * - Integrazione con Google Sheets per storico dati
 * - Analytics e reports personalizzati
 * - Gestione multi-dispositivo per cliente
 */

export interface MedicalDevice {
  id: string
  
  // Identificazione dispositivo
  deviceType: 'GLUCOSE_METER' | 'BLOOD_PRESSURE' | 'OXIMETER' | 'THERMOMETER' | 
             'WEIGHT_SCALE' | 'ECG_MONITOR' | 'HEART_RATE' | 'SLEEP_TRACKER' | 
             'ACTIVITY_TRACKER' | 'NEBULIZER' | 'PILL_DISPENSER' | 'SIDLY_CARE_PRO'
  brand: string
  model: string
  serialNumber: string
  
  // ESPANSIONE COMPLETA ETICHETTA CE - TUTTI I CAMPI RICHIESTI
  ceLabel: {
    // Identificazione univoca dispositivo
    imei: string                    // IMEI: 868298061208378 (come nell'etichetta)
    udiCode: string                 // UDI (Unique Device Identifier)
    udiDI: string                   // UDI-DI (Device Identifier part)
    udiPI: string                   // UDI-PI (Production Identifier part)
    
    // Date critiche
    manufacturingDate: string       // Data fabbricazione: 05/2023 (formato MM/YYYY)
    manufacturingDateISO: string    // Data in formato ISO: 2023-05-01
    expiryDate: string             // Data scadenza calcolata
    warrantyExpiry: string         // Scadenza garanzia
    
    // Codici identificativi
    modelCode: string              // Codice modello del dispositivo
    batchLot: string               // Lotto di produzione
    softwareVersion: string        // Versione software/firmware
    hardwareVersion: string        // Versione hardware
    
    // Certificazioni CE
    ceMarkCode: string             // Codice marchio CE
    notifiedBodyNumber: string     // Numero ente notificato (es. 0123)
    medicalDeviceClass: 'I' | 'IIa' | 'IIb' | 'III'  // Classe dispositivo medico
    riskClass: string              // Classe di rischio
    
    // Normative e standard
    complianceStandards: string[]  // Standard di conformità (ISO 13485, etc.)
    regulatoryStatus: 'CE_MARKED' | 'FDA_APPROVED' | 'PENDING' | 'EXPIRED'
    
    // Identificazione produttore
    manufacturerName: string       // Nome produttore
    manufacturerCode: string       // Codice produttore
    manufacturerAddress: string    // Indirizzo produttore
    authorizedRep: string         // Rappresentante autorizzato EU
    
    // Controlli qualità
    qcPassedDate: string          // Data superamento controlli qualità
    calibrationDate: string       // Data ultima calibrazione
    nextCalibrationDue: string    // Prossima calibrazione dovuta
    
    // Stato e lifecycle
    deviceLifespan: number        // Durata vita dispositivo (mesi)
    remainingLifespan: number     // Vita residua (giorni)
    lifecycleStatus: 'NEW' | 'ACTIVE' | 'MAINTENANCE' | 'END_OF_LIFE' | 'RECALLED'
    
    // Temperatura e ambiente
    storageConditions: {
      temperatureMin: number      // Temperatura minima stoccaggio (°C)
      temperatureMax: number      // Temperatura massima stoccaggio (°C)
      humidityMax: number         // Umidità massima (%)
      pressureRange: string       // Range pressione atmosferica
    }
    
    // Sterilizzazione e sanificazione  
    sterilizationMethod: 'GAMMA' | 'ETO' | 'STEAM' | 'NONE'
    sterileUntil: string          // Sterile fino al (se applicabile)
    
    // Documentazione
    ifu: string                   // Instructions For Use document ID
    technicalDocumentation: string // ID documentazione tecnica
    riskAnalysisRef: string       // Riferimento analisi rischi
  }
  
  // Identificazione aggiuntiva (legacy - mantenuta per compatibilità)
  macAddress?: string
  bluetoothId?: string
  wifiMac?: string
  imei?: string // Deprecated - utilizzare ceLabel.imei
  
  // Associazione cliente
  customerId?: string
  customerName?: string
  customerEmail?: string
  
  // Status dispositivo
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ERROR' | 'OFFLINE'
  connectionType: 'BLUETOOTH' | 'WIFI' | 'CELLULAR' | 'USB' | 'MANUAL'
  lastConnection?: string
  batteryLevel?: number // 0-100%
  
  // Configurazione
  settings: DeviceSettings
  calibrationData?: CalibrationData
  
  // Monitoraggio
  alerts: DeviceAlert[]
  lastReading?: MedicalReading
  
  // Metadata
  installDate: string
  warrantyExpiry?: string
  firmwareVersion?: string
  
  // Sync & Storage
  syncEnabled: boolean
  googleSheetId?: string // ID Google Sheet per storico
  syncFrequency: number // Minuti
  lastSync?: string
  
  // Geo & Environment
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  
  createdAt: string
  updatedAt: string
  notes?: string
  tags?: string[]
}

export interface DeviceSettings {
  // Configurazioni generali
  measurementUnit: 'METRIC' | 'IMPERIAL'
  timezone: string
  language: 'IT' | 'EN' | 'DE' | 'FR' | 'ES'
  
  // Configurazioni specifiche tipo dispositivo
  glucoseMeter?: {
    targetMin: number
    targetMax: number
    mealOffset: number // Minuti post-pasto
    insulinType?: string
  }
  
  bloodPressure?: {
    systolicMin: number
    systolicMax: number
    diastolicMin: number
    diastolicMax: number
    measurementPosition: 'ARM' | 'WRIST'
  }
  
  oximeter?: {
    spo2Min: number
    heartRateMin: number
    heartRateMax: number
    alarmEnabled: boolean
  }
  
  weightScale?: {
    targetWeight: number
    weightGoal: 'LOSE' | 'GAIN' | 'MAINTAIN'
    weeklyTarget: number // kg per settimana
  }
  
  // Notifiche
  notifications: {
    enabled: boolean
    email: boolean
    sms: boolean
    push: boolean
    emergencyContacts: string[]
  }
  
  // Automazioni
  automations: {
    autoSync: boolean
    smartReminders: boolean
    doctorAlerts: boolean
    familySharing: boolean
  }
}

export interface CalibrationData {
  lastCalibration: string
  calibrationValues: Record<string, number>
  accuracy: number // 0-100%
  nextCalibrationDue: string
  calibratedBy: string
}

export interface MedicalReading {
  id: string
  deviceId: string
  customerId: string
  
  // Timestamp
  readingTime: string
  recordedAt: string
  
  // Dati specifici per tipo dispositivo
  glucoseLevel?: number // mg/dL
  bloodPressure?: {
    systolic: number
    diastolic: number
    pulse: number
  }
  oxygenSaturation?: number // %
  heartRate?: number // bpm
  bodyTemperature?: number // °C
  weight?: number // kg
  bmi?: number
  
  // Context
  mealContext?: 'FASTING' | 'PRE_MEAL' | 'POST_MEAL' | '2H_POST_MEAL'
  activityContext?: 'REST' | 'LIGHT' | 'MODERATE' | 'INTENSE'
  medicationContext?: string[]
  
  // Qualità reading
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  confidence: number // 0-100%
  
  // Flags
  isManual: boolean
  isNormal: boolean
  requiresAttention: boolean
  
  // Analytics
  trend?: 'IMPROVING' | 'STABLE' | 'WORSENING'
  comparedToPrevious?: number // % change
  
  // Metadata
  notes?: string
  tags?: string[]
  
  // Integration
  sentToDoctor: boolean
  googleSheetRow?: number
  
  createdAt: string
}

export interface DeviceAlert {
  id: string
  deviceId: string
  customerId: string
  
  // Alert specifics
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'MAINTENANCE'
  category: 'READING_ANOMALY' | 'DEVICE_ERROR' | 'BATTERY_LOW' | 'CALIBRATION_DUE' | 
           'SYNC_FAILURE' | 'CONNECTION_LOST' | 'EMERGENCY'
  
  // Content
  title: string
  message: string
  severity: number // 1-10
  
  // Trigger
  triggeredBy: 'READING' | 'SYSTEM' | 'MANUAL' | 'SCHEDULE'
  triggerValue?: any
  thresholdValue?: any
  
  // Status
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED'
  resolvedAt?: string
  resolvedBy?: string
  
  // Actions taken
  actionsTaken: string[]
  escalationLevel: number // 0-5
  
  // Notifications
  notificationsSent: {
    patient: boolean
    doctor: boolean
    family: boolean
    emergency: boolean
  }
  
  createdAt: string
  updatedAt: string
}

// =====================================================================
// DEVICE TYPES CONFIGURATION
// =====================================================================

export const DEVICE_TYPES = {
  GLUCOSE_METER: {
    id: 'glucose_meter',
    name: 'Glucometro',
    category: 'diabetes',
    icon: '🩸',
    description: 'Misurazione glicemia',
    normalRanges: {
      fasting: { min: 70, max: 110 },
      postMeal: { min: 70, max: 140 },
      bedtime: { min: 100, max: 140 }
    },
    supportedBrands: ['OneTouch', 'Accu-Chek', 'FreeStyle', 'Contour']
  },
  BLOOD_PRESSURE: {
    id: 'blood_pressure',
    name: 'Sfigmomanometro',
    category: 'cardiovascular', 
    icon: '🩺',
    description: 'Misurazione pressione arteriosa',
    normalRanges: {
      systolic: { min: 90, max: 139 },
      diastolic: { min: 60, max: 89 },
      pulse: { min: 60, max: 100 }
    },
    supportedBrands: ['Omron', 'Microlife', 'Braun', 'Beurer']
  },
  OXIMETER: {
    id: 'oximeter',
    name: 'Pulsossimetro',
    category: 'respiratory',
    icon: '🫁',
    description: 'Misurazione saturazione ossigeno',
    normalRanges: {
      spo2: { min: 95, max: 100 },
      heartRate: { min: 60, max: 100 }
    },
    supportedBrands: ['Nonin', 'Masimo', 'Contec', 'Zacurate']
  },
  WEIGHT_SCALE: {
    id: 'weight_scale',
    name: 'Bilancia',
    category: 'metabolic',
    icon: '⚖️',
    description: 'Misurazione peso corporeo',
    normalRanges: {
      bmi: { min: 18.5, max: 24.9 }
    },
    supportedBrands: ['Withings', 'Fitbit', 'Garmin', 'Tanita']
  },
  ECG_MONITOR: {
    id: 'ecg_monitor',
    name: 'Monitor ECG',
    category: 'cardiovascular',
    icon: '📈',
    description: 'Elettrocardiogramma portatile',
    normalRanges: {
      heartRate: { min: 60, max: 100 },
      qtInterval: { min: 350, max: 440 }
    },
    supportedBrands: ['KardiaMobile', 'Apple Watch', 'Withings', 'Healforce']
  }
}

// =====================================================================
// DEVICE MANAGER SERVICE
// =====================================================================

export class DeviceManager {
  private static instance: DeviceManager | null = null

  // Lazy loading per Cloudflare Workers
  static getInstance(): DeviceManager {
    if (!DeviceManager.instance) {
      DeviceManager.instance = new DeviceManager()
    }
    return DeviceManager.instance
  }

  /**
   * Associa dispositivo a cliente
   */
  async associateDevice(
    customerId: string,
    deviceData: {
      deviceType: MedicalDevice['deviceType']
      brand: string
      model: string
      serialNumber: string
      macAddress?: string
      bluetoothId?: string
      settings?: Partial<DeviceSettings>
      googleSheetId?: string
    }
  ): Promise<{ success: boolean; device?: MedicalDevice; error?: string }> {
    try {
      const deviceId = `DEV_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      console.log('📱 Associazione nuovo dispositivo:', {
        customer: customerId,
        type: deviceData.deviceType,
        model: `${deviceData.brand} ${deviceData.model}`
      })

      // Verifica se dispositivo già esistente
      const existingDevice = await this.findDeviceBySerial(deviceData.serialNumber)
      if (existingDevice) {
        if (existingDevice.customerId && existingDevice.customerId !== customerId) {
          return {
            success: false,
            error: 'Dispositivo già associato ad altro cliente'
          }
        }
      }

      // Ottieni info cliente
      const customerInfo = await this.getCustomerInfo(customerId)

      // Crea configurazione default
      const defaultSettings = this.createDefaultSettings(deviceData.deviceType)
      const finalSettings = { ...defaultSettings, ...deviceData.settings }

      const device: MedicalDevice = {
        id: deviceId,
        deviceType: deviceData.deviceType,
        brand: deviceData.brand,
        model: deviceData.model,
        serialNumber: deviceData.serialNumber,
        macAddress: deviceData.macAddress,
        bluetoothId: deviceData.bluetoothId,
        
        customerId: customerId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        
        status: 'ACTIVE',
        connectionType: 'BLUETOOTH', // Default
        
        settings: finalSettings,
        alerts: [],
        
        installDate: new Date().toISOString(),
        syncEnabled: true,
        googleSheetId: deviceData.googleSheetId,
        syncFrequency: 15, // 15 minuti default
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['new-device']
      }

      // Salva dispositivo
      await this.saveDevice(device)
      
      // Setup Google Sheets integration se richiesta
      if (deviceData.googleSheetId) {
        await this.setupGoogleSheetsIntegration(device)
      }
      
      // Configura alerting di default
      await this.setupDefaultAlerts(device)

      console.log(`✅ Dispositivo associato: ${deviceId}`)

      return {
        success: true,
        device: device
      }

    } catch (error) {
      console.error('❌ Errore associazione dispositivo:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore associazione dispositivo'
      }
    }
  }

  /**
   * Registra lettura da dispositivo
   */
  async recordReading(
    deviceId: string,
    readingData: {
      readingTime?: string
      glucoseLevel?: number
      bloodPressure?: MedicalReading['bloodPressure']
      oxygenSaturation?: number
      heartRate?: number
      bodyTemperature?: number
      weight?: number
      mealContext?: MedicalReading['mealContext']
      activityContext?: MedicalReading['activityContext']
      medicationContext?: string[]
      isManual?: boolean
      notes?: string
    }
  ): Promise<{ success: boolean; reading?: MedicalReading; alerts?: DeviceAlert[]; error?: string }> {
    try {
      const readingId = `READ_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      console.log(`📊 Registrazione lettura dispositivo ${deviceId}:`, readingData)

      // Ottieni dispositivo
      const device = await this.getDeviceById(deviceId)
      if (!device) {
        return {
          success: false,
          error: 'Dispositivo non trovato'
        }
      }

      // Crea reading
      const reading: MedicalReading = {
        id: readingId,
        deviceId: deviceId,
        customerId: device.customerId!,
        readingTime: readingData.readingTime || new Date().toISOString(),
        recordedAt: new Date().toISOString(),
        
        // Dati misurazione
        glucoseLevel: readingData.glucoseLevel,
        bloodPressure: readingData.bloodPressure,
        oxygenSaturation: readingData.oxygenSaturation,
        heartRate: readingData.heartRate,
        bodyTemperature: readingData.bodyTemperature,
        weight: readingData.weight,
        
        // Context
        mealContext: readingData.mealContext,
        activityContext: readingData.activityContext,
        medicationContext: readingData.medicationContext,
        
        // Quality assessment
        quality: this.assessReadingQuality(device, readingData),
        confidence: this.calculateConfidence(device, readingData),
        
        // Flags
        isManual: readingData.isManual || false,
        isNormal: false, // Calcolato dopo
        requiresAttention: false, // Calcolato dopo
        
        // Analytics
        trend: await this.calculateTrend(deviceId, readingData),
        
        // Integration
        sentToDoctor: false,
        
        notes: readingData.notes,
        tags: [],
        createdAt: new Date().toISOString()
      }

      // Calcola BMI se peso e altezza disponibili
      if (reading.weight && device.settings.weightScale?.targetWeight) {
        // In produzione: ottieni altezza da profilo cliente
        const height = 170 // cm - mock
        reading.bmi = reading.weight / Math.pow(height / 100, 2)
      }

      // Valuta normalità valori
      const evaluation = this.evaluateReading(device, reading)
      reading.isNormal = evaluation.isNormal
      reading.requiresAttention = evaluation.requiresAttention

      // Salva reading
      await this.saveReading(reading)
      
      // Aggiorna last reading del dispositivo
      device.lastReading = reading
      device.lastConnection = new Date().toISOString()
      device.updatedAt = new Date().toISOString()
      await this.saveDevice(device)

      // Genera alerts se necessario
      const alerts = await this.checkAndCreateAlerts(device, reading, evaluation)
      
      // Sync con Google Sheets
      if (device.syncEnabled && device.googleSheetId) {
        await this.syncToGoogleSheets(device, reading)
      }

      // Notifica stakeholders se richiede attenzione
      if (reading.requiresAttention) {
        await this.notifyStakeholders(device, reading, alerts)
      }

      console.log(`✅ Lettura registrata: ${readingId} (Normale: ${reading.isNormal})`)

      return {
        success: true,
        reading: reading,
        alerts: alerts
      }

    } catch (error) {
      console.error('❌ Errore registrazione lettura:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore registrazione lettura'
      }
    }
  }

  /**
   * Ottieni dispositivi cliente
   */
  async getCustomerDevices(customerId: string): Promise<{
    success: boolean
    devices?: MedicalDevice[]
    error?: string
  }> {
    try {
      console.log(`🔍 Ricerca dispositivi cliente: ${customerId}`)
      
      // In produzione: query D1 database
      // const results = await env.DB.prepare('SELECT * FROM medical_devices WHERE customerId = ? AND status != "INACTIVE"')
      //   .bind(customerId).all()
      
      // Mock devices per testing
      const mockDevices: MedicalDevice[] = [
        {
          id: 'DEV_001',
          deviceType: 'GLUCOSE_METER',
          brand: 'OneTouch',
          model: 'Verio Reflect',
          serialNumber: 'OT123456789',
          customerId: customerId,
          customerName: 'Mario Rossi',
          customerEmail: 'mario.rossi@example.com',
          status: 'ACTIVE',
          connectionType: 'BLUETOOTH',
          lastConnection: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 ore fa
          batteryLevel: 85,
          settings: this.createDefaultSettings('GLUCOSE_METER'),
          alerts: [],
          installDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni fa
          syncEnabled: true,
          syncFrequency: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'DEV_002',
          deviceType: 'BLOOD_PRESSURE',
          brand: 'Omron',
          model: 'M6 Comfort',
          serialNumber: 'OM987654321',
          customerId: customerId,
          customerName: 'Mario Rossi',
          customerEmail: 'mario.rossi@example.com',
          status: 'ACTIVE',
          connectionType: 'BLUETOOTH',
          lastConnection: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 ora fa
          batteryLevel: 92,
          settings: this.createDefaultSettings('BLOOD_PRESSURE'),
          alerts: [],
          installDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 giorni fa
          syncEnabled: true,
          syncFrequency: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      return {
        success: true,
        devices: mockDevices
      }

    } catch (error) {
      console.error('❌ Errore ricerca dispositivi cliente:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore ricerca dispositivi'
      }
    }
  }

  /**
   * Ottieni letture dispositivo con filtri
   */
  async getDeviceReadings(
    deviceId: string,
    filters?: {
      dateFrom?: string
      dateTo?: string
      readingType?: string
      limit?: number
      includeAnomalies?: boolean
    }
  ): Promise<{
    success: boolean
    readings?: MedicalReading[]
    stats?: {
      totalReadings: number
      normalReadings: number
      anomalousReadings: number
      averageValue?: number
      trend: 'IMPROVING' | 'STABLE' | 'WORSENING'
    }
    error?: string
  }> {
    try {
      console.log(`📊 Ricerca letture dispositivo ${deviceId}:`, filters)
      
      // In produzione: query complessa D1 database
      // Mock readings per testing
      const mockReadings: MedicalReading[] = [
        {
          id: 'READ_001',
          deviceId: deviceId,
          customerId: 'CUST_001',
          readingTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          glucoseLevel: 110,
          mealContext: 'FASTING',
          quality: 'EXCELLENT',
          confidence: 95,
          isManual: false,
          isNormal: true,
          requiresAttention: false,
          trend: 'STABLE',
          sentToDoctor: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'READ_002',
          deviceId: deviceId,
          customerId: 'CUST_001',
          readingTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          recordedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          bloodPressure: {
            systolic: 125,
            diastolic: 80,
            pulse: 72
          },
          quality: 'GOOD',
          confidence: 88,
          isManual: false,
          isNormal: true,
          requiresAttention: false,
          trend: 'IMPROVING',
          sentToDoctor: false,
          createdAt: new Date().toISOString()
        }
      ]

      // Calcola statistiche
      const stats = {
        totalReadings: mockReadings.length,
        normalReadings: mockReadings.filter(r => r.isNormal).length,
        anomalousReadings: mockReadings.filter(r => !r.isNormal).length,
        averageValue: mockReadings.reduce((sum, r) => sum + (r.glucoseLevel || r.bloodPressure?.systolic || 0), 0) / mockReadings.length,
        trend: 'STABLE' as const
      }

      return {
        success: true,
        readings: mockReadings,
        stats: stats
      }

    } catch (error) {
      console.error('❌ Errore ricerca letture:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore ricerca letture'
      }
    }
  }

  /**
   * Statistiche dispositivi dashboard
   */
  async getDeviceStatistics(customerId?: string): Promise<{
    totalDevices: number
    activeDevices: number
    offlineDevices: number
    totalReadings: number
    recentReadings: number
    criticalAlerts: number
    devicesByType: Record<string, number>
    batteryStatus: { low: number; medium: number; high: number }
    syncStatus: { synced: number; pending: number; failed: number }
  }> {
    try {
      console.log('📊 Calcolo statistiche dispositivi')
      
      // In produzione: query aggregate D1 database
      return {
        totalDevices: 347,
        activeDevices: 289,
        offlineDevices: 12,
        totalReadings: 15642,
        recentReadings: 127, // Ultime 24h
        criticalAlerts: 3,
        devicesByType: {
          'GLUCOSE_METER': 89,
          'BLOOD_PRESSURE': 134,
          'OXIMETER': 67,
          'WEIGHT_SCALE': 45,
          'ECG_MONITOR': 12
        },
        batteryStatus: {
          low: 23,    // <20%
          medium: 87, // 20-50%
          high: 237   // >50%
        },
        syncStatus: {
          synced: 267,
          pending: 18,
          failed: 4
        }
      }

    } catch (error) {
      console.error('❌ Errore calcolo statistiche dispositivi:', error)
      throw error
    }
  }

  // =====================================================================
  // PRIVATE HELPER METHODS
  // =====================================================================

  private async getCustomerInfo(customerId: string): Promise<{ name: string; email: string }> {
    // In produzione: query database clienti
    return {
      name: 'Mario Rossi',
      email: 'mario.rossi@example.com'
    }
  }

  private async findDeviceBySerial(serialNumber: string): Promise<MedicalDevice | null> {
    // In produzione: query D1 database per serial number
    console.log(`🔍 Ricerca dispositivo per serial: ${serialNumber}`)
    return null // Mock - non trovato
  }

  private async getDeviceById(deviceId: string): Promise<MedicalDevice | null> {
    // In produzione: query D1 database
    console.log(`🔍 Ricerca dispositivo per ID: ${deviceId}`)
    
    // Mock device per testing
    return {
      id: deviceId,
      deviceType: 'GLUCOSE_METER',
      brand: 'OneTouch',
      model: 'Verio Reflect',
      serialNumber: 'OT123456789',
      customerId: 'CUST_001',
      customerName: 'Mario Rossi',
      customerEmail: 'mario.rossi@example.com',
      status: 'ACTIVE',
      connectionType: 'BLUETOOTH',
      settings: this.createDefaultSettings('GLUCOSE_METER'),
      alerts: [],
      installDate: new Date().toISOString(),
      syncEnabled: true,
      syncFrequency: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  private createDefaultSettings(deviceType: MedicalDevice['deviceType']): DeviceSettings {
    const baseSettings: DeviceSettings = {
      measurementUnit: 'METRIC',
      timezone: 'Europe/Rome',
      language: 'IT',
      notifications: {
        enabled: true,
        email: true,
        sms: false,
        push: true,
        emergencyContacts: []
      },
      automations: {
        autoSync: true,
        smartReminders: true,
        doctorAlerts: true,
        familySharing: false
      }
    }

    switch (deviceType) {
      case 'GLUCOSE_METER':
        baseSettings.glucoseMeter = {
          targetMin: 70,
          targetMax: 140,
          mealOffset: 120, // 2 ore
          insulinType: 'rapid'
        }
        break
      
      case 'BLOOD_PRESSURE':
        baseSettings.bloodPressure = {
          systolicMin: 90,
          systolicMax: 139,
          diastolicMin: 60,
          diastolicMax: 89,
          measurementPosition: 'ARM'
        }
        break
      
      case 'OXIMETER':
        baseSettings.oximeter = {
          spo2Min: 95,
          heartRateMin: 60,
          heartRateMax: 100,
          alarmEnabled: true
        }
        break
      
      case 'WEIGHT_SCALE':
        baseSettings.weightScale = {
          targetWeight: 70,
          weightGoal: 'MAINTAIN',
          weeklyTarget: 0.5
        }
        break
    }

    return baseSettings
  }

  private assessReadingQuality(device: MedicalDevice, readingData: any): MedicalReading['quality'] {
    // Valutazione qualità basata su vari fattori
    if (readingData.isManual) return 'FAIR'
    if (device.batteryLevel && device.batteryLevel < 20) return 'FAIR'
    if (!device.lastConnection || 
        new Date(device.lastConnection) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return 'GOOD'
    }
    return 'EXCELLENT'
  }

  private calculateConfidence(device: MedicalDevice, readingData: any): number {
    let confidence = 100
    
    if (readingData.isManual) confidence -= 20
    if (device.batteryLevel && device.batteryLevel < 20) confidence -= 10
    if (!device.calibrationData || 
        new Date(device.calibrationData.nextCalibrationDue) < new Date()) {
      confidence -= 15
    }
    
    return Math.max(0, confidence)
  }

  private async calculateTrend(deviceId: string, currentReading: any): Promise<MedicalReading['trend']> {
    // In produzione: analizza letture precedenti per calcolare trend
    console.log(`📈 Calcolo trend per dispositivo: ${deviceId}`)
    return 'STABLE'
  }

  private evaluateReading(device: MedicalDevice, reading: MedicalReading): {
    isNormal: boolean
    requiresAttention: boolean
    severity: number
  } {
    const deviceTypeConfig = DEVICE_TYPES[device.deviceType]
    let isNormal = true
    let requiresAttention = false
    let severity = 0

    if (reading.glucoseLevel && deviceTypeConfig.normalRanges) {
      const ranges = deviceTypeConfig.normalRanges as any
      const contextRange = reading.mealContext === 'FASTING' ? ranges.fasting : ranges.postMeal
      
      if (contextRange) {
        isNormal = reading.glucoseLevel >= contextRange.min && reading.glucoseLevel <= contextRange.max
        
        if (reading.glucoseLevel < 70) {
          requiresAttention = true
          severity = reading.glucoseLevel < 54 ? 9 : 6 // Ipoglicemia severa vs moderata
        } else if (reading.glucoseLevel > 250) {
          requiresAttention = true
          severity = 8 // Iperglicemia severa
        }
      }
    }

    if (reading.bloodPressure && deviceTypeConfig.normalRanges) {
      const ranges = deviceTypeConfig.normalRanges as any
      const { systolic, diastolic } = reading.bloodPressure
      
      isNormal = systolic >= ranges.systolic.min && systolic <= ranges.systolic.max &&
                 diastolic >= ranges.diastolic.min && diastolic <= ranges.diastolic.max
      
      if (systolic > 180 || diastolic > 110) {
        requiresAttention = true
        severity = 9 // Crisis ipertensiva
      } else if (systolic < 90 || diastolic < 60) {
        requiresAttention = true
        severity = 6 // Ipotensione
      }
    }

    return { isNormal, requiresAttention, severity }
  }

  private async checkAndCreateAlerts(
    device: MedicalDevice, 
    reading: MedicalReading, 
    evaluation: any
  ): Promise<DeviceAlert[]> {
    const alerts: DeviceAlert[] = []

    if (evaluation.requiresAttention) {
      const alertId = `ALERT_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      const alert: DeviceAlert = {
        id: alertId,
        deviceId: device.id,
        customerId: device.customerId!,
        type: evaluation.severity >= 8 ? 'CRITICAL' : 'WARNING',
        category: 'READING_ANOMALY',
        title: this.getAlertTitle(device.deviceType, reading, evaluation.severity),
        message: this.getAlertMessage(device.deviceType, reading, evaluation.severity),
        severity: evaluation.severity,
        triggeredBy: 'READING',
        triggerValue: this.getReadingValue(reading),
        status: 'ACTIVE',
        actionsTaken: [],
        escalationLevel: 0,
        notificationsSent: {
          patient: false,
          doctor: false,
          family: false,
          emergency: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      alerts.push(alert)
      device.alerts.push(alert)
      
      console.log(`🚨 Alert creato: ${alert.type} - ${alert.title}`)
    }

    return alerts
  }

  private getAlertTitle(deviceType: string, reading: MedicalReading, severity: number): string {
    if (deviceType === 'GLUCOSE_METER' && reading.glucoseLevel) {
      if (reading.glucoseLevel < 70) return severity >= 9 ? 'IPOGLICEMIA SEVERA' : 'Ipoglicemia'
      if (reading.glucoseLevel > 250) return 'IPERGLICEMIA SEVERA'
    }
    
    if (deviceType === 'BLOOD_PRESSURE' && reading.bloodPressure) {
      if (reading.bloodPressure.systolic > 180) return 'CRISI IPERTENSIVA'
      if (reading.bloodPressure.systolic < 90) return 'Ipotensione'
    }
    
    return 'Valore Anomalo'
  }

  private getAlertMessage(deviceType: string, reading: MedicalReading, severity: number): string {
    if (deviceType === 'GLUCOSE_METER' && reading.glucoseLevel) {
      if (reading.glucoseLevel < 70) {
        return `Glicemia molto bassa: ${reading.glucoseLevel} mg/dL. ${severity >= 9 ? 'CONTATTARE IMMEDIATAMENTE IL MEDICO!' : 'Assumere zuccheri rapidamente.'}`
      }
    }
    
    return 'Rilevato valore fuori range normale. Consultare il medico.'
  }

  private getReadingValue(reading: MedicalReading): any {
    return reading.glucoseLevel || reading.bloodPressure || reading.oxygenSaturation || reading.weight
  }

  private async saveDevice(device: MedicalDevice): Promise<void> {
    // In produzione: salva in D1 database
    console.log(`💾 Salvataggio dispositivo: ${device.id}`)
  }

  private async saveReading(reading: MedicalReading): Promise<void> {
    // In produzione: salva in D1 database
    console.log(`💾 Salvataggio lettura: ${reading.id}`)
  }

  private async setupGoogleSheetsIntegration(device: MedicalDevice): Promise<void> {
    console.log(`📊 Setup Google Sheets per dispositivo: ${device.id}`)
    // TODO: Configurazione Google Sheets API integration
  }

  private async setupDefaultAlerts(device: MedicalDevice): Promise<void> {
    console.log(`🔔 Setup alert default per dispositivo: ${device.id}`)
    // TODO: Configurazione alert di default per tipo dispositivo
  }

  private async syncToGoogleSheets(device: MedicalDevice, reading: MedicalReading): Promise<void> {
    if (!device.googleSheetId) return
    
    console.log(`📊 Sync a Google Sheets: ${device.googleSheetId}`)
    // TODO: Implementazione sync Google Sheets API
  }

  private async notifyStakeholders(device: MedicalDevice, reading: MedicalReading, alerts: DeviceAlert[]): Promise<void> {
    console.log(`📧 Notifica stakeholder per alert critici: ${device.id}`)
    // TODO: Notifiche email/SMS a paziente, medico, familiari
  }

  // =====================================================================
  // GESTIONE COMPLETA ETICHETTA CE - TUTTI I CAMPI RICHIESTI
  // =====================================================================

  /**
   * Legge COMPLETA etichetta CE da dispositivo inclusi TUTTI i campi
   * ESPANSIONE TOTALE: IMEI, UDI, date fabbricazione, scadenze, codici CE
   */
  async readCompleteCELabel(deviceId: string): Promise<{ 
    success: boolean; 
    ceLabel?: MedicalDevice['ceLabel']; 
    validationErrors?: string[];
    recommendations?: string[];
    error?: string 
  }> {
    try {
      console.log(`🏷️ [CE LABEL] Lettura completa etichetta CE dispositivo: ${deviceId}`)
      
      // Simula lettura completa da dispositivo fisico SiDLY Care Pro
      // In produzione: lettura via NFC, QR code o API dispositivo
      const ceLabel: MedicalDevice['ceLabel'] = {
        // Identificazione univoca (dall'immagine caricata)
        imei: '868298061208378',  // IMEI dall'etichetta reale
        udiCode: 'SIDLY868298061208378240531',
        udiDI: '(01)05060301000017',  // Global Trade Item Number (GTIN)
        udiPI: '(11)240531(21)868298061208378',  // Production Identifiers
        
        // Date (dall'etichetta: 05/2023)
        manufacturingDate: '05/2023',
        manufacturingDateISO: '2023-05-01T00:00:00.000Z',
        expiryDate: this.calculateDeviceExpiry('2023-05-01', 'SIDLY_CARE_PRO').expiryDate,
        warrantyExpiry: this.calculateWarrantyExpiry('2023-05-01', 24), // 24 mesi garanzia
        
        // Codici identificativi
        modelCode: 'SIDLY-CP-2023-V1',
        batchLot: 'LOT240531A',
        softwareVersion: 'v2.4.1',
        hardwareVersion: 'HW-1.2',
        
        // Certificazioni CE
        ceMarkCode: 'CE0123',
        notifiedBodyNumber: '0123',  // Ente notificato
        medicalDeviceClass: 'IIa',   // Classe dispositivo medico
        riskClass: 'MEDIUM_RISK',
        
        // Standard conformità
        complianceStandards: [
          'ISO 13485:2016',   // Sistema qualità dispositivi medici
          'ISO 14971:2019',   // Gestione rischio
          'IEC 62304:2006',   // Software dispositivi medici
          'ISO 62366-1:2015', // Usabilità
          'EN 60601-1:2006'   // Sicurezza elettrica
        ],
        regulatoryStatus: 'CE_MARKED',
        
        // Produttore (dall'etichetta)
        manufacturerName: 'SiDLY Medical Technologies S.r.l.',
        manufacturerCode: 'SIDLY-IT-001',
        manufacturerAddress: 'Via delle Tecnologie, 15 - 20900 Milano, Italy',
        authorizedRep: 'SiDLY EU Representative B.V.',
        
        // Controlli qualità
        qcPassedDate: '2023-05-30T14:30:00.000Z',
        calibrationDate: '2023-05-29T10:15:00.000Z',
        nextCalibrationDue: '2024-05-29T10:15:00.000Z',
        
        // Lifecycle (24 mesi per SiDLY Care Pro)
        deviceLifespan: 24,  // mesi
        remainingLifespan: this.calculateRemainingDays('2023-05-01', 24),
        lifecycleStatus: this.determineLifecycleStatus('2023-05-01', 24),
        
        // Condizioni ambientali
        storageConditions: {
          temperatureMin: -10,  // °C
          temperatureMax: 60,   // °C
          humidityMax: 85,      // %
          pressureRange: '500-1060 hPa'
        },
        
        // Sterilizzazione
        sterilizationMethod: 'GAMMA',
        sterileUntil: '2025-05-01T23:59:59.000Z',
        
        // Documentazione
        ifu: 'IFU-SIDLY-CP-IT-v2.4',
        technicalDocumentation: 'TD-SIDLY-CP-2023-001',
        riskAnalysisRef: 'RA-SIDLY-CP-v1.2'
      }

      // Validazione completa di tutti i campi
      const validationErrors = this.validateCELabel(ceLabel)
      const recommendations = this.generateCERecommendations(ceLabel)

      if (validationErrors.length > 0) {
        console.warn('⚠️ [CE LABEL] Errori validazione:', validationErrors)
      }

      // Aggiorna device nel database
      const device = await this.getDeviceById(deviceId)
      if (device) {
        device.ceLabel = ceLabel
        device.imei = ceLabel.imei  // Backward compatibility
        device.deviceType = 'SIDLY_CARE_PRO'
        device.updatedAt = new Date().toISOString()
        await this.saveDevice(device)
      }

      return {
        success: true,
        ceLabel: ceLabel,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
        recommendations
      }
      
    } catch (error) {
      console.error('❌ [CE LABEL] Errore lettura etichetta CE:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore lettura etichetta CE completa'
      }
    }
  }

  /**
   * Valida tutti i campi dell'etichetta CE
   */
  private validateCELabel(ceLabel: MedicalDevice['ceLabel']): string[] {
    const errors: string[] = []

    // Validazione IMEI
    if (!this.validateIMEI(ceLabel.imei)) {
      errors.push(`IMEI non valido: ${ceLabel.imei}`)
    }

    // Validazione UDI
    if (!ceLabel.udiCode || ceLabel.udiCode.length < 10) {
      errors.push('UDI Code mancante o troppo corto')
    }

    // Validazione date
    const mfgDate = new Date(ceLabel.manufacturingDateISO)
    const expDate = new Date(ceLabel.expiryDate)
    
    if (isNaN(mfgDate.getTime())) {
      errors.push('Data fabbricazione non valida')
    }
    
    if (isNaN(expDate.getTime())) {
      errors.push('Data scadenza non valida')
    }
    
    if (mfgDate > expDate) {
      errors.push('Data fabbricazione posteriore alla scadenza')
    }

    // Validazione classe dispositivo
    if (!['I', 'IIa', 'IIb', 'III'].includes(ceLabel.medicalDeviceClass)) {
      errors.push(`Classe dispositivo medico non valida: ${ceLabel.medicalDeviceClass}`)
    }

    // Validazione ente notificato
    if (!ceLabel.notifiedBodyNumber || !/^\d{4}$/.test(ceLabel.notifiedBodyNumber)) {
      errors.push('Numero ente notificato deve essere 4 cifre')
    }

    // Validazione condizioni stoccaggio
    if (ceLabel.storageConditions.temperatureMin >= ceLabel.storageConditions.temperatureMax) {
      errors.push('Range temperatura stoccaggio non valido')
    }

    return errors
  }

  /**
   * Genera raccomandazioni basate su stato etichetta CE
   */
  private generateCERecommendations(ceLabel: MedicalDevice['ceLabel']): string[] {
    const recommendations: string[] = []

    // Controllo scadenza
    const daysToExpiry = Math.ceil((new Date(ceLabel.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    if (daysToExpiry < 0) {
      recommendations.push('🚨 URGENTE: Dispositivo scaduto - Sostituire immediatamente')
    } else if (daysToExpiry <= 30) {
      recommendations.push('⚠️ ATTENZIONE: Dispositivo in scadenza entro 30 giorni - Pianificare sostituzione')
    } else if (daysToExpiry <= 90) {
      recommendations.push('📅 INFO: Dispositivo in scadenza entro 90 giorni - Monitorare')
    }

    // Controllo calibrazione
    const daysToCalibration = Math.ceil((new Date(ceLabel.nextCalibrationDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    if (daysToCalibration < 0) {
      recommendations.push('🔧 MANUTENZIONE: Calibrazione scaduta - Programmare immediatamente')
    } else if (daysToCalibration <= 7) {
      recommendations.push('🔧 MANUTENZIONE: Calibrazione dovuta entro 7 giorni')
    }

    // Controllo sterilizzazione
    if (ceLabel.sterilizationMethod !== 'NONE') {
      const sterileDate = new Date(ceLabel.sterileUntil)
      const daysToSterileExpiry = Math.ceil((sterileDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      if (daysToSterileExpiry < 0) {
        recommendations.push('🦠 IGIENE: Sterilizzazione scaduta - Ri-sterilizzare prima dell\'uso')
      } else if (daysToSterileExpiry <= 30) {
        recommendations.push('🦠 IGIENE: Sterilizzazione in scadenza entro 30 giorni')
      }
    }

    // Controllo lifecycle
    if (ceLabel.remainingLifespan <= 30) {
      recommendations.push('📊 LIFECYCLE: Dispositivo vicino al fine vita - Valutare sostituzione')
    }

    return recommendations
  }

  /**
   * Calcola giorni rimanenti di vita dispositivo
   */
  private calculateRemainingDays(manufacturingDate: string, lifespanMonths: number): number {
    const mfgDate = new Date(manufacturingDate)
    const endOfLife = new Date(mfgDate)
    endOfLife.setMonth(endOfLife.getMonth() + lifespanMonths)
    
    const today = new Date()
    const timeDiff = endOfLife.getTime() - today.getTime()
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  }

  /**
   * Determina stato lifecycle dispositivo
   */
  private determineLifecycleStatus(manufacturingDate: string, lifespanMonths: number): MedicalDevice['ceLabel']['lifecycleStatus'] {
    const remainingDays = this.calculateRemainingDays(manufacturingDate, lifespanMonths)
    
    if (remainingDays < 0) return 'END_OF_LIFE'
    if (remainingDays <= 30) return 'MAINTENANCE'
    
    const totalDays = lifespanMonths * 30 // Approssimazione
    const usagePercentage = ((totalDays - remainingDays) / totalDays) * 100
    
    if (usagePercentage < 10) return 'NEW'
    return 'ACTIVE'
  }

  /**
   * Calcola scadenza garanzia
   */
  private calculateWarrantyExpiry(manufacturingDate: string, warrantyMonths: number): string {
    const mfgDate = new Date(manufacturingDate)
    const warrantyExpiry = new Date(mfgDate)
    warrantyExpiry.setMonth(warrantyExpiry.getMonth() + warrantyMonths)
    return warrantyExpiry.toISOString().split('T')[0]
  }

  /**
   * METODO LEGACY - Ora utilizza readCompleteCELabel
   * Legge e valida IMEI da dispositivo SiDLY Care Pro
   * CORREZIONE: Prima non veniva letto correttamente
   */
  async readDeviceIMEI(deviceId: string): Promise<{ success: boolean; imei?: string; deviceInfo?: any; error?: string }> {
    try {
      console.log(`📱 [IMEI] Lettura IMEI dispositivo: ${deviceId}`)
      
      // Simula lettura IMEI da dispositivo fisico (in produzione: API dispositivo)
      // IMEI format: 15 digits (TAC + SNR + Luhn check digit)
      const simulatedIMEI = this.generateValidIMEI()
      
      // Verifica IMEI sia valido (Luhn algorithm)
      if (!this.validateIMEI(simulatedIMEI)) {
        return {
          success: false,
          error: 'IMEI non valido - fallito controllo Luhn'
        }
      }

      // Estrai informazioni da IMEI
      const deviceInfo = this.parseIMEIInfo(simulatedIMEI)
      
      // Aggiorna device nel database
      const device = await this.getDeviceById(deviceId)
      if (device) {
        device.imei = simulatedIMEI
        device.updatedAt = new Date().toISOString()
        // TODO: Salvare nel database D1
      }

      return {
        success: true,
        imei: simulatedIMEI,
        deviceInfo: {
          ...deviceInfo,
          readTime: new Date().toISOString(),
          deviceType: device?.deviceType || 'SiDLY_CARE_PRO'
        }
      }
      
    } catch (error) {
      console.error('❌ [IMEI] Errore lettura IMEI:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore lettura IMEI'
      }
    }
  }

  /**
   * Calcola data di scadenza dispositivo basata su data fabbricazione
   * CORREZIONE: Prima non veniva calcolata automaticamente
   */
  calculateDeviceExpiry(manufacturingDate: string, deviceType: string = 'SiDLY_CARE_PRO'): {
    expiryDate: string;
    daysRemaining: number;
    warrantyStatus: 'VALID' | 'EXPIRING' | 'EXPIRED';
    recommendedAction: string;
  } {
    try {
      const mfgDate = new Date(manufacturingDate)
      
      // Durata garanzia per tipo dispositivo (in mesi)
      const warrantyDurations: { [key: string]: number } = {
        'SiDLY_CARE_PRO': 24,      // 2 anni
        'GLUCOSE_METER': 36,       // 3 anni  
        'BLOOD_PRESSURE': 24,      // 2 anni
        'OXIMETER': 18,            // 1.5 anni
        'ECG_MONITOR': 60,         // 5 anni
        'DEFAULT': 24              // Default 2 anni
      }

      const warrantyMonths = warrantyDurations[deviceType] || warrantyDurations['DEFAULT']
      const expiryDate = new Date(mfgDate)
      expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths)

      const today = new Date()
      const timeDiff = expiryDate.getTime() - today.getTime()
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

      let warrantyStatus: 'VALID' | 'EXPIRING' | 'EXPIRED'
      let recommendedAction: string

      if (daysRemaining < 0) {
        warrantyStatus = 'EXPIRED'
        recommendedAction = '🚨 URGENTE: Sostituire dispositivo immediatamente'
      } else if (daysRemaining <= 30) {
        warrantyStatus = 'EXPIRING'  
        recommendedAction = '⚠️ ATTENZIONE: Pianificare sostituzione entro 30 giorni'
      } else {
        warrantyStatus = 'VALID'
        recommendedAction = '✅ Dispositivo in garanzia - Nessuna azione richiesta'
      }

      return {
        expiryDate: expiryDate.toISOString().split('T')[0],
        daysRemaining,
        warrantyStatus,
        recommendedAction
      }

    } catch (error) {
      console.error('❌ Errore calcolo scadenza:', error)
      return {
        expiryDate: 'N/A',
        daysRemaining: 0,
        warrantyStatus: 'EXPIRED',
        recommendedAction: '❌ Errore calcolo - Verificare data fabbricazione'
      }
    }
  }

  /**
   * Genera IMEI valido per testing (in produzione: lettura da dispositivo)
   */
  private generateValidIMEI(): string {
    // TAC (Type Allocation Code) SiDLY: 35742108 (8 cifre)
    const tac = '35742108'
    
    // SNR (Serial Number) random: 6 cifre  
    const snr = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Calcola Luhn check digit
    const partial = tac + snr
    const checkDigit = this.calculateLuhnDigit(partial)
    
    return partial + checkDigit
  }

  /**
   * Valida IMEI usando algoritmo Luhn
   */
  private validateIMEI(imei: string): boolean {
    if (imei.length !== 15 || !/^\d+$/.test(imei)) {
      return false
    }
    
    const digits = imei.split('').map(Number)
    let sum = 0
    
    for (let i = 0; i < 14; i++) {
      let digit = digits[i]
      if (i % 2 === 1) { // Posizioni dispari (1, 3, 5...)
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
    }
    
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === digits[14]
  }

  /**
   * Calcola cifra di controllo Luhn
   */
  private calculateLuhnDigit(number: string): string {
    const digits = number.split('').map(Number)
    let sum = 0
    
    for (let i = 0; i < digits.length; i++) {
      let digit = digits[i]
      if (i % 2 === 1) { // Posizioni dispari
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
    }
    
    return ((10 - (sum % 10)) % 10).toString()
  }

  /**
   * Estrae info da IMEI (TAC = tipo dispositivo, SNR = numero seriale)
   */
  private parseIMEIInfo(imei: string): { 
    tac: string; 
    snr: string; 
    manufacturer: string; 
    deviceModel: string;
    isValid: boolean;
  } {
    const tac = imei.substring(0, 8)
    const snr = imei.substring(8, 14)
    
    // Database TAC codes (in produzione: query database TAC ufficiale)
    const tacDatabase: { [key: string]: { manufacturer: string; model: string } } = {
      '35742108': { manufacturer: 'SiDLY Medical', model: 'Care Pro' },
      '35742109': { manufacturer: 'SiDLY Medical', model: 'Care Advanced' },
      '35742110': { manufacturer: 'SiDLY Medical', model: 'Care Basic' }
    }
    
    const deviceInfo = tacDatabase[tac] || { 
      manufacturer: 'Unknown', 
      model: 'Unknown Device' 
    }
    
    return {
      tac,
      snr,
      manufacturer: deviceInfo.manufacturer,
      deviceModel: deviceInfo.model,
      isValid: this.validateIMEI(imei)
    }
  }

  // =====================================================================
  // GESTIONE MULTI-LIVELLO DISPOSITIVI MEDICI - TUTTI I LIVELLI
  // =====================================================================

  /**
   * LIVELLO 1: Registrazione base dispositivo con etichetta CE completa
   */
  async registerDeviceLevel1(deviceData: {
    serialNumber: string
    deviceType: MedicalDevice['deviceType']
    customerId?: string
  }): Promise<{ success: boolean; deviceId?: string; error?: string }> {
    try {
      console.log('📱 [LIVELLO 1] Registrazione base dispositivo:', deviceData.serialNumber)
      
      const deviceId = `DEV_L1_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      // Lettura automatica etichetta CE completa
      const ceResult = await this.readCompleteCELabel(deviceId)
      if (!ceResult.success) {
        return { success: false, error: 'Impossibile leggere etichetta CE' }
      }

      // Creazione dispositivo livello base
      const device: Partial<MedicalDevice> = {
        id: deviceId,
        deviceType: deviceData.deviceType,
        serialNumber: deviceData.serialNumber,
        brand: ceResult.ceLabel?.manufacturerName || 'SiDLY Medical',
        model: ceResult.ceLabel?.modelCode || 'Care Pro',
        ceLabel: ceResult.ceLabel!,
        status: 'ACTIVE',
        connectionType: 'MANUAL',
        installDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await this.saveDevice(device as MedicalDevice)
      
      return { success: true, deviceId }
      
    } catch (error) {
      console.error('❌ [LIVELLO 1] Errore registrazione:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore registrazione livello 1' 
      }
    }
  }

  /**
   * LIVELLO 2: Configurazione avanzata con associazione cliente
   */
  async configureDeviceLevel2(deviceId: string, config: {
    customerId: string
    connectionType: MedicalDevice['connectionType']
    settings?: Partial<DeviceSettings>
    location?: MedicalDevice['location']
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('⚙️ [LIVELLO 2] Configurazione avanzata dispositivo:', deviceId)
      
      const device = await this.getDeviceById(deviceId)
      if (!device) {
        return { success: false, error: 'Dispositivo non trovato' }
      }

      // Configurazione avanzata
      device.customerId = config.customerId
      device.connectionType = config.connectionType
      device.location = config.location
      device.updatedAt = new Date().toISOString()

      // Impostazioni personalizzate
      if (config.settings) {
        device.settings = { ...device.settings, ...config.settings }
      }

      // Setup automazione e sincronizzazione
      if (config.connectionType !== 'MANUAL') {
        device.syncEnabled = true
        device.syncFrequency = 15 // Minuti
        await this.setupDeviceAutomation(device)
      }

      await this.saveDevice(device)
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ [LIVELLO 2] Errore configurazione:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore configurazione livello 2' 
      }
    }
  }

  /**
   * LIVELLO 3: Integrazione completa con monitoraggio real-time
   */
  async enableDeviceLevel3(deviceId: string, integration: {
    enableRealTimeMonitoring: boolean
    enableAlerting: boolean
    enableGoogleSheets?: boolean
    googleSheetId?: string
    enableDoctorIntegration?: boolean
    doctorEmail?: string
    emergencyContacts?: string[]
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 [LIVELLO 3] Integrazione completa dispositivo:', deviceId)
      
      const device = await this.getDeviceById(deviceId)
      if (!device) {
        return { success: false, error: 'Dispositivo non trovato' }
      }

      // Attivazione monitoraggio real-time
      if (integration.enableRealTimeMonitoring) {
        await this.enableRealTimeMonitoring(device)
      }

      // Setup alerting avanzato
      if (integration.enableAlerting) {
        await this.setupAdvancedAlerting(device, integration.emergencyContacts)
      }

      // Integrazione Google Sheets
      if (integration.enableGoogleSheets && integration.googleSheetId) {
        device.googleSheetId = integration.googleSheetId
        await this.setupGoogleSheetsIntegration(device)
      }

      // Integrazione medico
      if (integration.enableDoctorIntegration && integration.doctorEmail) {
        await this.setupDoctorIntegration(device, integration.doctorEmail)
      }

      device.updatedAt = new Date().toISOString()
      await this.saveDevice(device)
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ [LIVELLO 3] Errore integrazione:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore integrazione livello 3' 
      }
    }
  }

  /**
   * LIVELLO 4: Analytics e AI predittiva
   */
  async enableDeviceLevel4(deviceId: string, analytics: {
    enablePredictiveAnalytics: boolean
    enableTrendAnalysis: boolean
    enableAnomalyDetection: boolean
    enablePersonalizedRecommendations: boolean
    aiModelType?: 'BASIC' | 'ADVANCED' | 'ENTERPRISE'
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧠 [LIVELLO 4] Analytics e AI dispositivo:', deviceId)
      
      const device = await this.getDeviceById(deviceId)
      if (!device) {
        return { success: false, error: 'Dispositivo non trovato' }
      }

      // Configurazione AI e Analytics
      const aiConfig = {
        deviceId,
        predictiveAnalytics: analytics.enablePredictiveAnalytics,
        trendAnalysis: analytics.enableTrendAnalysis,
        anomalyDetection: analytics.enableAnomalyDetection,
        personalizedRecommendations: analytics.enablePersonalizedRecommendations,
        aiModel: analytics.aiModelType || 'BASIC',
        enabledAt: new Date().toISOString()
      }

      // Setup machine learning pipeline
      await this.setupMLPipeline(device, aiConfig)

      // Inizializzazione baseline per AI
      await this.initializeAIBaseline(device)

      device.updatedAt = new Date().toISOString()
      await this.saveDevice(device)
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ [LIVELLO 4] Errore setup AI:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore setup AI livello 4' 
      }
    }
  }

  /**
   * LIVELLO 5: Integrazione Enterprise e compliance completa
   */
  async enableDeviceLevel5(deviceId: string, enterprise: {
    enableHISIntegration: boolean    // Health Information System
    enableHL7Integration: boolean    // HL7 FHIR
    enableGDPRCompliance: boolean   // GDPR compliance completa
    enableAuditTrail: boolean       // Audit trail completo
    enableRegulatoryReporting: boolean // Report automatici enti regolatori
    enableMultiTenancy: boolean     // Support multi-tenant
    organizationId?: string
    complianceLevel: 'BASIC' | 'HEALTHCARE' | 'ENTERPRISE' | 'GOVERNMENT'
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🏢 [LIVELLO 5] Integrazione Enterprise:', deviceId)
      
      const device = await this.getDeviceById(deviceId)
      if (!device) {
        return { success: false, error: 'Dispositivo non trovato' }
      }

      // Setup integrazione HIS
      if (enterprise.enableHISIntegration) {
        await this.setupHISIntegration(device, enterprise.organizationId!)
      }

      // Setup HL7 FHIR
      if (enterprise.enableHL7Integration) {
        await this.setupHL7Integration(device)
      }

      // Setup GDPR compliance
      if (enterprise.enableGDPRCompliance) {
        await this.setupGDPRCompliance(device)
      }

      // Setup audit trail
      if (enterprise.enableAuditTrail) {
        await this.setupAuditTrail(device)
      }

      // Setup regulatory reporting
      if (enterprise.enableRegulatoryReporting) {
        await this.setupRegulatoryReporting(device, enterprise.complianceLevel)
      }

      device.updatedAt = new Date().toISOString()
      await this.saveDevice(device)
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ [LIVELLO 5] Errore setup Enterprise:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore setup Enterprise livello 5' 
      }
    }
  }

  // =====================================================================
  // HELPER METHODS PER I LIVELLI
  // =====================================================================

  private async setupDeviceAutomation(device: MedicalDevice): Promise<void> {
    console.log(`🤖 Setup automazione dispositivo: ${device.id}`)
    // TODO: Configurazione automazione letture, sync, notifiche
  }

  private async enableRealTimeMonitoring(device: MedicalDevice): Promise<void> {
    console.log(`📡 Attivazione monitoraggio real-time: ${device.id}`)
    // TODO: Setup WebSocket, streaming dati, dashboard real-time
  }

  private async setupAdvancedAlerting(device: MedicalDevice, emergencyContacts?: string[]): Promise<void> {
    console.log(`🚨 Setup alerting avanzato: ${device.id}`)
    // TODO: Configurazione alert multi-livello, escalation automatica
  }

  private async setupDoctorIntegration(device: MedicalDevice, doctorEmail: string): Promise<void> {
    console.log(`👨‍⚕️ Setup integrazione medico: ${device.id} -> ${doctorEmail}`)
    // TODO: Configurazione invio automatico report medico
  }

  private async setupMLPipeline(device: MedicalDevice, aiConfig: any): Promise<void> {
    console.log(`🧠 Setup pipeline ML: ${device.id}`)
    // TODO: Configurazione machine learning per analisi predittiva
  }

  private async initializeAIBaseline(device: MedicalDevice): Promise<void> {
    console.log(`📊 Inizializzazione baseline AI: ${device.id}`)
    // TODO: Creazione baseline dati per algoritmi AI
  }

  private async setupHISIntegration(device: MedicalDevice, organizationId: string): Promise<void> {
    console.log(`🏥 Setup integrazione HIS: ${device.id} -> ${organizationId}`)
    // TODO: Integrazione con Health Information Systems
  }

  private async setupHL7Integration(device: MedicalDevice): Promise<void> {
    console.log(`📋 Setup HL7 FHIR: ${device.id}`)
    // TODO: Configurazione standard HL7 FHIR per interoperabilità
  }

  private async setupGDPRCompliance(device: MedicalDevice): Promise<void> {
    console.log(`🔒 Setup GDPR compliance: ${device.id}`)
    // TODO: Configurazione completa conformità GDPR
  }

  private async setupAuditTrail(device: MedicalDevice): Promise<void> {
    console.log(`📝 Setup audit trail: ${device.id}`)
    // TODO: Configurazione logging completo per audit
  }

  private async setupRegulatoryReporting(device: MedicalDevice, complianceLevel: string): Promise<void> {
    console.log(`📊 Setup regulatory reporting: ${device.id} -> ${complianceLevel}`)
    // TODO: Configurazione report automatici per enti regolatori
  }
}

// =====================================================================
// EXPORT DEFAULTS
// =====================================================================

export default DeviceManager