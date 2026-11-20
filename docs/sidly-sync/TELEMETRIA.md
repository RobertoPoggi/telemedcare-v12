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
**Misurazione vera**: una riga di `sidly_misure` conta come misurazione solo se ha almeno un valore fisiologico (FC, SpO2, temperatura, respiro, FC a riposo, SDNN, RMSSD). I valori di `pressure` (~990-1025) sono quasi certamente **pressione atmosferica in hPa** (sensore barometrico del braccialetto), NON la pressione arteriosa: l'etichetta lo dice, e una riga con la sola pressione non viene piu' scritta, ne' conta in «ultime N», nello stato, nelle medie, nei «giorni con dati» o nell'«ultima misura» (un braccialetto non indossato continua a mandarla e sembrava vivo). I soli passi si salvano (servono ai passi/giorno) ma non sono una misurazione. Le righe di sola pressione gia' presenti nel DB restano (innocue) e sono ignorate da tutti i conteggi.
**Anteprima**: mostra i valori veri della settimana letta (letture, min, media, max, ultima, con unità) e l'affidabilità (media 0-3, % di letture buone, conteggio per livello, testi grezzi di SiDLY per verificare la scala), non più i soli conteggi di punti.

**Dataset delle misure**: `sidly_misure` si esporta in CSV con `GET /api/sidly/telemetria/dataset` per le analisi statistiche (solo id assistito e IMEI, nessun nome).

## Limite giornaliero D1
Lo storico va a finestre di 7 giorni con tetto di finestre/righe per richiesta e riprende dal cursore; le scritture sono in `db.batch` (INSERT multi-riga da 40).

## Endpoint (tutti con sessione CRM o chiave)
| Endpoint | Note |
|---|---|
| `POST /api/sidly/storico` `{da:'inizio' oppure 'AAAA-MM-GG', conferma_scrittura?, assistito_id?}` | `da:'inizio'` = dalla data di registrazione del bracciale (meno 1 giorno); se SiDLY non la fornisce si ferma e chiede una data esplicita; senza `conferma_scrittura:true` e' anteprima (solo GET su SiDLY, nessuna scrittura); si rilancia finche' `completato:true`; un assistito aggiornato da meno di 6 ore non genera chiamate |
| `POST /api/sidly/storico` `{ultime:N, assistito_id, conferma_scrittura?, prima_di?, raccolte?}` | modalita' «ultime N misurazioni NUOVE» (prova controllata, N da 1 a 5000, predefinito 1000): UN assistito per richiesta; legge a ritroso a finestre di 7 giorni (solo GET), conta solo le misurazioni NON ancora nel DB e si ferma a N righe nuove o alla data di attivazione del braccialetto (se sono meno di N prende solo quelle); a ogni rilancio aggiunge quindi le N successive partendo dalla piu' recente non presente, senza riscrivere quelle gia' caricate; senza `conferma_scrittura:true` e' anteprima (ultima settimana, nessuna scrittura); non tocca il cursore dello storico completo, quindi lo storico «dall'inizio» resta possibile dopo senza duplicati; se serve piu' di una richiesta la risposta contiene `continua:{prima_di,raccolte}` da rimandare; allarmi importati solo per il periodo coperto; **N conta solo misurazioni vere nuove** (le righe di sola pressione/solo passi non contano) e la risposta riporta `misurazioni` aggiunte e `motivo_fine` (`richieste` = raggiunte N, `inizio` = arrivato all'attivazione, non c'e' altro da caricare, `limite` = da riprendere); se manca la data di attivazione la ricerca e' limitata a 12 mesi (avviso); l'ANTEPRIMA sonda fino a 20 settimane all'indietro per trovare l'ULTIMA misura dell'assistito anche se il braccialetto e' fermo da settimane/mesi e mostra `ultima_misura` e `silenzio_giorni`; l'importazione parte dalla sua ultima misura e va indietro di N (le settimane vuote consumano chiamate: si riprende con `continua`) |
| `POST /api/sidly/storico` `{affidabilita:true, assistito_id, conferma_scrittura?, prima_di?}` | modalita' «aggiorna l'affidabilita'» sulle misure GIA' nel DB: UN assistito per richiesta; rilegge da SiDLY (solo `GET /stats`) soltanto le settimane che contengono righe con `affid IS NULL` e fa `UPDATE ... WHERE affid IS NULL` su quelle righe (`affid`, e `hr_q`/`spo2_q` solo se vuoti); NON inserisce righe nuove, NON cambia i valori misurati, NON sovrascrive indici gia' presenti, NON tocca il cursore dello storico; max 8 settimane per richiesta, ripresa con `continua:{prima_di}`; se SiDLY non indica l'affidabilita' per un istante la riga resta NULL (mai inventata); un rilancio senza righe da aggiornare non chiama SiDLY; senza `conferma_scrittura:true` e' anteprima (una settimana, nessuna scrittura, nemmeno la migrazione della colonna) e mostra il testo grezzo `trust_lvl` ricevuto. Attenzione: ogni riga aggiornata e' una scrittura D1 (limite giornaliero) |
| `POST /api/sidly/storico` `{aggiorna:true, assistito_id, conferma_scrittura?, prima_di?}` | modalita' «aggiorna con le misure nuove» (braccialetto attuale): legge da SiDLY (solo `GET /stats`) da ADESSO a ritroso a finestre di 7 giorni e scrive solo le righe non presenti nel DB; si ferma alla prima finestra che contiene misurazioni gia' caricate (di norma 1-2 chiamate), rileggendo 2 giorni prima dell'ultima misura nel DB (HRV e passi arrivano in ritardo); richiede misure gia' nel DB (altrimenti messaggio e nessuna chiamata); non tocca il cursore dello storico completo; senza `conferma_scrittura:true` e' anteprima (ultima misura nel DB, giorni da coprire, una settimana letta). Risposta: `misurazioni` (nuove vere), `motivo_fine` (`gia_caricate` / `inizio` / `limite`), `continua` |
| `GET /api/sidly/telemetria/stato` | sola lettura: per assistito misure dal/al, storico letto fino a, righe, errore |
| `GET /api/sidly/telemetria/dataset?da=&a=&assistito_id=&dopo=&limite=` | CSV delle misure, pagine fino a 20000 righe, cursore in `X-Prossimo-Cursore` |
| `GET /api/sidly/telemetria/report?giorni=0&affid_min=0..3&assistito_id=` | medie, min, max, SD per assistito + coorte. `giorni` assente, `0` o `tutto` (PREDEFINITO) = calcolo su TUTTO lo storico presente nel DB (`periodo.tutto=true`, `periodo.dal=null`); `giorni=N` (1-3650) = solo gli ultimi N giorni. Per ogni assistito `misure_dal`/`misure_al` = prima e ultima misura considerate. Passi/giorno e giorni con dati seguono lo stesso periodo. `affid_min` = soglia dell'indice di affidabilita': 0 (predefinito) usa TUTTE le misure; 1 solo indice 1-2-3; 2 solo 2-3; 3 solo 3. Le misure senza indice (NULL) sono ESCLUSE se la soglia e' > 0 (mai considerate affidabili); i passi non sono filtrati. Risposta: `affid_min`, `affid_colonna` e per riga `misure_periodo`, `misure_incluse`, `misure_senza_affid`, `imei_considerati` |
| `GET /api/sidly/telemetria/imei-precedenti` · `POST` `{assistito_id, imei, rimuovi?}` | elenca / registra / rimuove un braccialetto precedente (solo scrittura nel DB del CRM, nessuna chiamata di scrittura a SiDLY) |

Dashboard: pulsante "Telemetria SiDLY" in "Assistiti Attivi" (riquadro "Come funziona", stato, medie, 1. storico, 2. dataset CSV, 1b. aggiorna con le misure nuove (da oggi a ritroso fino alle misure gia' caricate), 3. aggiorna affidabilita' sulle misure gia' presenti, 4. braccialetti precedenti). Le medie hanno il filtro «Affidabilita' minima» 0-3 e la colonna «Misure usate». Prima di usare una soglia > 0 lanciare il riquadro 3 sulle misure importate prima dell'introduzione dell'indice.

## Messa in funzione
Nessun segreto aggiuntivo oltre a `SIDLY_USER`, `SIDLY_PASSWORD`, `SIDLY_BASE_URL`.
Prova consigliata: in Dashboard > Telemetria SiDLY lasciare «Ultime 1000 misurazioni per assistito» > "Anteprima storico" (legge ogni assistito, salta quelli in errore e mostra il totale stimato) > "Conferma e importa". Gli assistiti con IMEI non trovato su SiDLY vengono saltati.
Storico completo (dopo la prova):
1. Dashboard > Telemetria SiDLY > "Dall'inizio" > "Anteprima storico" (solo lettura).
2. "Conferma e carica lo storico" (scrive solo nel DB del CRM); si rilancia finche' e' completo.

## Note
- Passi: si usano solo quelli di `/stats`.
- Privacy: DB identificato (IMEI -> assistito), accesso solo con sessione/chiave; nessun log di token o misure.

## Indice di stress (stima del CRM dall'HRV)

SiDLY **non espone** l'indice di stress via API: il CRM lo calcola dall'RMSSD gia' scaricato in `sidly_misure`. E' una **stima orientativa**
calibrata sul report dell'app SiDLY (RMSSD medio 64 ms → indice 10, «Basso»), non la formula ufficiale e non serve per la diagnosi.

- **Modulo unico**: `src/modules/stressModel.js` (funzioni pure, nessun accesso a DB). Costanti in cima: `PENDENZA = 1.4`, `ANCORAGGIO = 10`, `SOGLIE_FASCE = [40, 60, 80]`
  (+ `MIN_GIORNI_STORICO = 7`, `AFFIDABILITA = 3`). Per usare coefficienti ufficiali basta cambiarle: query, rotta e UI non hanno numeri propri.
- **Algoritmo** (solo misure con `affid = 3` e `rmssd` valorizzato):
  - `baseline` = media delle misure RMSSD dell'intero storico (`baseline=full`, predefinito) oppure degli ultimi 60 giorni (`rolling60`);
  - `rmssd_3gg(g)` = media dei valori RMSSD giornalieri delle ultime ≤ 3 date **disponibili** (media mobile adattiva: i giorni senza HRV sono esclusi, mai interpolati);
  - `indice(g) = clamp(0, 100, round(10 + 1,4 × (baseline − rmssd_3gg)))`; fasce: <40 Basso, <60 Moderato, <80 Alto, ≥80 Molto alto;
  - **platea** = media degli indici individuali del giorno (mai la formula applicata alla media RMSSD, che e' non lineare);
  - **guardia**: meno di 7 giorni con HRV → `indice_attuale: null`, motivo «storico HRV insufficiente», assistito escluso dall'aggregato.
- **Endpoint** `GET /api/analisi/stress?imei=<imei|id assistito|platea>&window=90&baseline=full|rolling60` (sola lettura, stessa autenticazione delle altre rotte telemetria).
  Risposta: `serie [{giorno, indice, fascia, rmssd_3gg, n_assistiti}]`, `indice_attuale`, `fascia`, `baseline`, `indice_medio_30gg`, `picco_90gg`, `data_picco`,
  `dispositivo` (modello reale da `dispositivi.modello` per l'assistito; `null` in platea o se non registrato), `motivo`, `distribuzione_30gg`, `esclusi`, `testi`, `fasce`.
  Le misure dei braccialetti precedenti (IMEI precedenti) si sommano all'assistito. Gli assistiti non ATTIVI non entrano.
- **Query D1 equivalente** (`SQL_STRESS_WINDOW` in `src/modules/stress-analisi.ts`): `AVG(rmssd_g) OVER (PARTITION BY imei ORDER BY giorno ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`
  sui valori giornalieri; i test verificano che coincide con il modello giorno per giorno.
- **Dashboard Telemetria**: sezione «Analisi · Indice di stress (HRV)» sotto le Medie, con selettore Media platea / assistito e baseline; 4 card, grafico a barre 90 giorni,
  badge (platea: «Telemetria · Media platea»; individuale: dispositivo reale), formula e nota sui limiti. Screenshot: `docs/sidly-sync/screenshot/stress-*.png`.
- **Test**: `tests/seo-report/stress-tests.ts`. Le fixture golden (`tests/seo-report/fixtures/stress-golden.json`, generate da `gen-stress-fixture.mjs`) sono **sintetiche**:
  costruite per riprodurre i valori di accettazione (Lavarini 9 «Basso», baseline 150,7, picco 63 il 2026-11-05; platea 23 / 14 / picco 44 il 2026-09-03; distribuzione 168/13/2/1).
  Non sono dati reali di produzione: la verifica sui dati veri va fatta aprendo la Dashboard dopo il caricamento dello storico.

## SpO2 mensili: Care Pro vs Vital Care (elaborazione ad hoc)

`GET /api/analisi/spo2-mensili` (JSON) oppure `?formato=tabella` (pagina HTML). Sessione o chiave API come gli altri endpoint `/api/analisi/*`. **Sola lettura**.

- Misurazione SpO2 = riga di `sidly_misure` con `spo2` valorizzata. Mese = mese UTC.
- Assistiti ATTIVI, con tutti i braccialetti (attuale + precedenti). Il modello e' quello del braccialetto attuale in `dispositivi` (con «VITAL» = Vital Care, altro = Care Pro; senza modello registrato = «non registrato», contato a parte).
- `media_per_assistito` = misure del mese / assistiti del gruppo con almeno una misura SpO2 in quel mese. I totali usano solo i mesi completi (esclusi mese corrente e primo mese se iniziato a meta').
- Test: `tests/seo-report/spo2-tests.ts` (dati sintetici).

## Sonda batteria (autonomia Care Pro) - sola lettura

`GET /api/sidly/batteria?fase=probe|snapshot[&imei=a,b,c][&formato=csv]` (sessione o chiave API). Legge i braccialetti Care Pro degli assistiti ATTIVI.

- **probe** (fase 1): per 3 IMEI campione chiama `GET /patient/{imei}/stats` sugli ultimi 14 giorni e riporta: (a) le **serie «battery»** di /stats (metrica con `chart` come pulse/sat: punti, primo/ultimo punto, min/max/media, punti per mese), (b) eventuali campi scalari batteria, (c) i testi `info` di `lastMeasurements` («Band charging», «Band fullcharged», «Band discharged»). Se trova batteria o carica, rilegge dal 2025-05-01 per vedere quanto indietro arrivano. `esito_fase1`: `batteria_in_stats`, `eventi_carica_nello_storico`, `batteria_storico_giorni`, `batteria_copre_oltre_60_giorni`, `caso` (A / A parziale / B). Nota: la prima versione cercava solo campi scalari e per errore rispondeva «NO» anche se /stats contiene la serie `battery`.
- **snapshot** (caso B): una `GET /patientIntegrate/{imei}` per dispositivo con `batteryLevel`; con `formato=csv` scarica `batteria_snapshot.csv`.
- Solo GET, 1 richiesta al secondo, su HTTP 429 una pausa di 60 s e poi stop. Nessuna scrittura su SiDLY, nessun `set-url-for-band` / `delete-url-for-band`, nessuna scrittura su D1.
- Test: `tests/seo-report/batteria-tests.ts` (SiDLY simulata).
