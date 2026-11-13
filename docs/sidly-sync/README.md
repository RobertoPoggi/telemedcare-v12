# Carica su SiDLY (upsert gentile per singolo assistito)

Pulsante nella tabella Assistiti della Dashboard (icona nuvola, solo se l'assistito è ATTIVO e ha un IMEI).
Endpoint: `POST /api/sidly/sync-assistito` (sessione CRM valida oppure Bearer `API_KEY` / `ADMIN_SECRET_TOKEN`).
Il percorso `/api/sidly/*` NON è coperto dal middleware globale: la guardia è dentro l'endpoint.

Body: `{ assistito_id, dry_run?, associa_user_id?, conferma_crea? }`

## Secrets / variabili Cloudflare (Pages → Settings → Variables)
| Nome | Obbligatorio | Note |
|---|---|---|
| `SIDLY_USER` | sì | utenza manager SiDLY |
| `SIDLY_PASSWORD` | sì | |
| `SIDLY_BASE_URL` | sì | solo https. Prova prima su `https://api.sidly-platform-dev.com/api`, poi prod `https://api.sidly-platform.com/api` |
| `SIDLY_FRAME_URL` | per il Canale 2 | URL di consegna frame registrato con `set-url-for-band`. Il ricevitore `sidly/ingest` NON esiste ancora |
| `SIDLY_BAND_DEFAULTS` | no | JSON con default di banda (timezone, lang_band, ...) |
| `SIDLY_LOGIN_FIELD` | no | nome del campo utente nel body di login (default `email`, come il portale SiDLY; `SIDLY_USER` deve essere l'e-mail dell'utenza) |

## Comportamento
Nessuna scrittura automatica. Il pulsante mostra il confronto SiDLY | CRM; scrive solo le righe su cui l'operatore sceglie una direzione.
- Assente in piattaforma → creazione (assistito + braccialetto, poi referenti e patologie dal CRM), solo dopo "Conferma e crea su SiDLY".
- Presente → confronto riga per riga. Per ogni riga l'operatore sceglie (menu "Cosa fare"):
  - **nessuna modifica** (vuoto, predefinito);
  - **vale il CRM → scrivi su SiDLY** (PATCH solo delle chiavi scelte);
  - **vale SiDLY → scrivi nel CRM** (UPDATE D1 su colonne fisse).
- La scelta e' offerta solo se il campo esiste in **entrambi** gli ambienti, i valori differiscono (o uno e' vuoto) e il valore di partenza non e' vuoto: non si svuota mai l'altro lato.
- Confronto per significato: e-mail dei referenti per indirizzo ("email x@y.it" = "email: x@y.it"), telefoni con/senza prefisso, indirizzi in formati diversi, maiuscole nei nomi, testi che ne contengono altri.
- Configurazione operativa del dispositivo (soglie, zone, misure): solo lettura. Numeri SOS (`band.phones`) e numeri ammessi: solo "vale il CRM" (nel CRM i SOS sono i tre referenti).
- Omonimo trovato con `myShortInfo` → serve conferma (associa un candidato o crea nuovo); poi si vede comunque il confronto.
- `dry_run` → anteprima, nessuna scrittura né su SiDLY né su D1; con `scelte` mostra "prima/dopo" delle sole righe scelte.
- Token SiDLY in cache; su 401/403 nuovo login e un solo retry. Gli errori non riportano mai body, password o token.

## API: `POST /api/sidly/sync-assistito`
Body: `{assistito_id, dry_run?, conferma_scrittura?, scelte?, associa_user_id?, conferma_crea?}`. Senza `dry_run:true` ne' `conferma_scrittura:true` → 400. `scelte`: `[{chiave, verso:'crm'|'sidly', sidly, crm}]` dove `sidly`/`crm` sono i valori mostrati all'operatore. Il server rilegge SiDLY e rifiuta (esito `errore`, nessuna scrittura): chiave sconosciuta, scelta duplicata, direzione non consentita, riga gia' uguale, valore cambiato dopo l'anteprima, scrittura nel CRM non disponibile. Le colonne del CRM scrivibili sono un elenco chiuso (`COLONNE_OK`): nessun nome di colonna arriva dal browser.

## "Dettagli utente" (referenti, numeri ammessi, patologie e farmaci, scheda assistito)
| CRM | SiDLY | Direzioni possibili |
|---|---|---|
| `contatto{1,2,3}_{nome,cognome,telefono,email}` | `GET /getContacts` + `PATCH /editContacts` | nome, telefono, e-mail: CRM→SiDLY e SiDLY→CRM (e-mail SiDLY→CRM solo se in "altro" c'e' un indirizzo; CRM→SiDLY lo aggiunge alle note senza perderle). Parentela e indirizzo del referente: solo su SiDLY. Il portale invia l'intero modulo: si rimandano anche i valori gia' presenti (ID, parentela, indirizzo, note). |
| gli stessi tre numeri | `band.phones` (SOS) | solo CRM→SiDLY. Se SiDLY rifiuta la PATCH parziale (400), secondo tentativo con il modulo braccialetto completo (impostazioni invariate), come il portale |
| `whitelist{1,2,3}_telefono` + nome/cognome | `band.whitelistNumbers` (solo numeri, virgola) e `band.whiteListAlias` (nomi, campo SEPARATO, stesso ordine). Il portale invia sempre i due campi insieme: lo facciamo anche noi nella stessa PATCH. Due righe distinte in tabella (numeri / nomi); i nomi si scrivono solo se i numeri coincidono | solo CRM→SiDLY |
| `patologie_croniche` | interruttori di `GET/PATCH /getDiseases`/`editDiseases` | solo ACCENDERE, in entrambe le direzioni ("No" puo' voler dire "non compilato") |
| `allergie`, `note_mediche` | `allergy`, `more_info` | entrambe le direzioni |
| farmaci (`farmaci_data`, JSON `{nomi,dosaggi,orari}` mostrato come «nome dosaggio orario; …»), altre patologie | `medicines`, `other_diseases` | solo CRM→SiDLY (nel CRM hanno una struttura propria) |
| `medico_curante_*` | `GET /patientCard` | nessuna (scrittura su SiDLY non attiva; nel CRM nome e telefono sono nello stesso campo) |
| `centro_medico_riferimento` | `patientCard.hospital_info` | solo SiDLY→CRM |

Anagrafica: l'indirizzo del CRM e' salvato anche come «29 Via Corinto» (numero prima): verso SiDLY viene scritto in ordine italiano «Via Corinto 29, Citta', Prov, CAP». Assistiti SENZA scheda di configurazione nel CRM: le righe che andrebbero salvate li' (e-mail, referenti, ecc.) non offrono SiDLY→CRM e spiegano perche'. Nome/cognome/data di nascita/telefono/peso/altezza in entrambe le direzioni; indirizzo SiDLY→CRM solo se nel formato "Via, Citta', Provincia, CAP" (nel CRM sono 4 caselle); e-mail assistito solo SiDLY→CRM; SIM in entrambe (CRM: `ddts.sim_number`).
Mappatura patologie: ipertensione→`nadcisnienie`, diabete→`cukrzyca`, demenza→`alzheimer`, parkinson→`parkinson`, epilessia→`padaczka`, bpco→`astma`, cardiopatia→`po_zawale` (**assunzione**).
In anteprima la sezione `diagnostica` mostra solo la STRUTTURA delle risposte, mai i valori. Dati sanitari: i valori mostrati nel pannello non sono salvati nel DB (`sidly_sync` salva solo esito/azioni/avvisi).

## Dashboard: prima si vede, poi si sceglie, poi si scrive
1. La nuvola apre SEMPRE un'anteprima (`dry_run`) con la tabella **Campo | SiDLY | CRM | Cosa fare**, raggruppata in Anagrafica, Referenti, Braccialetto, Patologie e farmaci, Scheda assistito. Stati: uguale, diverso, solo su SiDLY, solo nel CRM, non verificabile. Il menu compare solo sulle righe in cui si puo' scegliere; sulle altre una nota spiega perche' non e' modificabile.
2. "Mostra le N modifiche scelte" (attivo solo con almeno una scelta): seconda anteprima con "Prima / Dopo", separata in "Verra' scritto su SiDLY" e "Verra' scritto nel CRM". Ancora nessuna scrittura.
3. "Conferma e scrivi" invia `conferma_scrittura:true` con le stesse `scelte`. "Indietro: cambia le scelte" torna alla tabella.

Campi **solo su SiDLY** (sola lettura): sesso, descrizione, parentela e indirizzo dei contatti, soglie FC, cadute, intervallo misurazioni, zona, notifiche, firmware, patologie senza equivalente CRM, autonomia, vaccinazione, covid, dati scheda assistito. Campi **solo nel CRM**: codice fiscale, luogo di nascita, richiedente, servizio/piano.

## IMEI sostituito, accesso negato (403) e scheda di configurazione mancante
- **Riga IMEI (confronto vero)**: l'IMEI del CRM e' confrontato con quello letto da SiDLY. Se diversi → stato «diverso» e unica scelta possibile «vale SiDLY → scrivi nel CRM» (`assistiti.imei`, colonna in `COLONNE_OK`). L'IMEI giusto e' sempre quello di SiDLY: mai si scrive l'IMEI del CRM su SiDLY. Non offerta se l'IMEI di SiDLY non e' di 14-17 cifre o se e' gia' assegnato a un altro assistito del CRM (univoco; si indica il nome). Dopo il salvataggio la ricerca usa direttamente il nuovo IMEI (nessuna associazione da ripetere). Cambia solo `assistiti.imei`: dispositivi, DDT e contratti restano com'erano (avviso a video). La telemetria segue il nuovo IMEI; le misure gia' registrate restano sotto il vecchio IMEI.
- **IMEI del CRM non trovato (404) o non accessibile (HTTP 403)**: ricerca per nome e cognome (`myShortInfo`); per ogni omonimo si legge l'IMEI (`GET /patient/{user_id}`) e la Dashboard mostra «IMEI su SiDLY (giusto)» accanto a «IMEI nel CRM»; «Associa questo» apre il confronto, dove si salva l'IMEI nel CRM. Con 403 **non si crea mai** un nuovo assistito (`solo_associa`, `conferma_crea` rifiutato dal server); senza omonimi o con ricerca fallita si risponde con un errore chiaro.
- **Scheda di configurazione mancante**: il risultato porta `scheda_mancante` (`possibile`, `lead_id`, `collegamento`, `motivo`). Lead trovato da `assistiti.lead_id`, poi da `contracts.imei_dispositivo`, poi per nome e cognome solo se UNICO. `POST /api/sidly/crea-scheda` `{assistito_id, conferma_scrittura?}`: senza `conferma_scrittura:true` e' solo anteprima; con conferma, in un batch, `INSERT INTO configurations … WHERE NOT EXISTS` (solo nome, cognome, data di nascita, indirizzo dal lead; stato `SIDLY_SYNC`, `form_inviato=0`) e, se serve, `assistiti.lead_id`. Solo assistiti ATTIVI. Referenti, telefono, e-mail e dati medici non vengono inventati: si completano dal confronto con «vale SiDLY».

## Stato nel CRM: tabella laterale `sidly_sync`
Deviazione dal prompt: niente `ALTER TABLE assistiti` (D1 ha limite 100 colonne; usiamo una side table come `lead_attribution`).
`sidly_sync(assistito_id PK, sidly_user_id, synced_at, last_esito, last_result)`. Nessun dato personale. Creata con `CREATE TABLE IF NOT EXISTS` (`SIDLY_SYNC_TABLE_SQL`).

## Codici HTTP
503 configurazione mancante o base URL non https · 404 assistito inesistente · 422 non ATTIVO / senza IMEI / senza nome · 502 errore SiDLY · 200 altrimenti.

## Test
`node scripts/test-seo-report.cjs` (sezione SiDLY, solo mock, nessuna rete).
