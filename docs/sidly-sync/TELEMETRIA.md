# Telemetria SiDLY: DB delle misure degli assistiti eCura

Codice: `src/modules/sidly-telemetria.ts`. Test: `tests/seo-report/sidly-telemetria-tests.ts` (SQLite vero via sql.js, rete finta).

## Cosa arriva da dove (documentazione SiDLY aggiornata)
- **Frame (push)** del Vital: FC, SpO2, temperatura, `respiration` (FR), `hr_store`, `measurements[]` (batch TIMMEAS), campi di rete. Il ritmo NON e' fisso (il "ogni 30 minuti" e' obsoleto per il Vital).
- **Non nei frame**: HRV/RR, stress, sonno, indice di attivita'. Stress/sonno/attivita' non sono disponibili.
- **Storico (pull)** `GET /patient/{imei}/stats?fromDate&toDate` (UTC): FC, SpO2, temperatura, passi, FR, HRV (SDNN, RMSSD), FC a riposo.
- Allarmi: `GET /patientIntegrateAlarm/{imei}`.
- Cifratura AES-256-CBC sull'intero JSON, IV = primi 16 byte del base64.

## Tabelle (side table, nessun ALTER su leads: limite D1 di 100 colonne)
- `sidly_misure(imei, ts)`: una riga per istante con tutte le metriche in colonne (meno scritture); frame e storico dello stesso istante si fondono, un NULL non cancella un valore.
- `sidly_eventi(imei, ts, tipo)`: sos, fall, zone, immo, call, info, sos_cpl; `origine` frame|api; un allarme gia' arrivato come frame non si duplica da API.
- `sidly_stato(imei)`: ultimo frame, batteria, dispositivo, rete, frame registrato, cursore dello storico, ultimo errore, `registrato_ts` (data di attivazione del bracciale) e `completo_ts` (ultimo aggiornamento completo). Le due colonne sono aggiunte con una migrazione leggera (`ALTER TABLE sidly_stato`, mai su `leads`) se la tabella esiste gia' senza.

**Dataset delle misure**: `sidly_misure` e' il dataset dedicato alle sole misure (FC, qualita' FC, SpO2, qualita' SpO2, temperatura, passi, pressione, SDNN, RMSSD, FR, FC a riposo, indossamento, fonte), separato dall'anagrafica; si esporta in CSV con `GET /api/sidly/telemetria/dataset` per le analisi statistiche (solo id assistito e IMEI, nessun nome).
- Create con `CREATE TABLE IF NOT EXISTS` solo da percorsi di scrittura; le letture non creano nulla.

## Limite giornaliero D1 (allerta del 16 settembre)
Un frame = un solo `db.batch` (misure + eventi + stato); le misure sono INSERT multi-riga da 40; lo storico va a finestre di 7 giorni con tetto di finestre/righe per richiesta e riprende dal cursore. Frame di IMEI non nostri: 1 sola lettura, nessuna scrittura.

## Endpoint
| Endpoint | Accesso | Note |
|---|---|---|
| `POST /api/sidly/ingest?k=TOKEN` | segreto `SIDLY_INGEST_TOKEN` nell'URL | 401 token errato, 503 non configurato, 202 IMEI ignoto, 400 frame cifrato non decifrabile |
| `POST /api/sidly/storico` `{da:'inizio' oppure 'AAAA-MM-GG', conferma_scrittura?, assistito_id?}` | sessione o chiave | `da:'inizio'` = per ogni assistito dalla data di registrazione del bracciale (`registerDate` di `/patientIntegrate/{imei}`, meno 1 giorno di margine); se SiDLY non la fornisce si ferma con errore e chiede una data esplicita (nessuna data inventata); tetto 10 anni per le date esplicite; un assistito aggiornato da meno di 6 ore non genera chiamate; senza `conferma_scrittura:true` e' anteprima (solo GET su SiDLY, nessuna scrittura nemmeno delle tabelle); si rilancia finche' `completato:true`; ogni rilancio rilegge gli ultimi 2 giorni e importa i nuovi allarmi |
| `POST /api/sidly/registra-frame` `{conferma_scrittura?, rimuovi?, assistito_id?, offset?}` | sessione o chiave | anteprima di default; POST `set-url-for-band` (con `encryptKey` se configurata) o DELETE `delete-url-for-band`; SOSTITUISCE l'URL gia' impostato sul bracciale |
| `GET /api/sidly/telemetria/stato` | sessione o chiave | sola lettura |
| `GET /api/sidly/telemetria/dataset?da=&a=&assistito_id=&dopo=&limite=` | sessione o chiave | CSV delle misure, una riga per (imei, istante), ordinato per imei e ts; pagine fino a 20000 righe (max 50000), cursore `imei:ts` in `X-Prossimo-Cursore` (vuoto = finito), intestazione solo nella prima pagina; 404 se le tabelle non esistono; sola lettura |
| `GET /api/sidly/telemetria/report?giorni=30` | sessione o chiave | medie, min, max, SD per assistito + coorte (media delle medie) |

Dashboard: pulsante "Telemetria SiDLY" in "Assistiti Attivi" (stato, medie; 1. storico dall'inizio o da una data, 2. registrazione frame, 3. scarico del dataset CSV). Il pulsante nuvola "Carica su SiDLY" per ogni assistito (riga di Assistiti Attivi) e' la funzione separata di scrittura anagrafica.

## Messa in funzione (passi da fare dall'utente, nell'ordine)
1. Segreti Cloudflare Pages: `SIDLY_INGEST_TOKEN` (casuale, >=16 caratteri), `SIDLY_FRAME_URL` = `https://telemedcare-v12.pages.dev/api/sidly/ingest?k=<stesso token>`, opzionale `SIDLY_ENCRYPT_KEY` (32 byte).
2. Dashboard > Telemetria SiDLY > "Dall'inizio" > "Anteprima storico" (solo lettura): controllare data di partenza, punti per metrica e confronto passi dichiarati/somma.
3. "Conferma e carica lo storico" (scrive solo nel DB del CRM); si rilancia finche' e' completo.
4. "Anteprima registrazione frame" poi "Conferma e registra su SiDLY" (unica scrittura su SiDLY, solo dopo OK esplicito).
5. Dopo il primo frame verificare in "Stato per assistito" l'ora dell'ultimo frame.

## Note
- Passi: i passi dei frame sono ignorati (ambigui), si usano solo quelli di `/stats`.
- Ora dei frame: `timestamp` di TIMMEAS/hr_store e' ora locale del bracciale (Europe/Rome), convertita in UTC; tutto il resto della API e' UTC.
- Posizione: `lat` dei frame = longitudine, `long` = latitudine (legacy invertito); `loc` = "lon,lat,SORGENTE"; 0,0 = assente.
- Privacy: DB identificato (IMEI -> assistito), accesso solo con sessione/chiave; nessun log di token, chiavi o misure.
