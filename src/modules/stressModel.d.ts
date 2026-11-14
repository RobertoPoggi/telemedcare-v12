export const PENDENZA: number
export const ANCORAGGIO: number
export const SOGLIE_FASCE: number[]
export const NOMI_FASCE: string[]
export const COLORI_BARRE: string[]
export const COLORI_CARD: string[]
export const FINESTRA_GIORNI: number
export const MIN_GIORNI_STORICO: number
export const GIORNI_BASELINE_ROLLING: number
export const AFFIDABILITA: number
export const GIORNI_MEDIA: number
export const GIORNI_PICCO: number
export const MOTIVO_STORICO_INSUFFICIENTE: string

export interface GiornoHrv { giorno: string; somma: number; n: number }
export interface PuntoIndividuale { giorno: string; indice: number | null; fascia: string | null; rmssd_3gg: number; baseline: number | null }
export interface PuntoPlatea { giorno: string; indice: number; fascia: string | null; rmssd_3gg: number; n_assistiti: number }
export interface SerieIndividuale { ok: boolean; motivo: string | null; giorni_storico: number; baseline: number | null; serie: PuntoIndividuale[] }
export interface Fascia { nome: string; da: number; a: number; colore_barra: string; colore_card: string }
export interface Riepilogo {
  indice_attuale: number | null; fascia: string | null; giorno_attuale: string | null; rmssd_3gg: number | null
  indice_medio_30gg: number | null; picco_90gg: number | null; fascia_picco: string | null; data_picco: string | null
}

export function intervalliFasce(): Fascia[]
export function testiStress(): { descrizione: string; limiti: string; formula: string }
export function clamp(x: number, min: number, max: number): number
export function indiceStress(baseline: number, rmssd3gg: number): number | null
export function numeroFascia(indice: number): number
export function fasciaStress(indice: number | null | undefined): string | null
export function giornoANumero(g: string): number
export function numeroAGiorno(n: number): string
export function normalizzaGiorni(righe: GiornoHrv[]): GiornoHrv[]
export function mediaMobileAdattiva(righe: GiornoHrv[], finestra?: number): { giorno: string; rmssd_giorno: number; rmssd_3gg: number; giorni_finestra: number }[]
export function baselineStorico(righe: GiornoHrv[], modo?: 'full' | 'rolling60', giornoRif?: string | null): number | null
export function serieIndividuale(righe: GiornoHrv[], opzioni?: { baseline?: 'full' | 'rolling60' }): SerieIndividuale
export function aggregaPlatea(listaSerie: PuntoIndividuale[][]): PuntoPlatea[]
export function riepilogoSerie(serie: { giorno: string; indice: number | null; fascia: string | null; rmssd_3gg: number }[], oggi: string): Riepilogo
export function distribuzioneFasce(listaSerie: { giorno: string; indice: number | null }[][], oggi: string, giorni?: number): Record<string, number>
