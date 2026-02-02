// HTML per form completamento dati lead
export const completaDatiHtml = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Completa i tuoi dati - eCura</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-purple-600 to-purple-800 min-h-screen flex items-center justify-center p-5">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8 text-center">
            <h1 class="text-3xl font-bold mb-2">📝 Completa i tuoi dati</h1>
            <p class="text-purple-100">Ultimi dettagli per la tua richiesta eCura</p>
        </div>
        
        <!-- Content -->
        <div class="p-8" id="mainContent">
            <div id="loadingDiv" class="text-center py-10">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mb-4"></div>
                <p class="text-gray-600">Caricamento dati in corso...</p>
            </div>
            
            <div id="formContainer" style="display: none;">
                <p id="greeting" class="text-xl text-gray-800 mb-6">Gentile Cliente,</p>
                
                <!-- Box verde "Dati disponibili" RIMOSSO - ridondante -->
                
                <form id="completaForm" class="space-y-4">
                    <div id="missingFieldsContainer"></div>
                    
                    <div>
                        <label for="note" class="block text-sm font-semibold text-gray-700 mb-2">Note aggiuntive (facoltativo)</label>
                        <textarea id="note" name="note" rows="3" placeholder="Eventuali richieste o informazioni aggiuntive..." class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"></textarea>
                    </div>
                    
                    <div class="flex items-start">
                        <input type="checkbox" id="gdprConsent" name="gdprConsent" value="1" required class="mt-1 mr-3 w-5 h-5">
                        <label for="gdprConsent" class="text-sm text-gray-700">
                            Accetto l'<a href="/privacy" target="_blank" class="text-purple-600 underline">informativa sulla privacy</a> <span class="text-red-500">*</span>
                        </label>
                    </div>
                    
                    <button type="submit" id="submitBtn" class="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition">
                        ✉️ Conferma e Invia
                    </button>
                </form>
            </div>
            
            <div id="errorDiv" class="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg" style="display: none;"></div>
        </div>
    </div>
    
    <script>
        let leadId = null;
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
                if (!response.ok) throw new Error('Lead non trovato');
                
                const result = await response.json();
                const lead = result.lead || result;
                
                document.getElementById('greeting').textContent = \`Gentile \${lead.nomeRichiedente || ''} \${lead.cognomeRichiedente || ''},\`;
                
                // Box "Dati disponibili" rimosso - ridondante
                
                const missingContainer = document.getElementById('missingFieldsContainer');
                const fields = [];
                
                if (!lead.telefonoRichiedente) fields.push(createField('telefonoRichiedente', 'Telefono', 'tel', '+39 3XX XXX XXXX', true));
                if (!lead.nomeAssistito) fields.push(createField('nomeAssistito', 'Nome Assistito', 'text', 'Nome', true));
                if (!lead.cognomeAssistito) fields.push(createField('cognomeAssistito', 'Cognome Assistito', 'text', 'Cognome', true));
                if (!lead.dataNascitaAssistito) fields.push(createField('dataNascitaAssistito', 'Data Nascita Assistito', 'date', '', true));
                if (!lead.cittaAssistito) fields.push(createField('cittaAssistito', 'Città Assistito', 'text', 'Es. Roma', false));
                if (!lead.cfAssistito) fields.push(createField('cfAssistito', 'Codice Fiscale Assistito', 'text', 'Es. RSSMRA85M01H501X', true));
                if (!lead.indirizzoAssistito) fields.push(createField('indirizzoAssistito', 'Indirizzo Assistito', 'text', 'Via, numero civico', false));
                if (!lead.cfIntestatario) fields.push(createField('cfIntestatario', 'Codice Fiscale Intestatario', 'text', 'Es. PGGRRT55S28D969O', true));
                if (!lead.indirizzoIntestatario) fields.push(createField('indirizzoIntestatario', 'Indirizzo Intestatario', 'text', 'Via, numero civico', false));
                if (!lead.cittaIntestatario) fields.push(createField('cittaIntestatario', 'Città Intestatario', 'text', 'Es. Genova', false));
                
                if (fields.length === 0) {
                    showError('Tutti i dati sono già completi!');
                    return;
                }
                
                missingContainer.innerHTML = fields.join('');
                loadingDiv.style.display = 'none';
                formContainer.style.display = 'block';
                
            } catch (error) {
                console.error('Errore:', error);
                showError('Impossibile caricare i dati. Contattaci a info@telemedcare.it');
            }
        }
        
        function createField(name, label, type, placeholder, required) {
            return \`
                <div>
                    <label for="\${name}" class="block text-sm font-semibold text-gray-700 mb-2">
                        \${label} \${required ? '<span class="text-red-500">*</span>' : ''}
                    </label>
                    <input type="\${type}" id="\${name}" name="\${name}" placeholder="\${placeholder}" 
                        \${required ? 'required' : ''} 
                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none">
                </div>
            \`;
        }
        
        document.getElementById('completaForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            submitBtn.textContent = '⏳ Invio in corso...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}/complete\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    document.getElementById('mainContent').innerHTML = \`
                        <div class="text-center py-10">
                            <div class="text-6xl mb-4">✅</div>
                            <h2 class="text-2xl font-bold text-green-600 mb-2">Dati salvati con successo!</h2>
                            <p class="text-gray-600 mb-2">Grazie per aver completato i tuoi dati.</p>
                            <p class="text-gray-600">Il nostro team ha ricevuto le tue informazioni e ti contatterà presto.</p>
                        </div>
                    \`;
                } else {
                    throw new Error('Errore invio dati');
                }
            } catch (error) {
                console.error('Errore:', error);
                submitBtn.textContent = '✉️ Conferma e Invia';
                submitBtn.disabled = false;
                showError('Errore invio dati. Riprova o contattaci a info@telemedcare.it');
            }
        });
        
        function showError(message) {
            document.getElementById('loadingDiv').style.display = 'none';
            document.getElementById('formContainer').style.display = 'none';
            const errorDiv = document.getElementById('errorDiv');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    </script>
</body>
</html>
`;
