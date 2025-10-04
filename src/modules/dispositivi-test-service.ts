/**
 * DISPOSITIVI TEST SERVICE - Mock per testing senza D1
 * Simula il comportamento del DispositiviService per testing locale
 */

export interface Dispositivo {
  id: number
  device_id: string
  imei: string
  manufacturer: string | null
  model: string | null
  lot_number: string | null
  expiry_date: string | null
  udi_code: string | null
  ce_marking: boolean
  status: 'INVENTORY' | 'ASSIGNED' | 'DELIVERED' | 'REPLACED'
  magazzino: string
  assigned_to: string | null
  assigned_date: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface DeviceRegistrationData {
  device_id: string
  imei: string
  manufacturer?: string
  model?: string
  lot_number?: string
  expiry_date?: string
  udi_code?: string
  ce_marking?: boolean
  magazzino?: string
  note?: string
}

class DispositiviTestService {
  // Mock database in memory
  private mockData: Dispositivo[] = [
    {
      id: 1,
      device_id: 'SIDLY001',
      imei: '860123456789012',
      manufacturer: 'SiDLY Care',
      model: 'Pro V2.1',
      lot_number: 'LOT2024001',
      expiry_date: '2026-12-31',
      udi_code: '(01)12345678901234(17)251231(10)LOT2024001',
      ce_marking: true,
      status: 'INVENTORY',
      magazzino: 'Milano',
      assigned_to: null,
      assigned_date: null,
      note: 'Dispositivo pronto per assegnazione',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      device_id: 'SIDLY002',
      imei: '860987654321098',
      manufacturer: 'SiDLY Care',
      model: 'Pro V2.1',
      lot_number: 'LOT2024002',
      expiry_date: '2026-12-31',
      udi_code: '(01)12345678901234(17)251231(10)LOT2024002',
      ce_marking: true,
      status: 'ASSIGNED',
      magazzino: 'Roma',
      assigned_to: 'lead_123',
      assigned_date: new Date().toISOString(),
      note: 'Assegnato a nuovo cliente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  /**
   * Registra nuovo dispositivo da etichetta SiDLY
   */
  async registerDevice(data: DeviceRegistrationData): Promise<{
    success: boolean
    device?: Dispositivo
    error?: string
  }> {
    try {
      // Verifica IMEI duplicati
      const existingDevice = this.mockData.find(d => d.imei === data.imei)
      if (existingDevice) {
        return {
          success: false,
          error: `Dispositivo con IMEI ${data.imei} già registrato`
        }
      }

      // Verifica device_id duplicati
      const existingId = this.mockData.find(d => d.device_id === data.device_id)
      if (existingId) {
        return {
          success: false,
          error: `Dispositivo con ID ${data.device_id} già registrato`
        }
      }

      // Crea nuovo dispositivo
      const newDevice: Dispositivo = {
        id: this.mockData.length + 1,
        device_id: data.device_id,
        imei: data.imei,
        manufacturer: data.manufacturer || null,
        model: data.model || null,
        lot_number: data.lot_number || null,
        expiry_date: data.expiry_date || null,
        udi_code: data.udi_code || null,
        ce_marking: data.ce_marking || false,
        status: 'INVENTORY',
        magazzino: data.magazzino || 'Milano',
        assigned_to: null,
        assigned_date: null,
        note: data.note || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      this.mockData.push(newDevice)

      return {
        success: true,
        device: newDevice
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante registrazione dispositivo'
      }
    }
  }

  /**
   * Ottieni dispositivo per IMEI
   */
  async getDeviceByImei(imei: string): Promise<Dispositivo | null> {
    return this.mockData.find(d => d.imei === imei) || null
  }

  /**
   * Ottieni dispositivo per device_id
   */
  async getDeviceById(device_id: string): Promise<Dispositivo | null> {
    return this.mockData.find(d => d.device_id === device_id) || null
  }

  /**
   * Lista dispositivi per magazzino
   */
  async getDevicesByWarehouse(magazzino: string): Promise<Dispositivo[]> {
    return this.mockData.filter(d => d.magazzino === magazzino)
  }

  /**
   * Lista dispositivi per stato
   */
  async getDevicesByStatus(status: Dispositivo['status']): Promise<Dispositivo[]> {
    return this.mockData.filter(d => d.status === status)
  }

  /**
   * Assegna dispositivo a lead
   */
  async assignDeviceToLead(device_id: string, lead_id: string): Promise<{
    success: boolean
    device?: Dispositivo
    error?: string
  }> {
    try {
      const device = this.mockData.find(d => d.device_id === device_id)
      if (!device) {
        return {
          success: false,
          error: `Dispositivo ${device_id} non trovato`
        }
      }

      if (device.status !== 'INVENTORY') {
        return {
          success: false,
          error: `Dispositivo ${device_id} non disponibile (status: ${device.status})`
        }
      }

      // Aggiorna stato dispositivo
      device.status = 'ASSIGNED'
      device.assigned_to = lead_id
      device.assigned_date = new Date().toISOString()
      device.updated_at = new Date().toISOString()

      return {
        success: true,
        device
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante assegnazione dispositivo'
      }
    }
  }

  /**
   * Ottieni statistiche dispositivi
   */
  async getDeviceStats(): Promise<{
    total: number
    inventory: number
    assigned: number
    delivered: number
    replaced: number
    by_warehouse: Record<string, number>
  }> {
    const stats = {
      total: this.mockData.length,
      inventory: this.mockData.filter(d => d.status === 'INVENTORY').length,
      assigned: this.mockData.filter(d => d.status === 'ASSIGNED').length,
      delivered: this.mockData.filter(d => d.status === 'DELIVERED').length,
      replaced: this.mockData.filter(d => d.status === 'REPLACED').length,
      by_warehouse: {} as Record<string, number>
    }

    // Conta per magazzino
    for (const device of this.mockData) {
      stats.by_warehouse[device.magazzino] = (stats.by_warehouse[device.magazzino] || 0) + 1
    }

    return stats
  }

  /**
   * Lista tutti i dispositivi con filtri opzionali
   */
  async listDevices(filters?: {
    magazzino?: string
    status?: Dispositivo['status']
    assigned_to?: string
  }): Promise<Dispositivo[]> {
    let results = [...this.mockData]

    if (filters?.magazzino) {
      results = results.filter(d => d.magazzino === filters.magazzino)
    }

    if (filters?.status) {
      results = results.filter(d => d.status === filters.status)
    }

    if (filters?.assigned_to) {
      results = results.filter(d => d.assigned_to === filters.assigned_to)
    }

    return results
  }
}

// Export singleton instance per mock testing
export const dispositiviTestService = new DispositiviTestService()
export default DispositiviTestService