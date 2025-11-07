# Sistema Cartelle Documenti TeleMedCare V11.0

## Struttura Organizzata

### `/contratti/` - Contratti Pre-compilati
Contiene tutti i contratti generati automaticamente dal sistema, **non ancora firmati**.

**Formato nome file:**
```
YYYY-MM-DD_COGNOME_NOME_CONTRACT_XXXXXX.txt
```

**Esempio:**
```
2024-01-15_Rossi_Mario_CONTRACT_2024_123456.txt
```

### `/proforma/` - Proforma Pre-compilate
Contiene tutte le proforma unificate generate automaticamente con i dati cliente e IBAN reale Medica GB.

**Formato nome file:**
```
YYYY-MM-DD_COGNOME_NOME_PROFORMA_XXXXXX.txt
```

**Esempio:**
```
2024-01-15_Rossi_Mario_PROFORMA_2024_123456.txt
```

### `/contratti_firmati/` - Contratti Completati
Contiene tutti i contratti **firmati** (manualmente o elettronicamente) e completati.

**Formato nome file:**
```
YYYY-MM-DD_COGNOME_NOME_SIGNED_METODO_XXXXXX.pdf
```

**Esempi:**
```
2024-01-15_Rossi_Mario_SIGNED_MANUAL_123456.pdf
2024-01-15_Rossi_Mario_SIGNED_ELECTRONIC_123456.pdf  
2024-01-15_Rossi_Mario_SIGNED_DOCUSIGN_123456.pdf
```

## Flusso Automatizzato

1. **Lead da Landing Page** (`www.telemedcare.it`)
   - ConfigurationFormService valida dati form
   - Se lead richiede contratto + ha tutti i dati → pre-compila automaticamente

2. **Pre-compilazione Automatica**
   - ContractService genera contratto personalizzato
   - ContractService genera proforma con IBAN reale
   - Salvataggio in `/contratti/` e `/proforma/`

3. **Invio Email Automatico** (se richiesto)
   - EmailService invia contratto via email
   - Template professionale con link download

4. **Processo Firma**
   - SignatureService gestisce firma (manuale/elettronica/DocuSign)
   - Documento firmato salvato in `/contratti_firmati/`

5. **Campi Mancanti**
   - Se mancano dati (CF, indirizzo), genera form dinamico
   - Lead può completare i dati in secondo momento

## Integrazione Real-Time

### Dati Form Mapping
Il form esistente di `www.telemedcare.it` mappa direttamente:

| Campo Form Landing | Campo ContractService |
|-------------------|----------------------|
| Nome/Cognome | nomeRichiedente/cognomeRichiedente |
| Nome/Cognome Assistito | nomeAssistito/cognomeAssistito |
| Data Nascita Assistito | dataNascita (con calcolo età automatico) |
| Email/Telefono | emailRichiedente/telefonoRichiedente |
| Servizio Interesse | tipoServizio (BASE/AVANZATO) |
| Condizioni Mediche | Note aggiuntive nel contratto |

### Endpoint API Principali

- `POST /api/forms/process-telemedcare-lead` - Processa lead completo
- `POST /api/forms/precompile-contract` - Pre-compila solo contratto  
- `POST /api/forms/validate` - Valida dati form
- `POST /api/forms/generate-missing-fields` - Form per campi mancanti

## Sicurezza e Backup

- **GDPR Compliant**: Consenso privacy obbligatorio
- **Backup Automatico**: Tutti i documenti sono tracciati
- **Versioning**: ID univoci per ogni documento
- **Audit Trail**: Log completo delle operazioni

## Note di Implementazione

- **Zero-cost Deployment**: Sistema completamente serverless
- **Real Templates**: Utilizza template reali di Medica GB
- **IBAN Autentico**: IT97L0503401727000000003519 (Medica GB)
- **Multi-gateway**: Integrato con Stripe, SEPA, bonifici
- **Multi-firma**: Manuale, elettronica, DocuSign, Adobe Sign