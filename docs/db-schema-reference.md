# DB Schema Reference — TeleMedCare V12
> Rilevato via `PRAGMA table_info` sul DB D1 di produzione il 2026-10-07.
> Aggiornare questo file ogni volta che si aggiungono colonne.

---

## Tabella `leads` (93 colonne)

| # | Colonna | Tipo | NOT NULL |
|---|---------|------|----------|
| 1 | id | TEXT | |
| 2 | nomeRichiedente | TEXT | ✅ |
| 3 | cognomeRichiedente | TEXT | ✅ |
| 4 | email | TEXT | ✅ |
| 5 | telefono | TEXT | |
| 6 | nomeAssistito | TEXT | |
| 7 | cognomeAssistito | TEXT | |
| 8 | etaAssistito | INTEGER | |
| 9 | fonte | TEXT | ✅ |
| 10 | tipoServizio | TEXT | ✅ |
| 11 | vuoleBrochure | TEXT | |
| 12 | vuoleManuale | TEXT | |
| 13 | vuoleContratto | TEXT | |
| 14 | consensoPrivacy | BOOLEAN | |
| 15 | consensoMarketing | BOOLEAN | |
| 16 | consensoTerze | BOOLEAN | |
| 17 | status | TEXT | |
| 18 | note | TEXT | |
| 19 | external_source_id | TEXT | |
| 20 | external_data | TEXT | |
| 21 | created_at | DATETIME | |
| 22 | updated_at | DATETIME | |
| 23 | timestamp | DATETIME | |
| 24 | piano | TEXT | |
| 25 | servizio | TEXT | |
| 26 | luogoNascitaAssistito | TEXT | |
| 27 | dataNascitaAssistito | TEXT | |
| 28 | indirizzoAssistito | TEXT | |
| 29 | capAssistito | TEXT | |
| 30 | cittaAssistito | TEXT | |
| 31 | provinciaAssistito | TEXT | |
| 32 | codiceFiscaleAssistito | TEXT | |
| 33 | condizioniSalute | TEXT | |
| 34 | intestatarioContratto | TEXT | |
| 35 | emailRichiedente | TEXT | |
| 36 | telefonoRichiedente | TEXT | |
| 37 | cfAssistito | TEXT | |
| 38 | gdprConsent | INTEGER | |
| 39 | intestazioneContratto | TEXT | |
| 40 | cfIntestatario | TEXT | |
| 41 | codiceFiscaleIntestatario | TEXT | |
| 42 | indirizzoIntestatario | TEXT | |
| 43 | capIntestatario | TEXT | |
| 44 | cittaIntestatario | TEXT | |
| 45 | provinciaIntestatario | TEXT | |
| 46 | luogoNascitaIntestatario | TEXT | |
| 47 | dataNascitaIntestatario | TEXT | |
| 48 | etaCalcolata | INTEGER | |
| 49 | prezzo_anno | REAL | |
| 50 | prezzo_rinnovo | REAL | |
| 51 | setupBase | REAL | |
| 52 | setupIva | REAL | |
| 53 | setupTotale | REAL | |
| 54 | rinnovoBase | REAL | |
| 55 | rinnovoIva | REAL | |
| 56 | rinnovoTotale | REAL | |
| 57 | cm | TEXT | |
| 58 | stato | TEXT | |
| 59 | hs_object_source | TEXT | |
| 60 | hs_object_source_detail_1 | TEXT | |
| 61 | dettaglio_fonte | TEXT | |
| 62 | canale | TEXT | |
| 63 | reminder_firma_sent_at | TEXT | |
| 64 | reminder_firma_count | INTEGER | |
| 65 | reminder_proforma_sent_at | TEXT | |
| 66 | reminder_proforma_count | INTEGER | |
| 67 | hs_analytics_source | TEXT | |
| 68 | canale_acquisizione | TEXT | |
| 69 | iva_agevolata | INTEGER | |
| 70 | codice_sconto | TEXT | |
| 71 | sconto_percentuale | REAL | |
| 72 | sconto_fisso | REAL | |
| 73 | prezzo_scontato | REAL | |
| 74 | sconto_sorgente | TEXT | |
| 75 | rateizzazione_attiva | INTEGER | ✅ |
| 76 | rateizzazione_saldo | INTEGER | ✅ |
| 77 | rateizzazione_note | TEXT | |
| 78 | riserva_dominio | INTEGER | ✅ |
| 79 | temperatura | TEXT | |
| 80 | parentelaAssistito | TEXT | |
| 81 | pacchetto | TEXT | |
| 82 | preferenzaContatto | TEXT | |
| 83 | versione | TEXT | |
| 84 | iva_esente | INTEGER | |
| 85 | indirizzo_spedizione | TEXT | |
| 86 | sped_nome | TEXT | |
| 87 | sped_indirizzo | TEXT | |
| 88 | sped_cap | TEXT | |
| 89 | sped_citta | TEXT | |
| 90 | sped_provincia | TEXT | |
| 91 | sped_nazione | TEXT | |
| 92 | nazione_assistito | TEXT | |
| 93 | nazione_intestatario | TEXT | |

### ⚠️ Campi NON presenti in `leads` (attenzione negli UPDATE)
- `peso`, `altezza` → sono in `configurations` e `assistiti`
- `allergie`, `patologie_croniche` → solo in `configurations`
- `telefonoAssistito` → NON esiste; `configurations` ha `telefono`; `leads` ha `telefonoRichiedente`
- `contatto1/2/3_*`, `whitelist1/2/3_*` → solo in `configurations`
- `farmaci` / `terapia_farmacologica` / `note_aggiuntive` / `altre_patologie` → solo in `configurations` (con nomi diversi, vedi alias sotto)

---

## Tabella `configurations` (63 colonne)

| # | Colonna | Tipo | Note alias form↔db |
|---|---------|------|---------------------|
| 1 | id | INTEGER PK | |
| 2 | leadId | TEXT | FK → leads.id |
| 3 | device_id | INTEGER | |
| 4 | contract_id | TEXT | |
| 5 | nome_assistito | TEXT | |
| 6 | cognome_assistito | TEXT | |
| 7 | data_nascita | TEXT | |
| 8 | eta | TEXT | |
| 9 | peso | REAL | ← form: `peso` |
| 10 | altezza | REAL | ← form: `altezza` |
| 11 | telefono | TEXT | ← form: `telefonoAssistito` |
| 12 | email | TEXT | |
| 13 | indirizzo | TEXT | |
| 14 | contatto1_nome | TEXT | ← form: `contatto1_nome` |
| 15 | contatto1_cognome | TEXT | |
| 16 | contatto1_telefono | TEXT | |
| 17 | contatto1_email | TEXT | |
| 18 | contatto2_nome | TEXT | |
| 19 | contatto2_cognome | TEXT | |
| 20 | contatto2_telefono | TEXT | |
| 21 | contatto2_email | TEXT | |
| 22 | contatto3_nome | TEXT | |
| 23 | contatto3_cognome | TEXT | |
| 24 | contatto3_telefono | TEXT | |
| 25 | contatto3_email | TEXT | |
| 26 | whitelist1_nome | TEXT | ← form: `whitelist1_nome` |
| 27 | whitelist1_cognome | TEXT | |
| 28 | whitelist1_telefono | TEXT | |
| 29 | whitelist1_email | TEXT | |
| 30 | whitelist2_nome | TEXT | |
| 31 | whitelist2_cognome | TEXT | |
| 32 | whitelist2_telefono | TEXT | |
| 33 | whitelist2_email | TEXT | |
| 34 | whitelist3_nome | TEXT | |
| 35 | whitelist3_cognome | TEXT | |
| 36 | whitelist3_telefono | TEXT | |
| 37 | whitelist3_email | TEXT | |
| 38 | patologie | TEXT | ← form: `altre_patologie` |
| 39 | note_mediche | TEXT | ← form: `note_aggiuntive` |
| 40 | farmaci_data | TEXT | ← form: `farmaci` (JSON) |
| 41 | contatto_emergenza_1_nome | TEXT | |
| 42 | contatto_emergenza_1_telefono | TEXT | |
| 43 | contatto_emergenza_1_relazione | TEXT | |
| 44 | contatto_emergenza_2_nome | TEXT | |
| 45 | contatto_emergenza_2_telefono | TEXT | |
| 46 | contatto_emergenza_2_relazione | TEXT | |
| 47 | medico_curante_nome | TEXT | |
| 48 | medico_curante_telefono | TEXT | |
| 49 | centro_medico_riferimento | TEXT | |
| 50 | allergie | TEXT | ← form: `allergie` |
| 51 | patologie_croniche | TEXT | ← form: `patologie_croniche` |
| 52 | farmaci_assunti | TEXT | ← form: `terapia_farmacologica` |
| 53 | modalita_utilizzo | TEXT | |
| 54 | orari_attivazione | TEXT | |
| 55 | status | TEXT | DEFAULT 'PENDING' |
| 56 | data_completamento | DATETIME | |
| 57 | form_inviato | BOOLEAN | |
| 58 | email_benvenuto_inviata | BOOLEAN | |
| 59 | email_conferma_inviata | BOOLEAN | |
| 60 | created_at | DATETIME | |
| 61 | updated_at | DATETIME | |
| 62 | lead_assistiti_id | INTEGER | FK → lead_assistiti.id |

---

## Tabella `assistiti` (27 colonne)

| # | Colonna | Tipo |
|---|---------|------|
| 1 | id | INTEGER PK |
| 2 | codice | TEXT |
| 3 | nome | TEXT |
| 4 | email | TEXT |
| 5 | telefono | TEXT |
| 6 | imei | TEXT |
| 7 | status | TEXT |
| 8 | lead_id | TEXT | 
| 9 | created_at | TEXT |
| 10 | updated_at | TEXT |
| 11 | nome_assistito | TEXT |
| 12 | cognome_assistito | TEXT |
| 13 | nome_caregiver | TEXT |
| 14 | cognome_caregiver | TEXT |
| 15 | parentela_caregiver | TEXT |
| 16 | piano | TEXT |
| 17 | servizio | TEXT |
| 18 | indirizzo | TEXT |
| 19 | comune | TEXT |
| 20 | data_nascita | TEXT |
| 21 | codice_fiscale | TEXT |
| 22 | sesso | TEXT |
| 23 | peso | REAL |
| 24 | altezza | REAL |
| 25 | caregiver_nome | TEXT |
| 26 | caregiver_telefono | TEXT |
| 27 | fonte_override | TEXT |

---

## Tabella `lead_assistiti` (17 colonne)

| # | Colonna | Tipo |
|---|---------|------|
| 1 | id | INTEGER PK |
| 2 | lead_id | TEXT | 
| 3 | sort_order | INTEGER |
| 4 | nome | TEXT |
| 5 | cognome | TEXT |
| 6 | codice_fiscale | TEXT |
| 7 | data_nascita | TEXT |
| 8 | luogo_nascita | TEXT |
| 9 | indirizzo | TEXT |
| 10 | cap | TEXT |
| 11 | citta | TEXT |
| 12 | provincia | TEXT |
| 13 | indirizzo_spedizione | TEXT |
| 14 | note | TEXT |
| 15 | created_at | TEXT |
| 16 | updated_at | TEXT |
| 17 | intestatario_contratto | TEXT |
| 18 | nazione | TEXT |

---

## Alias form ↔ DB — riepilogo critico

Quando il form `modifica-dati.html` invia questi campi, vanno mappati così:

| Campo inviato dal form | Tabella | Colonna DB |
|------------------------|---------|------------|
| `peso` | configurations | `peso` |
| `altezza` | configurations | `altezza` |
| `allergie` | configurations | `allergie` |
| `patologie_croniche` | configurations | `patologie_croniche` |
| `altre_patologie` | configurations | `patologie` |
| `note_aggiuntive` | configurations | `note_mediche` |
| `farmaci` | configurations | `farmaci_data` |
| `terapia_farmacologica` | configurations | `farmaci_assunti` |
| `telefonoAssistito` | configurations | `telefono` |
| `contatto1/2/3_*` | configurations | `contatto1/2/3_*` (stesso nome) |
| `whitelist1/2/3_*` | configurations | `whitelist1/2/3_*` (stesso nome) |
| Tutto il resto (anagrafica, sped_*, condizioniSalute, note) | leads | stesso nome |
