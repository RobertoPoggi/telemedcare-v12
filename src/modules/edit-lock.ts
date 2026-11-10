// Blocco dei dati dell'intestatario dopo la firma del contratto (pagina pubblica modifica-dati).
// Una volta firmato il contratto, questi campi non sono più modificabili dal lead: il server li scarta sempre,
// la pagina li mostra solo in lettura.

export const INTESTATARIO_LOCKED_FIELDS = [
  'intestatarioContratto', 'cfIntestatario', 'codiceFiscaleIntestatario',
  'dataNascitaIntestatario', 'luogoNascitaIntestatario',
  'indirizzoIntestatario', 'cittaIntestatario', 'capIntestatario', 'provinciaIntestatario',
] as const

/** Contratto firmato = lead in CONTRACT_SIGNED oppure almeno un contratto con status SIGNED/firmato. */
export async function isContractSigned(db: any, leadId: string, leadStatus?: string | null): Promise<boolean> {
  if (leadStatus === 'CONTRACT_SIGNED') return true
  try {
    const r = await db.prepare(
      `SELECT id FROM contracts WHERE leadId = ? AND status IN ('SIGNED','firmato') LIMIT 1`
    ).bind(leadId).first()
    return !!r
  } catch (_) { return false }
}

/** Rimuove dal body i campi bloccati (se locked) e restituisce l'elenco dei campi scartati. Modifica `body` in place. */
export function stripLockedIntestatario(body: Record<string, any>, locked: boolean): string[] {
  const ignored: string[] = []
  if (!locked) return ignored
  for (const f of INTESTATARIO_LOCKED_FIELDS) {
    if (f in body) { delete body[f]; ignored.push(f) }
  }
  return ignored
}
