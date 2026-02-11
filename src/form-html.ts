export const FORM_HTML = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Completa i tuoi dati - eCura</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 800px;
            width: 100%;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .section-header {
            color: #475569;
            font-size: 18px;
            margin: 30px 0 20px 0;
            font-weight: 600;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
        }
        .form-row {
            display: grid;
            gap: 15px;
            margin-bottom: 20px;
        }
        .form-row.cols-2 {
            grid-template-columns: 1fr 1fr;
        }
        .form-row.cols-3 {
            grid-template-columns: 2fr 1fr 1fr;
        }
        .form-row.date-location {
            grid-template-columns: 1fr 1fr;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #475569;
            font-weight: 600;
            font-size: 14px;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            transition: border-color 0.3s;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        .date-input-group {
            display: flex;
            gap: 8px;
        }
        .date-input-group input {
            text-align: center;
            padding: 12px 8px;
        }
        .date-input-group input.day,
        .date-input-group input.month {
            flex: 1;
        }
        .date-input-group input.year {
            flex: 1.5;
        }
        .required {
            color: #ef4444;
        }
        .submit-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
            transition: opacity 0.3s;
        }
        .submit-button:hover:not(:disabled) {
            opacity: 0.9;
        }
        .submit-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .checkbox-wrapper {
            display: flex;
            align-items: flex-start;
            margin: 20px 0;
        }
        .checkbox-wrapper input[type="checkbox"] {
            width: auto;
            margin-right: 10px;
            margin-top: 3px;
        }
        .checkbox-wrapper label {
            font-weight: normal;
            font-size: 14px;
        }
        .error {
            background: #fee;
            border: 2px solid #fcc;
            color: #c33;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .success {
            text-align: center;
            padding: 40px;
        }
        .success-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        .loading {
            display: none;
            text-align: center;
            padding: 40px;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
            .form-row.cols-2,
            .form-row.cols-3,
            .form-row.date-location {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 Completa i tuoi dati</h1>
            <p>Ultimi dettagli per la tua richiesta eCura</p>
        </div>
        
        <div class="content" id="mainContent">
            <div class="loading" id="loadingDiv">
                <div class="spinner"></div>
                <p>Caricamento dati in corso...</p>
            </div>
            
            <div id="formContainer" style="display: none;">
                <p class="greeting" id="greeting">Gentile Cliente,</p>
                
                <form id="completaForm" onsubmit="submitForm(event)">
                    <div id="formFieldsContainer"></div>
                    
                    <div class="form-group">
                        <label for="note">Note aggiuntive (facoltativo)</label>
                        <textarea id="note" name="note" rows="3" placeholder="Eventuali richieste o informazioni aggiuntive..."></textarea>
                    </div>
                    
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="gdprConsent" name="gdprConsent" value="1" required>
                        <label for="gdprConsent">
                            Accetto l'<a href="/privacy" target="_blank" style="color: #667eea;">informativa sulla privacy</a> <span class="required">*</span>
                        </label>
                    </div>
                    
                    <button type="submit" class="submit-button" id="submitBtn">
                        ✉️ Conferma e Invia
                    </button>
                </form>
            </div>
            
            <div id="errorDiv" class="error" style="display: none;"></div>
        </div>
    </div>
    
    <script>
        let leadId = null;
        
        // Estrai leadId dall'URL
        const urlParams = new URLSearchParams(window.location.search);
        leadId = urlParams.get('leadId') || urlParams.get('id');
        
        if (!leadId) {
            showError('Link non valido. Manca l\\'ID del lead.');
        } else {
            loadLeadData();
        }
        
        async function loadLeadData() {
            const loadingDiv = document.getElementById('loadingDiv');
            const formContainer = document.getElementById('formContainer');
            
            loadingDiv.style.display = 'block';
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}\`);
                
                if (!response.ok) {
                    throw new Error('Lead non trovato');
                }
                
                const result = await response.json();
                const lead = result.lead || result;
                
                // Aggiorna greeting
                const greeting = document.getElementById('greeting');
                greeting.textContent = \`Gentile \${lead.nomeRichiedente || ''} \${lead.cognomeRichiedente || ''},\`;
                
                // Genera campi form
                generateFormFields(lead);
                
                loadingDiv.style.display = 'none';
                formContainer.style.display = 'block';
                
            } catch (error) {
                console.error('Errore caricamento lead:', error);
                showError('Impossibile caricare i dati. Verifica il link o contattaci a info@telemedcare.it');
            }
        }
        
        function generateFormFields(lead) {
            const container = document.getElementById('formFieldsContainer');
            let html = '';
            
            // SEZIONE 1: Dati Intestatario (per il contratto)
            const needsIntestatario = !lead.cfIntestatario || !lead.indirizzoIntestatario || 
                                     !lead.capIntestatario || !lead.cittaIntestatario;
            
            if (needsIntestatario) {
                html += '<h3 class="section-header">📋 Dati Intestatario (per la proposta)</h3>';
                
                if (!lead.cfIntestatario) {
                    html += \`
                        <div class="form-group">
                            <label for="cfIntestatario">Codice Fiscale <span class="required">*</span></label>
                            <input type="text" id="cfIntestatario" name="cfIntestatario" 
                                   placeholder="Es. RSSMRA80A01F205K" required 
                                   maxlength="16" style="text-transform: uppercase;">
                        </div>
                    \`;
                }
                
                // Indirizzo, CAP, Città sulla stessa riga
                const hasAddressGaps = !lead.indirizzoIntestatario || !lead.capIntestatario || !lead.cittaIntestatario;
                if (hasAddressGaps) {
                    html += '<div class="form-row cols-3">';
                    
                    if (!lead.indirizzoIntestatario) {
                        html += \`
                            <div class="form-group">
                                <label for="indirizzoIntestatario">Indirizzo <span class="required">*</span></label>
                                <input type="text" id="indirizzoIntestatario" name="indirizzoIntestatario" 
                                       placeholder="Via/Piazza Nome, N." required>
                            </div>
                        \`;
                    }
                    
                    if (!lead.capIntestatario) {
                        html += \`
                            <div class="form-group">
                                <label for="capIntestatario">CAP <span class="required">*</span></label>
                                <input type="text" id="capIntestatario" name="capIntestatario" 
                                       placeholder="00000" required maxlength="5" 
                                       pattern="[0-9]*" inputmode="numeric">
                            </div>
                        \`;
                    }
                    
                    if (!lead.cittaIntestatario) {
                        html += \`
                            <div class="form-group">
                                <label for="cittaIntestatario">Città <span class="required">*</span></label>
                                <input type="text" id="cittaIntestatario" name="cittaIntestatario" 
                                       placeholder="Es. Milano" required>
                            </div>
                        \`;
                    }
                    
                    html += '</div>';
                }
            }
            
            // SEZIONE 2: Dati Assistito
            const needsAssistito = !lead.nomeAssistito || !lead.cognomeAssistito || 
                                  !lead.dataNascitaAssistito || !lead.luogoNascitaAssistito ||
                                  !lead.cfAssistito || !lead.indirizzoAssistito || 
                                  !lead.capAssistito || !lead.cittaAssistito || !lead.condizioniSalute;
            
            if (needsAssistito) {
                html += '<h3 class="section-header">👤 Dati Assistito</h3>';
                
                // Nome e Cognome sulla stessa riga
                const needsNameSurname = !lead.nomeAssistito || !lead.cognomeAssistito;
                if (needsNameSurname) {
                    html += '<div class="form-row cols-2">';
                    
                    if (!lead.nomeAssistito) {
                        html += \`
                            <div class="form-group">
                                <label for="nomeAssistito">Nome <span class="required">*</span></label>
                                <input type="text" id="nomeAssistito" name="nomeAssistito" 
                                       placeholder="Nome" required>
                            </div>
                        \`;
                    }
                    
                    if (!lead.cognomeAssistito) {
                        html += \`
                            <div class="form-group">
                                <label for="cognomeAssistito">Cognome <span class="required">*</span></label>
                                <input type="text" id="cognomeAssistito" name="cognomeAssistito" 
                                       placeholder="Cognome" required>
                            </div>
                        \`;
                    }
                    
                    html += '</div>';
                }
                
                // Data e Luogo di nascita sulla stessa riga
                const needsBirthInfo = !lead.dataNascitaAssistito || !lead.luogoNascitaAssistito;
                if (needsBirthInfo) {
                    html += '<div class="form-row date-location">';
                    
                    if (!lead.dataNascitaAssistito) {
                        html += \`
                            <div class="form-group">
                                <label for="dataNascitaAssistito">Data di Nascita <span class="required">*</span></label>
                                <div class="date-input-group">
                                    <input type="text" class="day" id="dataNascitaAssistito_giorno" 
                                           maxlength="2" placeholder="GG"
                                           onkeyup="autoFocusDate(event, 'dataNascitaAssistito_mese', 2); updateDateField('dataNascitaAssistito')" 
                                           pattern="[0-9]*" inputmode="numeric" required>
                                    <input type="text" class="month" id="dataNascitaAssistito_mese" 
                                           maxlength="2" placeholder="MM"
                                           onkeyup="autoFocusDate(event, 'dataNascitaAssistito_anno', 2); updateDateField('dataNascitaAssistito')" 
                                           pattern="[0-9]*" inputmode="numeric" required>
                                    <input type="text" class="year" id="dataNascitaAssistito_anno" 
                                           maxlength="4" placeholder="AAAA"
                                           onkeyup="updateDateField('dataNascitaAssistito')" 
                                           pattern="[0-9]*" inputmode="numeric" required>
                                </div>
                                <input type="hidden" id="dataNascitaAssistito" name="dataNascitaAssistito">
                            </div>
                        \`;
                    }
                    
                    if (!lead.luogoNascitaAssistito) {
                        html += \`
                            <div class="form-group">
                                <label for="luogoNascitaAssistito">Luogo di Nascita <span class="required">*</span></label>
                                <input type="text" id="luogoNascitaAssistito" name="luogoNascitaAssistito" 
                                       placeholder="Es. Milano" required>
                            </div>
                        \`;
                    }
                    
                    html += '</div>';
                }
                
                // Codice Fiscale
                if (!lead.cfAssistito) {
                    html += \`
                        <div class="form-group">
                            <label for="cfAssistito">Codice Fiscale <span class="required">*</span></label>
                            <input type="text" id="cfAssistito" name="cfAssistito" 
                                   placeholder="Es. RSSMRA80A01F205K" required 
                                   maxlength="16" style="text-transform: uppercase;">
                        </div>
                    \`;
                }
                
                // Indirizzo, CAP, Città sulla stessa riga
                const hasAssistitoAddressGaps = !lead.indirizzoAssistito || !lead.capAssistito || !lead.cittaAssistito;
                if (hasAssistitoAddressGaps) {
                    html += '<div class="form-row cols-3">';
                    
                    if (!lead.indirizzoAssistito) {
                        html += \`
                            <div class="form-group">
                                <label for="indirizzoAssistito">Indirizzo <span class="required">*</span></label>
                                <input type="text" id="indirizzoAssistito" name="indirizzoAssistito" 
                                       placeholder="Via/Piazza Nome, N." required>
                            </div>
                        \`;
                    }
                    
                    if (!lead.capAssistito) {
                        html += \`
                            <div class="form-group">
                                <label for="capAssistito">CAP <span class="required">*</span></label>
                                <input type="text" id="capAssistito" name="capAssistito" 
                                       placeholder="00000" required maxlength="5" 
                                       pattern="[0-9]*" inputmode="numeric">
                            </div>
                        \`;
                    }
                    
                    if (!lead.cittaAssistito) {
                        html += \`
                            <div class="form-group">
                                <label for="cittaAssistito">Città <span class="required">*</span></label>
                                <input type="text" id="cittaAssistito" name="cittaAssistito" 
                                       placeholder="Es. Roma" required>
                            </div>
                        \`;
                    }
                    
                    html += '</div>';
                }
                
                // Condizioni di Salute
                if (!lead.condizioniSalute) {
                    html += \`
                        <div class="form-group">
                            <label for="condizioniSalute">Condizioni di Salute <span class="required">*</span></label>
                            <textarea id="condizioniSalute" name="condizioniSalute" 
                                      placeholder="Descrivi brevemente le condizioni di salute dell'assistito..." 
                                      rows="4" required></textarea>
                        </div>
                    \`;
                }
            }
            
            if (!needsIntestatario && !needsAssistito) {
                showError('Tutti i dati sono già completi!');
                return;
            }
            
            container.innerHTML = html;
        }
        
        async function submitForm(event) {
            event.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            
            submitBtn.textContent = '⏳ Invio in corso...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}/complete\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    showSuccess();
                } else {
                    throw new Error('Errore invio dati');
                }
                
            } catch (error) {
                console.error('Errore submit:', error);
                submitBtn.textContent = '✉️ Conferma e Invia';
                submitBtn.disabled = false;
                showError('Errore invio dati. Riprova o contattaci a info@telemedcare.it');
            }
        }
        
        function showError(message) {
            document.getElementById('loadingDiv').style.display = 'none';
            document.getElementById('formContainer').style.display = 'none';
            const errorDiv = document.getElementById('errorDiv');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        
        function showSuccess() {
            const content = document.getElementById('mainContent');
            content.innerHTML = \`
                <div class="success">
                    <div class="success-icon">✅</div>
                    <h2 style="color: #10b981; margin: 0 0 10px 0;">Dati salvati con successo!</h2>
                    <p style="color: #64748b; margin: 10px 0;">Grazie per aver completato i tuoi dati.</p>
                    <p style="color: #64748b;">Il nostro team ti contatterà presto per finalizzare la tua richiesta.</p>
                    <button onclick="window.close()" class="submit-button" style="margin-top: 20px;">
                        ✓ Conferma
                    </button>
                </div>
            \`;
        }
        
        // Auto-focus tra campi data (giorno → mese → anno)
        function autoFocusDate(event, nextFieldId, maxLength) {
            const input = event.target;
            const value = input.value;
            
            // Permetti solo numeri
            input.value = value.replace(/[^0-9]/g, '');
            
            // Se raggiunge la lunghezza massima, passa al campo successivo
            if (input.value.length >= maxLength && nextFieldId) {
                const nextField = document.getElementById(nextFieldId);
                if (nextField) {
                    nextField.focus();
                }
            }
        }
        
        // Aggiorna il campo hidden con formato YYYY-MM-DD
        function updateDateField(fieldName) {
            const giorno = document.getElementById(fieldName + '_giorno')?.value.padStart(2, '0') || '';
            const mese = document.getElementById(fieldName + '_mese')?.value.padStart(2, '0') || '';
            const anno = document.getElementById(fieldName + '_anno')?.value || '';
            
            if (giorno && mese && anno && anno.length === 4) {
                const dataISO = \`\${anno}-\${mese}-\${giorno}\`;
                const hiddenField = document.getElementById(fieldName);
                if (hiddenField) {
                    hiddenField.value = dataISO;
                }
            }
        }
    </script>
</body>
</html>
`;
