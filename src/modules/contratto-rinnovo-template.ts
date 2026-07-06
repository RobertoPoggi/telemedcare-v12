// Auto-generated from templates/contracts/contratto_rinnovo_b2c.html
// DO NOT EDIT DIRECTLY — edit the source HTML file and regenerate
export const CONTRATTO_RINNOVO_B2C_TEMPLATE = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contratto Rinnovo eCura {{SERVIZIO}} {{PIANO}} — {{CODICE_CONTRATTO}}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 820px;
            margin: 0 auto;
            padding: 0;
            background: #fff;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #0066CC;
            padding: 28px 40px 22px 40px;
            margin-bottom: 0;
        }
        .logo-line {
            font-size: 13pt;
            font-weight: 700;
            color: #0066CC;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .company-tagline {
            font-size: 9.5pt;
            color: #555;
            margin-bottom: 12px;
        }
        .contract-title {
            font-size: 17pt;
            font-weight: 700;
            color: #1a1a1a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 10px 0 4px 0;
        }
        .contract-subtitle {
            font-size: 12pt;
            color: #0066CC;
            font-weight: 600;
            margin: 0 0 8px 0;
        }
        .rinnovo-badge {
            display: inline-block;
            background: #e8f5e9;
            border: 1.5px solid #27ae60;
            border-radius: 20px;
            padding: 5px 18px;
            font-size: 10pt;
            color: #1b5e20;
            font-weight: 700;
            margin: 6px 0 0 0;
        }
        .meta-row {
            background: #f4f7fc;
            border-top: 1px solid #dde3f0;
            padding: 10px 40px;
            display: flex;
            justify-content: space-between;
            font-size: 9.5pt;
            color: #444;
        }
        .body-content {
            padding: 28px 40px;
        }
        h2 {
            font-size: 11pt;
            font-weight: 700;
            color: #0066CC;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border-bottom: 1px solid #d1daf0;
            padding-bottom: 4px;
            margin: 24px 0 10px 0;
        }
        h2:first-child { margin-top: 0; }
        p { margin: 6px 0; text-align: justify; }
        ul { margin: 8px 0; padding-left: 22px; }
        ul li { margin-bottom: 4px; }
        .parties-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 10px 0;
        }
        .party-box {
            background: #f9fafb;
            border: 1px solid #e0e6f0;
            border-radius: 6px;
            padding: 14px 16px;
        }
        .party-box .party-label {
            font-size: 9pt;
            font-weight: 700;
            color: #0066CC;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        .article-title {
            font-size: 10.5pt;
            font-weight: 700;
            color: #0066CC;
            margin: 18px 0 6px 0;
        }
        .price-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 10.5pt;
        }
        .price-table td {
            padding: 9px 14px;
            border-bottom: 1px solid #e8edf5;
        }
        .price-table tr:last-child td { border-bottom: none; }
        .price-table .total-row td {
            background: #e8f0fc;
            font-weight: 700;
            font-size: 12pt;
            color: #0066CC;
            border-top: 2px solid #0066CC;
        }
        .price-table .label-col { color: #444; }
        .price-table .value-col {
            text-align: right;
            font-weight: 600;
            color: #1a1a1a;
        }
        .iban-box {
            background: #f0f4ff;
            border: 1px solid #b8c8f0;
            border-radius: 6px;
            padding: 12px 16px;
            margin: 10px 0;
            font-size: 10.5pt;
        }
        .iban-box .iban-value {
            font-family: 'Courier New', monospace;
            font-weight: 700;
            font-size: 12pt;
            color: #0066CC;
            letter-spacing: 1px;
        }
        .info-box {
            background: #fffbeb;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px 16px;
            margin: 16px 0;
            font-size: 10pt;
        }
        .recesso-box {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            border-radius: 6px;
            padding: 12px 16px;
            margin: 10px 0;
            font-size: 10pt;
        }
        /* Sezione firme olografiche */
        .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
        }
        .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 20px;
        }
        .signature-block {
            text-align: center;
        }
        .signature-line {
            border-top: 2px solid #1a1a1a;
            margin-top: 60px;
            padding-top: 8px;
            font-size: 10pt;
            font-weight: 600;
        }
        .specific-clauses-notice {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 6px;
            padding: 12px 16px;
            margin: 16px 0;
            font-size: 10pt;
        }
        .clause-approval-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 16px;
        }
        .footer-note {
            border-top: 2px solid #e0e6f0;
            padding: 14px 40px;
            font-size: 9pt;
            color: #777;
            text-align: center;
            margin-top: 10px;
        }
        @media print {
            body { background: white; }
            .header { padding: 20px 30px 16px 30px; }
            .body-content { padding: 20px 30px; }
        }
    </style>
</head>
<body>

    <!-- INTESTAZIONE -->
    <div class="header">
        <div class="logo-line">Medica GB S.r.l.</div>
        <div class="company-tagline">Startup Innovativa a Vocazione Sociale &nbsp;|&nbsp; P.IVA 12435130963 &nbsp;|&nbsp; info@ecura.it</div>
        <div class="contract-title">Contratto di Rinnovo Servizio</div>
        <div class="contract-subtitle">eCura {{SERVIZIO}} — Piano {{PIANO}}</div>
        <div class="rinnovo-badge">🔄 Rinnovo Anno {{ANNO_RINNOVO}}</div>
    </div>

    <div class="meta-row">
        <span><strong>Codice contratto:</strong> {{CODICE_CONTRATTO}}</span>
        <span><strong>Data:</strong> {{DATA_CONTRATTO}}</span>
        <span><strong>Rinnova:</strong> {{CODICE_CONTRATTO_ORIGINALE}}</span>
    </div>

    <div class="body-content">

        <!-- PARTI -->
        <h2>Parti del contratto</h2>
        <div class="parties-grid">
            <div class="party-box">
                <div class="party-label">Fornitore</div>
                <strong>Medica GB S.r.l.</strong><br>
                Startup Innovativa a Vocazione Sociale<br>
                Corso Giuseppe Garibaldi 34, 20121 Milano<br>
                Via delle Eriche 53, 16148 Genova<br>
                P.IVA: 12435130963 &nbsp;|&nbsp; REA: MI-2661409<br>
                PEC: info@pec.medicagb.it<br>
                Email: <a href="mailto:info@ecura.it">info@ecura.it</a><br>
                Tel: 335 730 1206 &nbsp;|&nbsp; 331 643 2390<br>
                <br>
                di seguito denominata <em>"<strong>Medica GB</strong>"</em>
            </div>
            <div class="party-box">
                <div class="party-label">Cliente</div>
                <strong>{{NOME_CLIENTE}} {{COGNOME_CLIENTE}}</strong><br>
                {{INDIRIZZO_CLIENTE}}<br>
                {{CAP_CLIENTE}} {{CITTA_CLIENTE}} ({{PROVINCIA_CLIENTE}})<br>
                Codice Fiscale: {{CF_CLIENTE}}<br>
                Email: {{EMAIL_CLIENTE}}<br>
                Telefono: {{TELEFONO_CLIENTE}}<br>
                <br>
                di seguito denominato/a <em>"<strong>Cliente</strong>"</em>
            </div>
        </div>

        <!-- ART. 1 — PREMESSE -->
        <h2>Art. 1 — Premesse</h2>
        <p>Le parti hanno già stipulato il contratto di servizio eCura {{SERVIZIO}} Piano {{PIANO}} con codice
        <strong>{{CODICE_CONTRATTO_ORIGINALE}}</strong>, firmato in data <strong>{{DATA_CONTRATTO_ORIGINALE}}</strong>
        con scadenza <strong>{{DATA_SCADENZA_ORIGINALE}}</strong>.</p>
        <p>Il Cliente ha regolarmente usufruito del servizio nel corso della prima annualità e intende proseguirlo
        alle condizioni agevolate previste per le annualità successive.</p>
        <p>Le parti concordano pertanto il rinnovo del contratto di servizio per una nuova annualità alle condizioni
        integralmente indicate nel presente documento.</p>

        <!-- ART. 2 — OGGETTO -->
        <h2>Art. 2 — Oggetto del rinnovo</h2>
        <p>Le parti concordano il rinnovo del servizio di teleassistenza e telemedicina denominato
        <strong>eCura {{SERVIZIO}}</strong> con <strong>Piano {{PIANO}}</strong>, per una nuova durata di
        <strong>12 (dodici) mesi</strong>.</p>
        <p>Il rinnovo comprende i seguenti servizi:</p>
        <ul>
            <li>Piattaforma web e applicazione mobile di teleassistenza per 12 mesi</li>
            <li>SIM dati per trasmissione parametri vitali e comunicazione vocale per 12 mesi</li>
            <li>Centrale Operativa H24/7 con operatori sanitari qualificati</li>
            <li>Monitoraggio parametri vitali e sistema di alerting 24/7</li>
            <li>Assistenza tecnica telefonica e da remoto per 12 mesi</li>
            <li>Aggiornamenti software e firmware del dispositivo <strong>{{DISPOSITIVO}}</strong></li>
            <li>Rilevamento automatico cadute con algoritmi avanzati</li>
            <li>GPS e geolocalizzazione in tempo reale</li>
            <li>Supporto familiare con notifiche push su App dedicata</li>
        </ul>
        <p><em>Il dispositivo <strong>{{DISPOSITIVO}}</strong> è già di proprietà del Cliente;
        il presente rinnovo non include la consegna di un nuovo dispositivo.</em></p>

        <!-- ART. 3 — DURATA -->
        <h2>Art. 3 — Durata</h2>
        <p>Il presente rinnovo ha durata di <strong>12 (dodici) mesi</strong>, con decorrenza
        <strong>{{DATA_INIZIO_SERVIZIO}}</strong> e scadenza <strong>{{DATA_SCADENZA}}</strong>.</p>
        <p>Il contratto non è soggetto a rinnovo tacito. Alla scadenza, l'eventuale prosecuzione del
        servizio sarà regolata da un nuovo accordo scritto tra le parti.</p>

        <!-- ART. 4 — CONDIZIONI ECONOMICHE -->
        <h2>Art. 4 — Condizioni economiche</h2>
        <table class="price-table">
            <tr>
                <td class="label-col">Importo rinnovo ({{IVA_LABEL}} esclusa)</td>
                <td class="value-col">€ {{IMPORTO_RINNOVO_NETTO}}</td>
            </tr>
            <tr>
                <td class="label-col">{{IVA_LABEL}}</td>
                <td class="value-col">€ {{IVA_IMPORTO}}</td>
            </tr>
            <tr class="total-row">
                <td class="label-col">TOTALE RINNOVO ({{IVA_LABEL}} inclusa){{IVA_NOTE}}</td>
                <td class="value-col">{{PREZZO_RINNOVO}}</td>
            </tr>
        </table>
        <p>La tariffa di rinnovo è <strong>agevolata rispetto alla prima annualità</strong>
        ({{PREZZO_TOTALE_PRIMO_ANNO}}) in quanto non include il costo del dispositivo e il setup iniziale.</p>
        <p>La medesima tariffa di <strong>{{PREZZO_RINNOVO}}</strong> si applicherà alle annualità successive,
        salvo variazioni comunicate per iscritto con almeno 30 giorni di anticipo.</p>

        <!-- ART. 5 — MODALITÀ DI PAGAMENTO -->
        <h2>Art. 5 — Modalità di pagamento</h2>
        <p>Medica GB S.r.l. emetterà proforma/fattura anticipata per il rinnovo dei 12 mesi.
        Il Cliente procederà al pagamento tramite <strong>bonifico bancario</strong>:</p>
        <div class="iban-box">
            <strong>Intestato a:</strong> Medica GB S.r.l.<br>
            <strong>Banca:</strong> Banca Popolare di Milano<br>
            <strong>IBAN:</strong> <span class="iban-value">IT97 L050 3401 7270 0000 0003 519</span><br>
            <strong>Causale:</strong> Rinnovo eCura {{SERVIZIO}} {{PIANO}} Anno {{ANNO_RINNOVO}} — {{CODICE_CONTRATTO}}
        </div>

        <!-- ART. 6 — ATTIVAZIONE E CONFIGURAZIONE -->
        <h2>Art. 6 — Attivazione e continuità del servizio</h2>
        <p>Il servizio proseguirà senza interruzioni dalla data di decorrenza indicata all'Art. 3,
        subordinatamente al ricevimento del pagamento entro la data di scadenza del contratto precedente.</p>
        <p>In caso di ritardo nel pagamento superiore a <strong>15 giorni lavorativi</strong> dalla scadenza,
        Medica GB si riserva di sospendere il servizio sino alla regolarizzazione del dovuto.</p>

        <!-- ART. 7 — GARANZIE E ASSISTENZA TECNICA -->
        <h2>Art. 7 — Garanzie e assistenza tecnica</h2>
        <p><strong>7.1 Assistenza tecnica:</strong> Supporto tecnico telefonico gratuito
        <strong>24 ore su 24, 7 giorni su 7</strong> per malfunzionamenti, problemi di configurazione
        o supporto all'utilizzo.</p>
        <p><strong>7.2 Sostituzione dispositivo:</strong> In caso di guasto o malfunzionamento accertato
        del dispositivo {{DISPOSITIVO}}, Medica GB fornirà un dispositivo sostitutivo gratuito entro
        <strong>48 ore</strong> lavorative.</p>
        <p><strong>7.3 Aggiornamenti:</strong> Software e firmware del dispositivo saranno aggiornati
        <strong>gratuitamente</strong> per tutta la durata del contratto, garantendo sicurezza, nuove
        funzioni e miglioramenti prestazionali.</p>

        <!-- ART. 8 — BENEFICI FISCALI -->
        <h2>Art. 8 — Benefici fiscali</h2>
        <p><strong>8.1 Detrazione fiscale 19%:</strong> Il servizio eCura con dispositivo medico certificato
        è <strong>detraibile come spesa sanitaria</strong> nella dichiarazione dei redditi (19% della spesa
        sostenuta), ai sensi dell'Art. 15, comma 1, lett. c) del TUIR (DPR 917/86).</p>
        <p><strong>8.2 Documentazione fiscale:</strong> Medica GB fornirà la certificazione fiscale con
        tutti i dati necessari per la compilazione del Modello 730 o Unico.</p>

        <!-- ART. 9 — RECESSO -->
        <div class="recesso-box">
            <strong>Art. 9 — Diritto di recesso (D.Lgs. 206/2005 — Codice del Consumo)</strong><br><br>
            Il Cliente ha diritto di recedere dal presente rinnovo entro <strong>14 (quattordici) giorni</strong>
            dalla sottoscrizione, senza necessità di fornire motivazioni, inviando comunicazione scritta a
            <a href="mailto:info@ecura.it">info@ecura.it</a> o tramite raccomandata A/R a Medica GB S.r.l.,
            Corso Garibaldi 34, 20121 Milano.<br><br>
            In caso di recesso esercitato entro il termine, Medica GB procederà al rimborso completo
            dell'importo eventualmente già versato entro 14 giorni dal ricevimento della comunicazione.
        </div>

        <!-- ART. 10 — PRIVACY E GDPR -->
        <h2>Art. 10 — Privacy e trattamento dei dati personali</h2>
        <p><strong>10.1 Normativa applicabile:</strong> Il trattamento dei dati personali e sanitari avviene
        nel pieno rispetto del GDPR (Regolamento UE 2016/679) e del D.Lgs. 196/2003 e s.m.i.</p>
        <p><strong>10.2 Finalità del trattamento:</strong> I dati vengono raccolti e utilizzati
        esclusivamente per l'erogazione del servizio di teleassistenza, monitoraggio parametri vitali,
        gestione emergenze sanitarie, comunicazione con la Centrale Operativa e adempimenti contrattuali,
        fiscali e amministrativi.</p>
        <p><strong>10.3 Sicurezza dati:</strong> Medica GB garantisce misure tecniche e organizzative
        adeguate per proteggere i dati da accessi non autorizzati. I dati sanitari sono criptati e
        conservati su server in UE conformi ISO 27001.</p>
        <p><strong>10.4 Diritti dell'interessato:</strong> Il Cliente può esercitare i diritti previsti
        dal GDPR (accesso, rettifica, cancellazione, limitazione, portabilità) contattando:
        <a href="mailto:privacy@ecura.it">privacy@ecura.it</a></p>

        <!-- ART. 11 — RESPONSABILITÀ -->
        <h2>Art. 11 — Responsabilità e limitazioni</h2>
        <p>Medica GB si impegna a garantire la continuità e la qualità del servizio eCura per tutta la
        durata del contratto. La responsabilità di Medica GB è limitata all'importo annuale corrisposto
        per il presente rinnovo.</p>
        <p>Il servizio eCura è un sistema di supporto e monitoraggio: non sostituisce l'assistenza medica
        professionale e il ricorso al sistema di emergenza sanitaria (118) in caso di necessità.</p>
        <p>In caso di mancato pagamento oltre <strong>30 giorni</strong> dalla scadenza, Medica GB potrà
        risolvere il contratto con sospensione del servizio e richiesta di restituzione del dispositivo.</p>

        <!-- ART. 12 — FORO COMPETENTE -->
        <h2>Art. 12 — Foro competente e legge applicabile</h2>
        <p>Il presente contratto è regolato dalla legge italiana. Per qualsiasi controversia derivante
        dal presente contratto di rinnovo, le parti eleggono come foro competente il
        <strong>Tribunale di Milano</strong>, salvo diversa disposizione normativa inderogabile a
        tutela del consumatore (foro del consumatore ai sensi del D.Lgs. 206/2005).</p>

        <!-- ART. 13 — DISPOSIZIONI FINALI -->
        <h2>Art. 13 — Disposizioni finali</h2>
        <p>Eventuali modifiche al presente contratto devono essere concordate per iscritto tra le parti.
        Tutte le comunicazioni relative al contratto verranno inviate all'indirizzo email indicato:
        <strong>{{EMAIL_CLIENTE}}</strong></p>
        <p>Il presente contratto, firmato dalle parti (digitalmente o con firma olografica), ha
        <strong>piena validità legale</strong> ai sensi del D.Lgs. 82/2005 (CAD) e del Regolamento
        UE eIDAS 910/2014.</p>

        <!-- APPROVAZIONE CLAUSOLE SPECIFICHE -->
        <div class="specific-clauses-notice">
            <strong>Approvazione specifica delle clausole onerose</strong><br>
            Ai sensi degli artt. 1341 e 1342 c.c., il Cliente dichiara di aver letto, compreso e di
            approvare specificatamente le seguenti clausole: <strong>Art. 3</strong> (durata e assenza
            di rinnovo tacito), <strong>Art. 6</strong> (sospensione servizio per ritardato pagamento),
            <strong>Art. 9</strong> (diritto di recesso), <strong>Art. 11</strong> (limitazione di
            responsabilità), <strong>Art. 12</strong> (foro competente).
        </div>
        <div class="clause-approval-grid">
            <div>
                <p style="margin-bottom:4px;"><strong>Il Cliente</strong><br>
                {{NOME_CLIENTE}} {{COGNOME_CLIENTE}}</p>
                <div style="border-top:2px solid #1a1a1a;margin-top:50px;padding-top:8px;font-size:10pt;font-weight:600;">Firma per approvazione clausole</div>
            </div>
            <div>
                <p style="margin-bottom:4px;"><strong>Medica GB S.r.l.</strong><br>
                Legale Rappresentante</p>
                <div style="border-top:2px solid #1a1a1a;margin-top:50px;padding-top:8px;font-size:10pt;font-weight:600;">Firma e Timbro</div>
            </div>
        </div>

        <!-- FIRME FINALI -->
        <div class="signature-section">
            <div class="info-box">
                <strong>ℹ️ Informazione importante:</strong><br>
                Firmando il presente documento, il Cliente conferma di aver letto e accettato tutte le
                condizioni del rinnovo, inclusa la tariffa annuale di <strong>{{PREZZO_RINNOVO}}</strong>
                ({{IVA_LABEL}} inclusa). La firma digitale ha piena validità legale ai sensi del D.Lgs.
                82/2005 (CAD). In alternativa alla firma digitale, è possibile firmare il documento
                manualmente e inviarlo scannerizzato a
                <a href="mailto:info@ecura.it">info@ecura.it</a>.
            </div>

            <p style="margin-top:20px;">Letto, compreso e accettato in ogni sua parte.</p>
            <p><strong>Luogo e data:</strong> _____________________________, {{DATA_CONTRATTO}}</p>

            <div class="signature-grid">
                <div class="signature-block">
                    <p><strong>IL CLIENTE</strong></p>
                    <p>{{NOME_CLIENTE}} {{COGNOME_CLIENTE}}</p>
                    <div class="signature-line">Firma</div>
                </div>
                <div class="signature-block">
                    <p><strong>MEDICA GB S.R.L.</strong></p>
                    <p>Legale Rappresentante</p>
                    <div class="signature-line">Firma e Timbro</div>
                </div>
            </div>
        </div>

    </div>

    <div class="footer-note">
        Documento generato il {{DATA_CONTRATTO}} &nbsp;|&nbsp;
        Medica GB S.r.l. &nbsp;|&nbsp; P.IVA 12435130963 &nbsp;|&nbsp;
        <a href="mailto:info@ecura.it">info@ecura.it</a> &nbsp;|&nbsp;
        <a href="https://www.ecura.it">www.ecura.it</a>
    </div>

</body>
</html>
`;

/**
 * PROFORMA_INTERNA_TEMPLATE
 * Template HTML per Pro Forma interna stile "amministrativo" — da usare con
 * l'endpoint /api/contracts/:id/genera-proforma-interna-html.
 * Variabili: {{NOME}}, {{COGNOME}}, {{CF}}, {{INDIRIZZO}}, {{CAP_CITTA}},
 *            {{DATA_ATTIVAZIONE}}, {{NETTO}}, {{IVA_PCT}}, {{IVA_AMT}}, {{TOTALE}},
 *            {{SIM}}, {{SN_DISPOSITIVO}}, {{DISPOSITIVO}}, {{BD_RDM}},
 *            {{CODICE_PROFORMA}}, {{DATA_DOC}},
 *            {{TIPO_PRESTAZIONE_TESTO}}, {{TITOLO_PRESTAZIONE}},
 *            {{BADGE_RINNOVO}}, {{CAUSALE_BONIFICO}}
 */
export const PROFORMA_INTERNA_TEMPLATE = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pro Forma — {{NOME}} {{COGNOME}}</title>
<style>
@page { size: A4; margin: 18mm 18mm 22mm 18mm; }
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #111; line-height: 1.45; margin: 0; }
.top-line { border-top: 2px solid #333; margin-bottom: 6px; }
.header-title { text-align: center; font-size: 14pt; font-weight: bold; margin: 10px 0 4px; letter-spacing: 0.5px; }
.header-date  { text-align: center; font-size: 10pt; margin-bottom: 16px; }
.section-title { font-size: 10.5pt; font-weight: bold; border-bottom: 1px solid #555; margin: 14px 0 6px; padding-bottom: 2px; letter-spacing: 0.3px; }
.data-grid { display: grid; grid-template-columns: 160px 1fr; gap: 3px 8px; margin-bottom: 4px; }
.data-label { font-weight: bold; color: #333; }
.data-value { color: #111; }
.prestazione-box { border: 1px solid #aaa; padding: 10px 12px; margin: 10px 0; font-size: 9.5pt; line-height: 1.55; background: #fafafa; }
.totale-box { background: #f0f4ff; border: 2px solid #2a5abd; border-radius: 4px; padding: 10px 16px; margin: 14px 0; text-align: right; font-size: 13pt; font-weight: bold; color: #1a3a9e; }
.iban-box { background: #fffbe6; border: 1px solid #d4a017; border-radius: 4px; padding: 10px 14px; margin: 10px 0; font-size: 9.5pt; }
.iban-value { font-family: 'Courier New', monospace; font-size: 11pt; font-weight: bold; color: #1a3a9e; letter-spacing: 1px; }
.nota-legale { font-size: 8.5pt; color: #555; font-style: italic; margin: 16px 0 6px; border-top: 1px solid #ccc; padding-top: 8px; }
.footer { text-align: center; font-size: 8pt; color: #555; margin-top: 10px; }
.footer-line { border-top: 1px solid #888; margin-bottom: 6px; }
.badge-rinnovo { display: inline-block; background: #e8f5e9; border: 1.5px solid #27ae60; border-radius: 12px; padding: 2px 14px; font-size: 9pt; color: #1b5e20; font-weight: bold; margin-left: 8px; }
</style>
</head>
<body>
<div class="top-line"></div>
<div class="header-title">PRO FORMA MEDICA GB SRL {{BADGE_RINNOVO}}</div>
<div class="header-date">{{DATA_DOC}} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>{{CODICE_PROFORMA}}</strong></div>

<div class="section-title">ANAGRAFICA PAZIENTE</div>
<div class="data-grid">
  <span class="data-label">NOME:</span>         <span class="data-value">{{NOME}}</span>
  <span class="data-label">COGNOME:</span>      <span class="data-value">{{COGNOME}}</span>
  <span class="data-label">C.F.:</span>         <span class="data-value"><strong>{{CF}}</strong></span>
  <span class="data-label">RESIDENTE IN:</span> <span class="data-value">{{INDIRIZZO}}</span>
  <span class="data-label">CITTÀ:</span>        <span class="data-value">{{CAP_CITTA}}</span>
</div>

<div class="section-title">{{TITOLO_PRESTAZIONE}}</div>
<div class="data-grid">
  <span class="data-label">DATA ATTIVAZIONE:</span> <span class="data-value"><strong>{{DATA_ATTIVAZIONE}}</strong></span>
  <span class="data-label">TIPO DI PRESTAZIONE:</span> <span class="data-value"></span>
</div>
<div class="prestazione-box">{{TIPO_PRESTAZIONE_TESTO}}</div>

<div class="totale-box">
  IMPONIBILE: € {{NETTO}} &nbsp;+&nbsp; IVA {{IVA_PCT}}% (€ {{IVA_AMT}}) &nbsp;=&nbsp;
  <span style="font-size:15pt;">TOTALE: € {{TOTALE}}</span>
</div>

<div class="section-title">PAGAMENTO CON BONIFICO</div>
<div class="iban-box">
  <div style="margin-bottom:6px;"><strong>Intestato a:</strong> Medica GB S.r.l. &nbsp;&nbsp; <strong>Banca:</strong> Banca BPM S.p.A. – Filiale Milano-Garibaldi</div>
  <div style="margin-bottom:4px;"><strong>ABI:</strong> 05034 &nbsp;&nbsp; <strong>CAB:</strong> 01727 &nbsp;&nbsp; <strong>C/C:</strong> 03519</div>
  <div><strong>IBAN:</strong> <span class="iban-value">IT97 L050 3401 7270 0000 0003 519</span></div>
  <div style="margin-top:6px;"><strong>Causale:</strong> {{CAUSALE_BONIFICO}}</div>
</div>

<div class="nota-legale">
  Il presente documento non costituisce fattura che verrà emessa all'atto del pagamento ai sensi dell'art. 6 DPR 26.10.1972 n. 633.
</div>

<div class="footer">
  <div class="footer-line"></div>
  <p><strong>Medica GB S.r.l.</strong> &nbsp;|&nbsp; Corso Garibaldi 34 – 20121 Milano</p>
  <p>PEC: medicagbsrl@pecimprese.it &nbsp;|&nbsp; E.mail: info@medicagb.it</p>
  <p>Codice Fiscale e P.IVA: 12435130963 &nbsp;|&nbsp; REA: MI-2661409 &nbsp;|&nbsp; www.medicagb.it</p>
</div>
</body>
</html>
`;
