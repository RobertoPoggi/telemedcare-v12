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
- `sidly_imei(imei PK, assistito_id, origine, creato_il)`: **braccialetti precedenti** di un assistito che ha cambiato IMEI. Un IMEI in questa tabella conta come «precedente» solo se non e' l'IMEI attuale di un altro assistito.
- Create con `CREATE TABLE IF NOT EXISTS` solo da percorsi di scrittura; le letture non creano nulla.

**Cambio di IMEI**: le misure restano dell'assistito anche se il braccialetto cambia. Il vecchio IMEI viene registrato in `sidly_imei` (a) automaticamente quando l'IMEI dell'assistito cambia con `PUT /api/assistiti/:id`, (b) quando il confronto CRM/SiDLY applica una correzione dell'IMEI, (c) a mano da Dashboard > Telemetria SiDLY > «4. Braccialetti precedenti». Stato, medie, dataset e importazioni (ultime N, storico, affidabilita') sommano/leggono tutti gli IMEI dell'assistito (parametro `imei` per importare un singolo braccialetto). Il cambio fatto PRIMA di questa funzione non e' registrato: il vecchio IMEI va aggiunto a mano. Lettura SiDLY sempre solo GET.

**Indice di affidabilità**: ogni punto di `/stats` può portare un testo `trust_lvl` (es. `HR=3,SpO2=2`, scala 0 = inaffidabile … 3 = ottima). Per ogni misurazione si salvano `hr_q` (battito), `spo2_q` (SpO2) e `affid` = il livello più basso dichiarato per quell'istante. Se SiDLY non indica nulla il valore resta vuoto (mai inventato). Una rilettura senza affidabilità non cancella quella già salvata. `sidly_misure` creata prima di questa colonna viene migrata da sola (`ALTER TABLE ... ADD COLUMN affid`, nessun dato perso).
**Anteprima**: mostra i valori veri della settimana letta (letture, min, media, max, ultima, con unità) e l'affidabilità (media 0-3, % di letture buone, conteggio per livello, testi grezzi di SiDLY per verificare la scala), non più i soli conteggi di punti.

**Dataset delle misure**: `sidly_misure` si esporta in CSV con `GET /api/sidly/telemetria/dataset` per le analisi statistiche (solo id assistito e IMEI, nessun nome).

## Limite giornaliero D1
Lo storico va a finestre di 7 giorni con tetto di finestre/righe per richiesta e riprende dal cursore; le scritture sono in `db.batch` (INSERT multi-riga da 40).

## Endpoint (tutti con sessione CRM o chiave)
| Endpoint | Note |
|---|---|
| `POST /api/sidly/storico` `{da:'inizio' oppure 'AAAA-MM-GG', conferma_scrittura?, assistito_id?}` | `da:'inizio'` = dalla data di registrazione del bracciale (meno 1 giorno); se SiDLY non la fornisce si ferma e chiede una data esplicita; senza `conferma_scrittura:true` e' anteprima (solo GET su SiDLY, nessuna scrittura); si rilancia finche' `completato:true`; un assistito aggiornato da meno di 6 ore non genera chiamate |
| `POST /api/sidly/storico` `{ultime:N, assistito_id, conferma_scrittura?, prima_di?, raccolte?}` | modalita' «ultime N misurazioni NUOVE» (prova controllata, N da 1 a 5000, predefinito 1000): UN assistito per richiesta; legge a ritroso a finestre di 7 giorni (solo GET), conta solo le misurazioni NON ancora nel DB e si ferma a N righe nuove o alla data di attivazione del braccialetto (se sono meno di N prende solo quelle); a ogni rilancio aggiunge quindi le N successive partendo dalla piu' recente non presente, senza riscrivere quelle gia' caricate; senza `conferma_scrittura:true` e' anteprima (ultima settimana, nessuna scrittura); non tocca il cursore dello storico completo, quindi lo storico «dall'inizio» resta possibile dopo senza duplicati; se serve piu' di una richiesta la risposta contiene `continua:{prima_di,raccolte}` da rimandare; allarmi importati solo per il periodo coperto; se manca la data di attivazione la ricerca e' limitata a 12 mesi (avviso); l'ANTEPRIMA sonda fino a 20 settimane all'indietro per trovare l'ULTIMA misura dell'assistito anche se il braccialetto e' fermo da settimane/mesi e mostra `ultima_misura` e `silenzio_giorni`; l'importazione parte dalla sua ultima misura e va indietro di N (le settimane vuote consumano chiamate: si riprende con `continua`) |
| `POST /api/sidly/storico` `{affidabilita:true, assistito_id, conferma_scrittura?, prima_di?}` | modalita' «aggiorna l'affidabilita'» sulle misure GIA' nel DB: UN assistito per richiesta; rilegge da SiDLY (solo `GET /stats`) soltanto le settimane che contengono righe con `affid IS NULL` e fa `UPDATE ... WHERE affid IS NULL` su quelle righe (`affid`, e `hr_q`/`spo2_q` solo se vuoti); NON inserisce righe nuove, NON cambia i valori misurati, NON sovrascrive indici gia' presenti, NON tocca il cursore dello storico; max 8 settimane per richiesta, ripresa con `continua:{prima_di}`; se SiDLY non indica l'affidabilita' per un istante la riga resta NULL (mai inventata); un rilancio senza righe da aggiornare non chiama SiDLY; senza `conferma_scrittura:true` e' anteprima (una settimana, nessuna scrittura, nemmeno la migrazione della colonna) e mostra il testo grezzo `trust_lvl` ricevuto. Attenzione: ogni riga aggiornata e' una scrittura D1 (limite giornaliero) |
| `GET /api/sidly/telemetria/stato` | sola lettura: per assistito misure dal/al, storico letto fino a, righe, errore |
| `GET /api/sidly/telemetria/dataset?da=&a=&assistito_id=&dopo=&limite=` | CSV delle misure, pagine fino a 20000 righe, cursore in `X-Prossimo-Cursore` |
| `GET /api/sidly/telemetria/report?giorni=30&affid_min=0..3&assistito_id=` | medie, min, max, SD per assistito + coorte. `affid_min` = soglia dell'indice di affidabilita': 0 (predefinito) usa TUTTE le misure; 1 solo indice 1-2-3; 2 solo 2-3; 3 solo 3. Le misure senza indice (NULL) sono ESCLUSE se la soglia e' > 0 (mai considerate affidabili); i passi non sono filtrati. Risposta: `affid_min`, `affid_colonna` e per riga `misure_periodo`, `misure_incluse`, `misure_senza_affid`, `imei_considerati` |
| `GET /api/sidly/telemetria/imei-precedenti` · `POST` `{assistito_id, imei, rimuovi?}` | elenca / registra / rimuove un braccialetto precedente (solo scrittura nel DB del CRM, nessuna chiamata di scrittura a SiDLY) |

Dashboard: pulsante "Telemetria SiDLY" in "Assistiti Attivi" (riquadro "Come funziona", stato, medie, 1. storico, 2. dataset CSV, 3. aggiorna affidabilita' sulle misure gia' presenti, 4. braccialetti precedenti). Le medie hanno il filtro «Affidabilita' minima» 0-3 e la colonna «Misure usate». Prima di usare una soglia > 0 lanciare il riquadro 3 sulle misure importate prima dell'introduzione dell'indice.

## Messa in funzione
Nessun segreto aggiuntivo oltre a `SIDLY_USER`, `SIDLY_PASSWORD`, `SIDLY_BASE_URL`.
Prova consigliata: in Dashboard > Telemetria SiDLY lasciare «Ultime 1000 misurazioni per assistito» > "Anteprima storico" (legge ogni assistito, salta quelli in errore e mostra il totale stimato) > "Conferma e importa". Gli assistiti con IMEI non trovato su SiDLY vengono saltati.
Storico completo (dopo la prova):
1. Dashboard > Telemetria SiDLY > "Dall'inizio" > "Anteprima storico" (solo lettura).
2. "Conferma e carica lo storico" (scrive solo nel DB del CRM); si rilancia finche' e' completo.

## Note
- Passi: si usano solo quelli di `/stats`.
- Privacy: DB identificato (IMEI -> assistito), accesso solo con sessione/chiave; nessun log di token o misure.
