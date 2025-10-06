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
             'ACTIVITY_TRACKER' | 'NEBULIZER' | 'PILL_DISPENSER'
  brand: string
  model: string
  serialNumber: string
  
  // Identificazione univoca
  macAddress?: string
  bluetoothId?: string
  wifiMac?: string
  imei?: string // Per dispositivi cellulari
  
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
}

// =====================================================================
// EXPORT DEFAULTS
// =====================================================================

export default DeviceManager