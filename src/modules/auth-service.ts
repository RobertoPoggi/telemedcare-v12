/**
 * AUTH SERVICE - Sistema autenticazione con ruoli
 * TeleMedCare V12.0
 * 
 * Ruoli:
 * - ADMIN: Accesso completo (Roberto Poggi, Stefania Rocca)
 * - OPERATOR: Solo lettura e operazioni base (no delete/modify)
 */

export type UserRole = 'ADMIN' | 'OPERATOR'

export interface User {
  id: string
  username: string
  role: UserRole
  full_name: string
  email?: string
  last_login?: string
}

export interface AuthSession {
  userId: string
  username: string
  role: UserRole
  loginAt: string
  expiresAt: string
}

/**
 * Hash password con SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verifica password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password)
  return inputHash === hash
}

/**
 * Genera session token
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Crea sessione (durata 8 ore)
 */
export function createSession(user: User): AuthSession {
  const now = Date.now()
  const expiresAt = now + (8 * 60 * 60 * 1000) // 8 ore
  
  return {
    userId: user.id,
    username: user.username,
    role: user.role,
    loginAt: new Date(now).toISOString(),
    expiresAt: new Date(expiresAt).toISOString()
  }
}

/**
 * Verifica se sessione è valida
 */
export function isSessionValid(session: AuthSession): boolean {
  const now = Date.now()
  const expires = new Date(session.expiresAt).getTime()
  return now < expires
}

/**
 * Verifica permessi per operazione
 */
export function hasPermission(role: UserRole, operation: string): boolean {
  // ADMIN può tutto
  if (role === 'ADMIN') return true
  
  // OPERATOR: permessi limitati
  const operatorPermissions = [
    'read:leads',
    'read:contracts',
    'read:proforma',
    'create:leads',
    'update:lead:status',
    'update:lead:notes',
    'read:dashboard'
  ]
  
  return operatorPermissions.includes(operation)
}

/**
 * Inizializza utenti default (da chiamare solo una volta)
 */
export async function initializeDefaultUsers(db: D1Database): Promise<void> {
  try {
    // Hash password
    const robertoHash = await hashPassword('TpfhJpDgrSIE8yDEeVy+fA==')
    const stefaniaHash = await hashPassword('TBV8JicyE3nkpUVI2/2igA==')
    const operatorHash = await hashPassword('xpD7JrCIC9ATHWnF1ULvzA==')
    
    const now = new Date().toISOString()
    
    // Inserisci utenti (ignora se già esistono)
    await db.batch([
      db.prepare(`
        INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, email, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        'USER-001',
        'roberto.poggi',
        robertoHash,
        'ADMIN',
        'Roberto Poggi',
        'rpoggi55@gmail.com',
        now,
        now
      ),
      
      db.prepare(`
        INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, email, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        'USER-002',
        'stefania.rocca',
        stefaniaHash,
        'ADMIN',
        'Stefania Rocca',
        'info@medicagb.it',
        now,
        now
      ),
      
      db.prepare(`
        INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        'USER-003',
        'operator',
        operatorHash,
        'OPERATOR',
        'Operatore Staff',
        now,
        now
      )
    ])
    
    console.log('✅ Utenti default inizializzati')
  } catch (error) {
    console.error('❌ Errore inizializzazione utenti:', error)
    throw error
  }
}
