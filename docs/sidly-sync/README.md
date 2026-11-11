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
| `SIDLY_LOGIN_FIELD` | no | nome del campo utente nel body di login (default `login`) |

## Comportamento
- Assente in piattaforma → creazione (assistito + braccialetto).
- Presente → PATCH dei soli campi vuoti in piattaforma o cambiati nel CRM. Mai campi vuoti dal CRM.
- Configurazione operativa del dispositivo (telefoni SOS, minHr/maxHr, zona, measure, SIM): mai sovrascritta, solo avviso.
- Omonimo trovato con `myShortInfo` → serve conferma (associa un candidato o crea nuovo).
- `dry_run` → anteprima, nessuna scrittura né su SiDLY né su D1.
- Token SiDLY in cache; su 401/403 nuovo login e un solo retry. Gli errori non riportano mai body, password o token.

## Stato nel CRM: tabella laterale `sidly_sync`
Deviazione dal prompt: niente `ALTER TABLE assistiti` (D1 ha limite 100 colonne; usiamo una side table come `lead_attribution`).
`sidly_sync(assistito_id PK, sidly_user_id, synced_at, last_esito, last_result)`. Nessun dato personale. Creata con `CREATE TABLE IF NOT EXISTS` (`SIDLY_SYNC_TABLE_SQL`).

## Codici HTTP
503 configurazione mancante o base URL non https · 404 assistito inesistente · 422 non ATTIVO / senza IMEI / senza nome · 502 errore SiDLY · 200 altrimenti.

## Test
`node scripts/test-seo-report.cjs` (sezione SiDLY, solo mock, nessuna rete).
