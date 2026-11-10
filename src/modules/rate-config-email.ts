/**
 * Regola unica: quando la mail di configurazione va inviata dal PATCH di una rata.
 * Solo alla transizione "rata n.1 -> PAGATA" e solo se il lead non l'ha gia' ricevuta.
 * Le rate 2, 3, 4... e i salvataggi ripetuti non devono mai attivarla.
 */
export interface RataPrima { numero_rata?: number | string | null; status?: string | null }

export function shouldSendConfigEmail(
  rataPrima: RataPrima | null | undefined,
  nuovoStatus: string,
  leadStatus: string | null | undefined
): boolean {
  if (nuovoStatus !== 'PAGATA') return false
  if (!rataPrima) return false
  if (Number(rataPrima.numero_rata) !== 1) return false
  if (rataPrima.status === 'PAGATA') return false
  const s = leadStatus || ''
  return s !== 'CONFIGURATION_SENT' && s !== 'CONFIGURED'
}
