# Telemetria SiDLY: storico misure degli assistiti eCura (solo lettura da API SiDLY)

Codice: `src/modules/sidly-telemetria.ts`. Test: `tests/seo-report/sidly-telemetria-tests.ts` (SQLite vero via sql.js, rete finta).

## Principi (decisione del titolare, NON derogabili)
1. I dati passano **sempre da SiDLY**: il CRM li legge con chiamate GET alle API SiDLY. Il CRM **non riceve frame** dai braccialetti (nessun endpoint di ricezione, nessuna decifratura).
2. Il CRM **non scrive mai URL sui braccialetti** (nessuna chiamata `set-url-for-band` / `delete-url-for-band`). Le impostazioni dei dispositivi non vengono toccate dalla telemetria.
3. Uso **esclusivamente statistico**, non gestionale/operativo.
4. Assistiti e caregiver continuano a usare la piattaforma SiDLY.

I test (sezione 12 di `sidly-telemetria-tests.ts` e test "regola titolare" in `sidly-tests.ts`) verificano che nel codice non compaiano queste funzioni e che la telemetria faccia solo GET verso SiDLY.

## Cosa si legge da SiDLY (solo GET)
- `GET /patient/{imei}/stats?fromDate&toDate` (UTC): FC, SpO2, temperatura, passi, FR, HRV (SDNN, RMSSD), FC a riposo.
- `GET /patientIntegrateAlarm/{imei}`: allarmi (sos, fall, zone, immo, call, info, sos_cpl).
- `GET /patientIntegrate/{imei}`: solo per la data di registrazione del bracciale (`registerDate`).
- Non disponibili: stress, sonno, indice di attivita'.

## Tabelle (side table, nessun ALTER su leads: limite D1 di 100 colonne)
- `sidly_misure(imei, ts)`: una riga per istante con tutte le metriche in colonne; `fonte` sempre `stats`; un NULL non cancella un valore.
- `sidly_eventi(imei, ts, tipo)`: allarmi letti da SiDLY, `origine` = `api`.
- `sidly_stato(imei)`: cursore dello storico, righe lette, ultimo errore, `registrato_ts` (data di attivazione del bracciale), `completo_ts` (ultimo aggiornamento completo).
- Create con `CREATE TABLE IF NOT EXISTS` solo da percorsi di scrittura; le letture non creano nulla.

**Dataset delle misure**: `sidly_misure` si esporta in CSV con `GET /api/sidly/telemetria/dataset` per le analisi statistiche (solo id assistito e IMEI, nessun nome).

## Limite giornaliero D1
Lo storico va a finestre di 7 giorni con tetto di finestre/righe per richiesta e riprende dal cursore; le scritture sono in `db.batch` (INSERT multi-riga da 40).

## Endpoint (tutti con sessione CRM o chiave)
| Endpoint | Note |
|---|---|
| `POST /api/sidly/storico` `{da:'inizio' oppure 'AAAA-MM-GG', conferma_scrittura?, assistito_id?}` | `da:'inizio'` = dalla data di registrazione del bracciale (meno 1 giorno); se SiDLY non la fornisce si ferma e chiede una data esplicita; senza `conferma_scrittura:true` e' anteprima (solo GET su SiDLY, nessuna scrittura); si rilancia finche' `completato:true`; un assistito aggiornato da meno di 6 ore non genera chiamate |
| `POST /api/sidly/storico` `{ultime:N, assistito_id, conferma_scrittura?, prima_di?, raccolte?}` | modalita' «ultime N misurazioni NUOVE» (prova controllata, N da 1 a 5000, predefinito 1000): UN assistito per richiesta; legge a ritroso a finestre di 7 giorni (solo GET), conta solo le misurazioni NON ancora nel DB e si ferma a N righe nuove o alla data di attivazione del braccialetto (se sono meno di N prende solo quelle); a ogni rilancio aggiunge quindi le N successive partendo dalla piu' recente non presente, senza riscrivere quelle gia' caricate; senza `conferma_scrittura:true` e' anteprima (ultima settimana, nessuna scrittura); non tocca il cursore dello storico completo, quindi lo storico «dall'inizio» resta possibile dopo senza duplicati; se serve piu' di una richiesta la risposta contiene `continua:{prima_di,raccolte}` da rimandare; allarmi importati solo per il periodo coperto; se manca la data di attivazione la ricerca e' limitata a 12 mesi (avviso) |
| `GET /api/sidly/telemetria/stato` | sola lettura: per assistito misure dal/al, storico letto fino a, righe, errore |
| `GET /api/sidly/telemetria/dataset?da=&a=&assistito_id=&dopo=&limite=` | CSV delle misure, pagine fino a 20000 righe, cursore in `X-Prossimo-Cursore` |
| `GET /api/sidly/telemetria/report?giorni=30` | medie, min, max, SD per assistito + coorte |

Dashboard: pulsante "Telemetria SiDLY" in "Assistiti Attivi" (riquadro "Come funziona", stato, medie, 1. storico, 2. dataset CSV).

## Messa in funzione
Nessun segreto aggiuntivo oltre a `SIDLY_USER`, `SIDLY_PASSWORD`, `SIDLY_BASE_URL`.
Prova consigliata: in Dashboard > Telemetria SiDLY lasciare «Ultime 1000 misurazioni per assistito» > "Anteprima storico" (legge ogni assistito, salta quelli in errore e mostra il totale stimato) > "Conferma e importa". Gli assistiti con IMEI non trovato su SiDLY vengono saltati.
Storico completo (dopo la prova):
1. Dashboard > Telemetria SiDLY > "Dall'inizio" > "Anteprima storico" (solo lettura).
2. "Conferma e carica lo storico" (scrive solo nel DB del CRM); si rilancia finche' e' completo.

## Note
- Passi: si usano solo quelli di `/stats`.
- Privacy: DB identificato (IMEI -> assistito), accesso solo con sessione/chiave; nessun log di token o misure.
