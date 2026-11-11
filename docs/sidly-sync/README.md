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
- Assente in piattaforma → creazione (assistito + braccialetto).
- Presente → PATCH dei soli campi vuoti in piattaforma o cambiati nel CRM. Mai campi vuoti dal CRM.
- Configurazione operativa del dispositivo (minHr/maxHr, zona, measure, SIM): mai sovrascritta, solo avviso. Eccezione richiesta esplicitamente: i **numeri SOS** (`band.phones`) devono coincidere con i tre referenti di "Dettagli utente"; il CRM e' master, il `repeatNumber` dei numeri gia' presenti si conserva, e i numeri che spariscono sono elencati negli avvisi.
- Omonimo trovato con `myShortInfo` → serve conferma (associa un candidato o crea nuovo).
- `dry_run` → anteprima, nessuna scrittura né su SiDLY né su D1.
- Token SiDLY in cache; su 401/403 nuovo login e un solo retry. Gli errori non riportano mai body, password o token.

## "Dettagli utente" (referenti, numeri ammessi, patologie e farmaci, scheda assistito)
| CRM (`configurations`) | SiDLY | Regola |
|---|---|---|
| `contatto{1,2,3}_{nome,cognome,telefono,email}` | `GET /getContacts/{imei}` + `PATCH /editContacts/{imei}` (`contactNName/Phone/Affinity/Address/Others`, `contactNID`) | Posizione n = referente n. CRM master su nome e telefono. Parentela e indirizzo di SiDLY restano (il CRM non li ha); l'e-mail va in "altro" solo se vuoto. Il portale invia sempre l'intero modulo: si rimandano anche i valori gia' presenti. |
| gli stessi tre numeri | `band.phones` (SOS) | Devono coincidere con i referenti (alias = nome). |
| `whitelist{1,2,3}_*` ("Numeri ammessi") | `band.whitelistNumbers` / `band.whiteListAlias` (stringhe con virgola, max 3) | CRM master; inviati solo se l'elenco differisce. |
| `patologie_croniche`, `patologie`, `allergie`, `farmaci_data`/`farmaci_assunti`, `note_mediche` | `GET /getDiseases/{imei}` + `PATCH /editDiseases/{imei}` (`diseaseID`) | Gli interruttori si accendono, mai si spengono. I testi (allergie, altre patologie, farmaci, note) si scrivono solo se vuoti su SiDLY; se diversi finiscono in "Differenze" senza sovrascrivere. I campi di autonomia (udito, vista, ...) che il CRM non possiede si rimandano invariati. |
| `medico_curante_*`, `centro_medico_riferimento` | `GET /patientCard/{imei}` | **Sola lettura**: si riportano solo le differenze. |

Mappatura patologie: ipertensione→`nadcisnienie`, diabete→`cukrzyca`, demenza→`alzheimer`, parkinson→`parkinson`, epilessia→`padaczka`, bpco→`astma`, cardiopatia→`po_zawale` (**assunzione**). Le altre (ictus, oncologica, insufficienza renale, osteoporosi, depressione) vanno nel testo "altre patologie".
Indirizzo scritto nel formato del portale ("Via, Citta', Provincia, CAP") e confrontato in modo tollerante (maiuscole, punteggiatura, ordine).
In anteprima la sezione `diagnostica` mostra solo la STRUTTURA delle risposte (chiavi e tipi), mai i valori. Dati sanitari: le differenze mostrate nel pannello contengono testo reale, non sono salvate nel DB (`sidly_sync` salva solo esito/azioni/avvisi).
Per un assistito appena creato i dettagli si sincronizzano subito dopo il POST (in anteprima non c'e' nulla da leggere).

## Dashboard
Lente = anteprima (nessuna scrittura), nuvola = carica. Dall'anteprima il pulsante "Carica davvero" esegue la scrittura.

## Stato nel CRM: tabella laterale `sidly_sync`
Deviazione dal prompt: niente `ALTER TABLE assistiti` (D1 ha limite 100 colonne; usiamo una side table come `lead_attribution`).
`sidly_sync(assistito_id PK, sidly_user_id, synced_at, last_esito, last_result)`. Nessun dato personale. Creata con `CREATE TABLE IF NOT EXISTS` (`SIDLY_SYNC_TABLE_SQL`).

## Codici HTTP
503 configurazione mancante o base URL non https · 404 assistito inesistente · 422 non ATTIVO / senza IMEI / senza nome · 502 errore SiDLY · 200 altrimenti.

## Test
`node scripts/test-seo-report.cjs` (sezione SiDLY, solo mock, nessuna rete).
