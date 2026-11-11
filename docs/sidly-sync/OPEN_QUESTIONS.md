# Domande aperte su SiDLY (assunzioni NON verificate)

Il prompt non documenta questi punti e non sono state fatte prove sulla piattaforma reale. Tutte le assunzioni sono isolate in `src/modules/sidly-sync.ts`. Da verificare sull'ambiente dev prima della produzione.

1. **Login**: nome del campo utente nel body di `POST /user/login` (assunto `login`, configurabile con `SIDLY_LOGIN_FIELD`) e chiave del token nella risposta (assunto `token`).
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
