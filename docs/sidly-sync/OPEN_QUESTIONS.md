# Domande aperte su SiDLY (assunzioni NON verificate)

Il prompt non documenta questi punti e non sono state fatte prove sulla piattaforma reale. Tutte le assunzioni sono isolate in `src/modules/sidly-sync.ts`. Da verificare sull'ambiente dev prima della produzione.

1. **Login** — VERIFICATO sul bundle pubblico del portale web SiDLY (non su una chiamata reale riuscita): `POST /user/login` con body `{email, password}`; il token sta in `data.authentication_token` ed è inviato nell'header `X-Access-Token`. Il primo tentativo con il campo `login` ha dato HTTP 400. `SIDLY_USER` deve quindi essere l'e-mail dell'utenza manager. `SIDLY_LOGIN_FIELD` resta disponibile (default `email`).
2. **Prefisso telefonico**: formato `+39` o `39`? Gestione di `phonePrefix` / `numberPrefix`.
3. **`repeatNumber`**: assunto 1. Semantica reale?
4. **Altezza**: assunta in cm; peso in kg.
5. **Forma della risposta di `GET /patient/{imei|user_id}`**: mappata in `normalizePlatformPatient`; da confrontare con la risposta reale.
6. **Idempotenza**: `POST /manager/patient` su un IMEI già esistente cosa fa (errore, duplicato, aggiornamento)? `set-url-for-band` è ripetibile?
7. **`myShortInfo`**: forma della risposta (assunto `items[]`) e se la ricerca è esatta o parziale.
8. **Sesso e descrizione**: non inviati, il CRM non ha una fonte affidabile. Servono?
9. **PATCH parziale**: conferma che campi omessi non vengano azzerati.
10. **HRV, FR, stress**: non presenti nei frame documentati. Bloccano il report medie dalla Dashboard (andrebbero mostrati come "non disponibile").
11. **Canale 2**: URL del ricevitore frame (`SIDLY_FRAME_URL`), AES-256-CBC opzionale. L'endpoint `sidly/ingest` è da costruire.
12. **`/getContacts`, `/getDiseases`, `/patientCard`**: forme di risposta ricavate dal bundle del portale, MAI viste su chiamate reali. L'anteprima mostra la struttura reale (`diagnostica.forma_*`): da confrontare prima di scrivere.
13. **PATCH di `editContacts` / `editDiseases`**: il portale invia sempre l'intero modulo, quindi il CRM fa lo stesso (rimanda i valori gia' su SiDLY). Non e' provato come l'API tratti `contactNID`/`diseaseID` ne' campi omessi.
14. **Cardiopatia → `po_zawale`** (post-infarto): assunzione dedotta dall'ordine della schermata. Confermare.
15. **Parentela dei referenti**: il CRM non la memorizza; resta quella di SiDLY. Se serve, aggiungere il campo al modulo CRM.
16. **Numeri SOS = referenti**: se su SiDLY ci sono SOS diversi vengono sostituiti (avviso con i vecchi numeri). `repeatNumber` esistente conservato.
17. **`patientCard`**: usata dal portale solo per profili `is_indiv`; trattata in sola lettura. Scrittura (`PATCH /patientCard/create/{imei}`) non implementata.
18. **Dati sanitari**: copiare patologie e farmaci verso SiDLY richiede una base giuridica (art. 9 GDPR) e che SiDLY sia nominata responsabile del trattamento. Da confermare lato titolare.

19. **Scritture nel CRM da SiDLY ("vale SiDLY")**: nuova capacita' su D1 di produzione (UPDATE su `configurations`, `leads`, `assistiti`, `ddts`, solo colonne in elenco chiuso, tutto o niente col batch D1). Confermare con il titolare quali campi si vogliono davvero rendere sovrascrivibili dal CRM; il primo uso reale va fatto su un solo campo e controllato.
20. **Patologie**: gli interruttori si accendono ma non si spengono (e non si tolgono dal CRM): un "No" puo' significare "non compilato". Se serve il caso opposto va deciso a parte.
21. **Indirizzo SiDLY→CRM**: solo nel formato "Via, Citta', Provincia, CAP"; altri formati non si scompongono. Valutare un campo indirizzo unico nel CRM.
22. **Scheda assistito su SiDLY**: scrittura non attiva finche' non si conferma l'endpoint (`PATCH /patientCard/create/{imei}`).

## Verificato sul bundle del portale (sidly-platform.com), non sull'API reale
- Creazione: `POST /manager/patient` con `{user:{firstName,lastName,email,date,sex,weight,height,phonePrefix,phone,address,description,avatar,type}, band:{imei,phones[],fall,timezone,sos_notif,fall_notif,zone_notif,firmware_version,lang_band,whitelistNumbers,...,zone?}, lang}`. Coerente con il prompt.
- Il portale tratta `weight` e `height` come OBBLIGATORI (2-3 cifre) alla creazione: se il CRM non li ha, la creazione potrebbe essere rifiutata.
- Il portale impone `firstName` 2-18 caratteri e `lastName` 2-20, `phone` 4-13 cifre, `address` max 370, `description` max 1500, `imei` 15 cifre.
- Il portale usa `PATCH /manager/patient/{id}`, `GET /patient/{id}`, `GET /patient/myShortInfo?page=&count=` (risposta in `data[]`; la ricerca per nome del prompt potrebbe non essere supportata come filtro).
- Formato di `date` non confermato (stringa o oggetto): il prompt indica `{year,month,day}`.

- **Risolto (conferma utente):** Cardiopatia (CRM) = `po_zawale` (SiDLY).
- **Whitelist (aperta):** due HTTP 400 `{}` (prima con numeri+nomi, poi solo numeri). Dal bundle del portale: `whitelistNumbers` e `whiteListAlias` sono campi separati inviati SEMPRE insieme nel modulo band, e il portale invia l'intero modulo band (la nostra PATCH e' parziale). Ora inviamo entrambi i campi insieme; se resta 400 l'interfaccia mostra il motivo (o «SiDLY non indica il motivo»). Verificato dall'utente: il portale accetta la stessa modifica a mano, e anche con un solo numero la PATCH parziale del CRM da' 400 `{"status":400,"errors":[]}` (quindi non dipende da dati/permessi). Ipotesi: SiDLY accetta la modifica del braccialetto solo con il modulo completo. Implementato un SECONDO TENTATIVO automatico (solo se il primo da' 400/422): `PATCH /manager/patient/{imei}` con `{band: modulo completo, lang:'it'}`, impostazioni lette da `patient-edit-initial-data` e rimandate invariate (mappatura min_hr->minHr ecc., orari notte a 6 caratteri, zona null se assente, come il portale). Da verificare sull'API reale al prossimo invio dell'utente; il secondo tentativo compare nei «Dettagli tecnici».
