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
  // Mock database in memory - Dataset realistico per magazzino DM
  private mockData: Dispositivo[] = [
    {
      id: 1,
      device_id: 'DM-001',
      imei: '860123456789012',
      manufacturer: 'SiDLY Care',
      model: 'Pro V2.1',
      lot_number: 'LOT2024001',
      expiry_date: '2026-12-31',
      udi_code: '(01)12345678901234(17)251231(10)LOT2024001',
      ce_marking: true,
      status: 'INVENTORY',
      magazzino: 'Milano Centrale',
      assigned_to: null,
      assigned_date: null,
      note: 'Dispositivo nuovo, pronto per assegnazione',
      created_at: new Date('2024-01-15').toISOString(),
      updated_at: new Date('2024-01-15').toISOString()
    },
    {
      id: 2,
      device_id: 'DM-002',
      imei: '860987654321098',
      manufacturer: 'SiDLY Care',
      model: 'Pro V2.1',
      lot_number: 'LOT2024002',
      expiry_date: '2026-12-31',
      udi_code: '(01)12345678901234(17)251231(10)LOT2024002',
      ce_marking: true,
      status: 'ASSIGNED',
      magazzino: 'Roma Sud',
      assigned_to: 'LEAD_001',
      assigned_date: new Date('2024-02-10').toISOString(),
      note: 'Assegnato per contratto premium',
      created_at: new Date('2024-01-20').toISOString(),
      updated_at: new Date('2024-02-10').toISOString()
    },
    {
      id: 3,
      device_id: 'DM-003',
      imei: '860555666777888',
      manufacturer: 'SiDLY Care',
      model: 'Basic V1.8',
      lot_number: 'LOT2024003',
      expiry_date: '2026-06-30',
      udi_code: '(01)12345678901234(17)260630(10)LOT2024003',
      ce_marking: true,
      status: 'DELIVERED',
      magazzino: 'Milano Centrale',
      assigned_to: 'LEAD_002',
      assigned_date: new Date('2024-02-15').toISOString(),
      note: 'Consegnato e attivato',
      created_at: new Date('2024-01-25').toISOString(),
      updated_at: new Date('2024-03-01').toISOString()
    },
    {
      id: 4,
      device_id: 'DM-004',
      imei: '860111222333444',
      manufacturer: 'SiDLY Care',
      model: 'Pro V2.1',
      lot_number: 'LOT2024004',
      expiry_date: '2026-12-31',
      udi_code: '(01)12345678901234(17)251231(10)LOT2024004',
      ce_marking: true,
      status: 'INVENTORY',
      magazzino: 'Napoli',
      assigned_to: null,
      assigned_date: null,
      note: 'In stock, controllo qualità superato',
      created_at: new Date('2024-02-01').toISOString(),
      updated_at: new Date('2024-02-01').toISOString()
    },
    {
      id: 5,
      device_id: 'DM-005',
      imei: '860999888777666',
      manufacturer: 'SiDLY Care',
      model: 'Premium V3.0',
      lot_number: 'LOT2024005',
      expiry_date: '2027-03-31',
      udi_code: '(01)12345678901234(17)270331(10)LOT2024005',
      ce_marking: true,
      status: 'INVENTORY',
      magazzino: 'Milano Centrale',
      assigned_to: null,
      assigned_date: null,
      note: 'Ultimo modello disponibile',
      created_at: new Date('2024-02-20').toISOString(),
      updated_at: new Date('2024-02-20').toISOString()
    },
    {
      id: 6,
      device_id: 'DM-006',
      imei: '860444555666777',
      manufacturer: 'SiDLY Care',
      model: 'Basic V1.8',
      lot_number: 'LOT2024006',
      expiry_date: '2026-06-30',
      udi_code: '(01)12345678901234(17)260630(10)LOT2024006',
      ce_marking: true,
      status: 'ASSIGNED',
      magazzino: 'Roma Sud',
      assigned_to: 'LEAD_003',
      assigned_date: new Date('2024-03-05').toISOString(),
      note: 'Assegnato per trial gratuito',
      created_at: new Date('2024-02-25').toISOString(),
      updated_at: new Date('2024-03-05').toISOString()
    },
    {
      id: 7,
      device_id: 'DM-007',
      imei: '860777888999000',
      manufacturer: 'SiDLY Care',
      model: 'Pro V2.1',
      lot_number: 'LOT2024007',
      expiry_date: '2026-12-31',
      udi_code: '(01)12345678901234(17)251231(10)LOT2024007',
      ce_marking: true,
      status: 'DELIVERED',
      magazzino: 'Torino',
      assigned_to: 'LEAD_004',
      assigned_date: new Date('2024-01-30').toISOString(),
      note: 'Attivato con successo',
      created_at: new Date('2024-01-10').toISOString(),
      updated_at: new Date('2024-02-15').toISOString()
    },
    {
      id: 8,
      device_id: 'DM-008',
      imei: '860333444555666',
      manufacturer: 'SiDLY Care',
      model: 'Premium V3.0',
      lot_number: 'LOT2024008',
      expiry_date: '2027-03-31',
      udi_code: '(01)12345678901234(17)270331(10)LOT2024008',
      ce_marking: true,
      status: 'INVENTORY',
      magazzino: 'Napoli',
      assigned_to: null,
      assigned_date: null,
      note: 'Dispositivo premium in magazzino',
      created_at: new Date('2024-03-01').toISOString(),
      updated_at: new Date('2024-03-01').toISOString()
    },
    {
      id: 9,
      device_id: 'DM-009',
      imei: '860666777888999',
      manufacturer: 'SiDLY Care',
      model: 'Basic V1.8',
      lot_number: 'LOT2024009',
      expiry_date: '2026-06-30',
      udi_code: '(01)12345678901234(17)260630(10)LOT2024009',
      ce_marking: true,
      status: 'REPLACED',
      magazzino: 'Milano Centrale',
      assigned_to: 'LEAD_005',
      assigned_date: new Date('2024-01-20').toISOString(),
      note: 'Sostituito per malfunzionamento',
      created_at: new Date('2024-01-05').toISOString(),
      updated_at: new Date('2024-02-28').toISOString()
    },
    {
      id: 10,
      device_id: 'DM-010',
      imei: '860000111222333',
      manufacturer: 'SiDLY Care',
      model: 'Pro V2.1',
      lot_number: 'LOT2024010',
      expiry_date: '2026-12-31',
      udi_code: '(01)12345678901234(17)251231(10)LOT2024010',
      ce_marking: true,
      status: 'INVENTORY',
      magazzino: 'Torino',
      assigned_to: null,
      assigned_date: null,
      note: 'Pronto per spedizione',
      created_at: new Date('2024-03-10').toISOString(),
      updated_at: new Date('2024-03-10').toISOString()
    },
    {
      id: 11,
      device_id: 'DM-011',
      imei: '860222333444555',
      manufacturer: 'SiDLY Care',
      model: 'Premium V3.0',
      lot_number: 'LOT2024011',
      expiry_date: '2027-03-31',
      udi_code: '(01)12345678901234(17)270331(10)LOT2024011',
      ce_marking: true,
      status: 'ASSIGNED',
      magazzino: 'Roma Sud',
      assigned_to: 'LEAD_006',
      assigned_date: new Date('2024-03-12').toISOString(),
      note: 'Cliente premium - priorità alta',
      created_at: new Date('2024-03-08').toISOString(),
      updated_at: new Date('2024-03-12').toISOString()
    },
    {
      id: 12,
      device_id: 'DM-012',
      imei: '860888999000111',
      manufacturer: 'SiDLY Care',
      model: 'Basic V1.8',
      lot_number: 'LOT2024012',
      expiry_date: '2026-06-30',
      udi_code: '(01)12345678901234(17)260630(10)LOT2024012',
      ce_marking: true,
      status: 'INVENTORY',
      magazzino: 'Milano Centrale',
      assigned_to: null,
      assigned_date: null,
      note: 'Stock di sicurezza',
      created_at: new Date('2024-03-15').toISOString(),
      updated_at: new Date('2024-03-15').toISOString()
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
  }): Promise<any[]> {
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

    // Converte formato per compatibilità con warehouse API
    return results.map(d => ({
      id: d.device_id,
      imei: d.imei,
      modello: d.model || 'SiDLY Pro V2.1',
      magazzino: d.magazzino,
      status: this.convertStatus(d.status),
      udi: d.udi_code || '',
      ce: d.ce_marking ? 'Si' : 'No',
      assignedTo: d.assigned_to || '',
      dataRegistrazione: d.created_at,
      dataUltimoAggiornamento: d.updated_at,
      valore: 450,
      note: d.note || ''
    }))
  }

  /**
   * Converte status interno a formato warehouse
   */
  private convertStatus(status: Dispositivo['status']): string {
    const statusMap = {
      'INVENTORY': 'DISPONIBILE',
      'ASSIGNED': 'ASSEGNATO', 
      'DELIVERED': 'SPEDITO',
      'REPLACED': 'SOSTITUITO'
    }
    return statusMap[status] || 'DISPONIBILE'
  }

  /**
   * Converte status warehouse a formato interno
   */
  private convertStatusToInternal(status: string): Dispositivo['status'] {
    const statusMap = {
      'DISPONIBILE': 'INVENTORY',
      'IN_STOCK': 'INVENTORY',
      'ASSEGNATO': 'ASSIGNED',
      'SPEDITO': 'DELIVERED',
      'CONSEGNATO': 'DELIVERED',
      'ATTIVO': 'DELIVERED',
      'IN_USO': 'DELIVERED',
      'SOSTITUITO': 'REPLACED'
    }
    return (statusMap[status] as Dispositivo['status']) || 'INVENTORY'
  }

  /**
   * Aggiungi nuovo dispositivo
   */
  async addDevice(deviceData: any): Promise<{
    success: boolean
    device?: any
    error?: string
  }> {
    try {
      // Verifica IMEI duplicati
      const existingDevice = this.mockData.find(d => d.imei === deviceData.imei)
      if (existingDevice) {
        return {
          success: false,
          error: `Dispositivo con IMEI ${deviceData.imei} già registrato`
        }
      }

      // Crea nuovo dispositivo
      const newDevice: Dispositivo = {
        id: this.mockData.length + 1,
        device_id: deviceData.id,
        imei: deviceData.imei,
        manufacturer: 'SiDLY Care',
        model: deviceData.modello,
        lot_number: null,
        expiry_date: null,
        udi_code: deviceData.udi || null,
        ce_marking: deviceData.ce === 'Si',
        status: this.convertStatusToInternal(deviceData.status),
        magazzino: deviceData.magazzino,
        assigned_to: deviceData.assignedTo || null,
        assigned_date: deviceData.assignedTo ? new Date().toISOString() : null,
        note: deviceData.note || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      this.mockData.push(newDevice)

      return {
        success: true,
        device: {
          id: deviceData.id,
          imei: deviceData.imei,
          modello: deviceData.modello,
          magazzino: deviceData.magazzino,
          status: deviceData.status,
          udi: deviceData.udi || '',
          ce: deviceData.ce || 'No',
          assignedTo: deviceData.assignedTo || '',
          dataRegistrazione: new Date().toISOString(),
          dataUltimoAggiornamento: new Date().toISOString(),
          valore: 450,
          note: deviceData.note || ''
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante aggiunta dispositivo'
      }
    }
  }

  /**
   * Aggiorna dispositivo esistente
   */
  async updateDevice(deviceId: string, updateData: any): Promise<{
    success: boolean
    device?: any
    error?: string
  }> {
    try {
      const deviceIndex = this.mockData.findIndex(d => d.device_id === deviceId)
      if (deviceIndex === -1) {
        return {
          success: false,
          error: `Dispositivo ${deviceId} non trovato`
        }
      }

      const device = this.mockData[deviceIndex]
      
      // Aggiorna i campi specificati
      if (updateData.status) {
        device.status = this.convertStatusToInternal(updateData.status)
      }
      if (updateData.magazzino) {
        device.magazzino = updateData.magazzino
      }
      if (updateData.assignedTo !== undefined) {
        device.assigned_to = updateData.assignedTo || null
        device.assigned_date = updateData.assignedTo ? new Date().toISOString() : null
      }
      if (updateData.note !== undefined) {
        device.note = updateData.note
      }
      if (updateData.dataUltimoAggiornamento) {
        device.updated_at = updateData.dataUltimoAggiornamento
      }

      return {
        success: true,
        device: {
          id: device.device_id,
          imei: device.imei,
          modello: device.model || 'SiDLY Pro V2.1',
          magazzino: device.magazzino,
          status: this.convertStatus(device.status),
          udi: device.udi_code || '',
          ce: device.ce_marking ? 'Si' : 'No',
          assignedTo: device.assigned_to || '',
          dataRegistrazione: device.created_at,
          dataUltimoAggiornamento: device.updated_at,
          valore: 450,
          note: device.note || ''
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante aggiornamento dispositivo'
      }
    }
  }

  /**
   * Elimina dispositivo
   */
  async deleteDevice(deviceId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const deviceIndex = this.mockData.findIndex(d => d.device_id === deviceId)
      if (deviceIndex === -1) {
        return {
          success: false,
          error: `Dispositivo ${deviceId} non trovato`
        }
      }

      this.mockData.splice(deviceIndex, 1)

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante eliminazione dispositivo'
      }
    }
  }
}

// Export singleton instance per mock testing
export const dispositiviTestService = new DispositiviTestService()
export default DispositiviTestService