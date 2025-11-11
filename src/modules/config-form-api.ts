/**
 * Configuration Form API
 * Serves pre-filled configuration forms based on contract holder identity
 * 
 * Two cases:
 * 1. intestazioneContratto = 'assistito' → Pre-fill assistito section only
 * 2. intestazioneContratto = 'richiedente' → Pre-fill assistito section + first caregiver with richiedente data
 */

import { Hono } from 'hono';
import { html } from 'hono/html';
import crypto from 'crypto';

type Bindings = {
  DB: D1Database;
  KV?: KVNamespace;
};

type AppContext = {
  Bindings: Bindings;
  Variables: {};
};

const configFormApi = new Hono<{ Bindings: Bindings }>();

/**
 * Generate a secure access token for a lead
 */
function generateToken(leadId: string): string {
  const secret = 'telemedcare-config-form-v11'; // In production, use env variable
  const timestamp = Date.now().toString();
  const hash = crypto
    .createHash('sha256')
    .update(`${leadId}:${secret}:${timestamp}`)
    .digest('hex')
    .substring(0, 32);
  
  return `${hash}:${timestamp}`;
}

/**
 * Verify access token
 */
function verifyToken(token: string, leadId: string): boolean {
  try {
    const [hash, timestamp] = token.split(':');
    const secret = 'telemedcare-config-form-v11';
    
    // Token expires after 30 days
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 30 * 24 * 60 * 60 * 1000) {
      return false;
    }
    
    const expectedHash = crypto
      .createHash('sha256')
      .update(`${leadId}:${secret}:${timestamp}`)
      .digest('hex')
      .substring(0, 32);
    
    return hash === expectedHash;
  } catch (error) {
    return false;
  }
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: string): number {
  if (!birthDate || birthDate === 'null') return 0;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * GET /api/config-form/:leadId/:token
 * Serves the pre-filled configuration form
 */
configFormApi.get('/config-form/:leadId/:token', async (c) => {
  const db = c.env.DB;
  const leadId = c.req.param('leadId');
  const token = c.req.param('token');
  
  // Verify token
  if (!verifyToken(token, leadId)) {
    return c.html(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Link Scaduto - TeleMedCare</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-100 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div class="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 class="text-2xl font-bold text-gray-800 mb-4">Link Scaduto o Non Valido</h1>
          <p class="text-gray-600 mb-6">
            Il link di accesso al modulo è scaduto o non è valido.
            Per favore contatta il nostro servizio clienti.
          </p>
          <a href="mailto:info@medicagb.it" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Contatta Supporto
          </a>
        </div>
      </body>
      </html>
    `, 403);
  }
  
  try {
    // Fetch lead data
    const lead = await db.prepare(`
      SELECT 
        id,
        nomeRichiedente,
        cognomeRichiedente,
        emailRichiedente,
        telefonoRichiedente,
        indirizzoRichiedente,
        nomeAssistito,
        cognomeAssistito,
        dataNascitaAssistito,
        etaAssistito,
        indirizzoAssistito,
        intestazioneContratto,
        pacchetto
      FROM leads 
      WHERE id = ?
    `).bind(leadId).first() as any;
    
    if (!lead) {
      return c.html(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dati Non Trovati - TeleMedCare</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
          <div class="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <div class="text-yellow-600 text-6xl mb-4">❓</div>
            <h1 class="text-2xl font-bold text-gray-800 mb-4">Dati Non Trovati</h1>
            <p class="text-gray-600 mb-6">
              Non riusciamo a trovare i tuoi dati nel sistema.
              Per favore contatta il nostro servizio clienti.
            </p>
            <a href="mailto:info@medicagb.it" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Contatta Supporto
            </a>
          </div>
        </body>
        </html>
      `, 404);
    }
    
    // Determine who the contract holder is
    const isAssistitoHolder = lead.intestazioneContratto === 'assistito';
    
    // Prepare pre-fill data based on contract holder
    let preFillData: any = {};
    
    if (isAssistitoHolder) {
      // CASE 1: Contract holder is assistito
      // Pre-fill assistito section only
      preFillData = {
        nome: lead.nomeAssistito || '',
        cognome: lead.cognomeAssistito || '',
        data_nascita: lead.dataNascitaAssistito || '',
        eta: lead.etaAssistito || (lead.dataNascitaAssistito ? calculateAge(lead.dataNascitaAssistito) : ''),
        telefono: '', // Assistito phone not in DB, leave empty
        email: '', // Assistito email not in DB, leave empty
        indirizzo: lead.indirizzoAssistito || '',
        // First caregiver: leave empty
        contatto1_nome: '',
        contatto1_cognome: '',
        contatto1_telefono: '',
        contatto1_email: ''
      };
    } else {
      // CASE 2: Contract holder is richiedente (different person paying for assistito)
      // Pre-fill assistito section + first caregiver with richiedente data
      preFillData = {
        // Assistito data in main section
        nome: lead.nomeAssistito || '',
        cognome: lead.cognomeAssistito || '',
        data_nascita: lead.dataNascitaAssistito || '',
        eta: lead.etaAssistito || (lead.dataNascitaAssistito ? calculateAge(lead.dataNascitaAssistito) : ''),
        telefono: '', // Assistito phone not in DB
        email: '', // Assistito email not in DB
        indirizzo: lead.indirizzoAssistito || lead.indirizzoRichiedente || '', // Fallback to richiedente address if assistito not available
        // First caregiver (Contatto Primario): richiedente data
        contatto1_nome: lead.nomeRichiedente || '',
        contatto1_cognome: lead.cognomeRichiedente || '',
        contatto1_telefono: lead.telefonoRichiedente || '',
        contatto1_email: lead.emailRichiedente || ''
      };
    }
    
    // Generate the form HTML with pre-filled data
    const formHtml = await generateFormHtml(preFillData, lead);
    
    return c.html(formHtml);
    
  } catch (error) {
    console.error('Error loading configuration form:', error);
    return c.html(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Errore - TeleMedCare</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-100 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div class="text-red-600 text-6xl mb-4">❌</div>
          <h1 class="text-2xl font-bold text-gray-800 mb-4">Errore di Caricamento</h1>
          <p class="text-gray-600 mb-6">
            Si è verificato un errore durante il caricamento del modulo.
            Per favore riprova più tardi o contatta il supporto.
          </p>
          <a href="mailto:info@medicagb.it" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Contatta Supporto
          </a>
        </div>
      </body>
      </html>
    `, 500);
  }
});

/**
 * Generate token for a lead (called from payment confirmation)
 */
configFormApi.post('/generate-token/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const token = generateToken(leadId);
  
  return c.json({
    success: true,
    token: token,
    url: `/api/config-form/${leadId}/${token}`
  });
});

/**
 * Generate the complete form HTML with pre-filled data
 */
async function generateFormHtml(preFillData: any, lead: any): Promise<string> {
  return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurazione SiDLY CARE - Dati Cliente</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
    <style>
        @media print {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .form-section {
            border-left: 4px solid #3B82F6;
        }
    </style>
</head>
<body class="bg-gray-50 font-sans">
    <!-- Header -->
    <div class="gradient-bg text-white py-6 px-4">
        <div class="max-w-4xl mx-auto">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold">Configurazione SiDLY CARE</h1>
                    <p class="text-blue-100 mt-2">Completa i dati per l'attivazione del servizio</p>
                </div>
                <div class="text-right">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40'%3E%3Ctext x='50' y='25' text-anchor='middle' fill='white' font-family='Arial, sans-serif' font-size='12' font-weight='bold'%3EMedica GB%3C/text%3E%3C/svg%3E" alt="Medica GB" class="h-10">
                </div>
            </div>
        </div>
    </div>

    <!-- Success Message (hidden by default) -->
    <div id="successMessage" class="hidden max-w-4xl mx-auto mt-8 px-4">
        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
            <div class="flex items-center">
                <i class="fas fa-check-circle text-2xl mr-3"></i>
                <div>
                    <p class="font-bold">Modulo Inviato con Successo!</p>
                    <p class="text-sm">Riceverai una conferma via email a breve.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Error Message (hidden by default) -->
    <div id="errorMessage" class="hidden max-w-4xl mx-auto mt-8 px-4">
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle text-2xl mr-3"></i>
                <div>
                    <p class="font-bold">Errore di Invio</p>
                    <p class="text-sm">Si è verificato un errore. Riprova più tardi o contatta il supporto.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Form Container -->
    <div class="max-w-4xl mx-auto py-8 px-4">
        <form id="configurazione-form" class="space-y-8">
            <!-- Hidden lead ID -->
            <input type="hidden" name="lead_id" value="${lead.id}">
            <input type="hidden" name="piano_servizio" value="${lead.pacchetto || 'BASE'}">
            
            <!-- Dati Anagrafici -->
            <div class="bg-white rounded-lg shadow-lg p-6 form-section">
                <div class="flex items-center mb-6">
                    <i class="fas fa-user text-blue-600 text-2xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">Dati Anagrafici</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                        <input type="text" id="nome" name="nome" value="${preFillData.nome}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Cognome *</label>
                        <input type="text" id="cognome" name="cognome" value="${preFillData.cognome}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data di Nascita *</label>
                        <input type="date" id="data_nascita" name="data_nascita" value="${preFillData.data_nascita}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Età</label>
                        <input type="text" id="eta" name="eta" value="${preFillData.eta ? preFillData.eta + ' anni' : ''}" readonly class="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                        <input type="number" id="peso" name="peso" value="" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Altezza (cm)</label>
                        <input type="number" id="altezza" name="altezza" value="" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Telefono *</label>
                        <input type="tel" id="telefono" name="telefono" value="${preFillData.telefono}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="email" name="email" value="${preFillData.email}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Indirizzo *</label>
                        <input type="text" id="indirizzo" name="indirizzo" value="${preFillData.indirizzo}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
            </div>

            <!-- Contatti di Emergenza -->
            <div class="bg-white rounded-lg shadow-lg p-6 form-section">
                <div class="flex items-center mb-6">
                    <i class="fas fa-phone-alt text-red-600 text-2xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">Contatti di Emergenza</h2>
                </div>
                
                <!-- Contatto 1 (Primario) -->
                <div class="mb-8">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm mr-2">1</span>
                        Contatto Primario *
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                            <input type="text" name="contatto1_nome" value="${preFillData.contatto1_nome}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
                            <input type="text" name="contatto1_cognome" value="${preFillData.contatto1_cognome}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                            <input type="tel" name="contatto1_telefono" value="${preFillData.contatto1_telefono}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" name="contatto1_email" value="${preFillData.contatto1_email || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                </div>

                <!-- Contatto 2 (Secondario) -->
                <div class="mb-8">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm mr-2">2</span>
                        Contatto Secondario
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                            <input type="text" name="contatto2_nome" value="" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
                            <input type="text" name="contatto2_cognome" value="" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                            <input type="tel" name="contatto2_telefono" value="" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" name="contatto2_email" value="" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                </div>

                <!-- Contatto 3 (Terziario) -->
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm mr-2">3</span>
                        Contatto Terziario
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                            <input type="text" name="contatto3_nome" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
                            <input type="text" name="contatto3_cognome" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                            <input type="tel" name="contatto3_telefono" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" name="contatto3_email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Condizioni Mediche -->
            <div class="bg-white rounded-lg shadow-lg p-6 form-section">
                <div class="flex items-center mb-6">
                    <i class="fas fa-heartbeat text-red-600 text-2xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">Condizioni Mediche</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="ipertensione" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Ipertensione arteriosa</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="diabete" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Diabete</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="cardiopatia" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Cardiopatia</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="aritmia" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Aritmia</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="alzheimer" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Alzheimer/Demenza</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="parkinson" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Parkinson</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="insufficienza_renale" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Insufficienza renale</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="bpco" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">BPCO</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="osteoporosi" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Osteoporosi</span>
                    </label>
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="patologie[]" value="artrite" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700">Artrite/Artrosi</span>
                    </label>
                </div>
            </div>

            <!-- Farmaci -->
            <div class="bg-white rounded-lg shadow-lg p-6 form-section">
                <div class="flex items-center mb-6">
                    <i class="fas fa-pills text-green-600 text-2xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">Farmaci Assunti</h2>
                </div>
                <div id="farmaci-container">
                    <!-- Farmaco 1 (template) -->
                    <div class="farmaco-entry mb-4 p-4 bg-gray-50 rounded-lg">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nome Farmaco</label>
                                <input type="text" name="farmaco_nome[]" placeholder="es. Ramipril" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Dosaggio</label>
                                <input type="text" name="farmaco_dosaggio[]" placeholder="es. 5mg" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Orario Assunzione</label>
                                <input type="text" name="farmaco_orario[]" placeholder="es. Mattina, 08:00" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                        </div>
                    </div>
                </div>
                <button type="button" id="aggiungi-farmaco" class="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    <i class="fas fa-plus mr-2"></i>Aggiungi Farmaco
                </button>
            </div>

            <!-- Note Aggiuntive -->
            <div class="bg-white rounded-lg shadow-lg p-6 form-section">
                <div class="flex items-center mb-6">
                    <i class="fas fa-comment-medical text-purple-600 text-2xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">Note Aggiuntive</h2>
                </div>
                <textarea name="note" id="note" rows="4" placeholder="Eventuali altre informazioni utili per la configurazione del servizio..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-center">
                <button type="submit" id="submit-btn" class="bg-blue-600 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                    <i class="fas fa-paper-plane mr-2"></i>Invia Configurazione
                </button>
            </div>
        </form>
    </div>

    <!-- Footer -->
    <div class="bg-gray-800 text-white py-8 mt-12">
        <div class="max-w-4xl mx-auto px-4 text-center">
            <p class="text-sm text-gray-300">
                © 2025 Medica GB - TeleMedCare V11.0 | 
                <a href="mailto:info@medicagb.it" class="text-blue-400 hover:text-blue-300">info@medicagb.it</a>
            </p>
        </div>
    </div>

    <script>
        // Initialize EmailJS
        (function() {
            emailjs.init("2RdQ32Zss7a_KSLjn"); // Your EmailJS user ID
        })();

        // Auto-calculate age
        document.getElementById('data_nascita').addEventListener('change', function() {
            const birthDate = new Date(this.value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            document.getElementById('eta').value = age + ' anni';
        });

        // Add more medications
        document.getElementById('aggiungi-farmaco').addEventListener('click', function() {
            const container = document.getElementById('farmaci-container');
            const newEntry = container.firstElementChild.cloneNode(true);
            
            // Clear all inputs
            const inputs = newEntry.querySelectorAll('input');
            inputs.forEach(input => input.value = '');
            
            container.appendChild(newEntry);
        });

        // Form submission
        document.getElementById('configurazione-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            const originalBtnText = submitBtn.innerHTML;
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Invio in corso...';
            
            try {
                // Collect form data
                const formData = new FormData(this);
                const data = {};
                
                // Collect all fields
                for (let [key, value] of formData.entries()) {
                    if (key.includes('[]')) {
                        // Array fields (patologie, farmaci)
                        const cleanKey = key.replace('[]', '');
                        if (!data[cleanKey]) data[cleanKey] = [];
                        if (value) data[cleanKey].push(value);
                    } else {
                        data[key] = value;
                    }
                }
                
                // Format data for email
                const emailData = {
                    lead_id: data.lead_id,
                    piano_servizio: data.piano_servizio,
                    nome: data.nome,
                    cognome: data.cognome,
                    data_nascita: data.data_nascita,
                    eta: data.eta,
                    peso: data.peso || 'Non specificato',
                    altezza: data.altezza || 'Non specificato',
                    telefono: data.telefono,
                    email: data.email || 'Non specificato',
                    indirizzo: data.indirizzo,
                    contatto1: \`\${data.contatto1_nome || ''} \${data.contatto1_cognome || ''} - Tel: \${data.contatto1_telefono || ''} - Email: \${data.contatto1_email || 'N/A'}\`,
                    contatto2: \`\${data.contatto2_nome || ''} \${data.contatto2_cognome || ''} - Tel: \${data.contatto2_telefono || ''} - Email: \${data.contatto2_email || 'N/A'}\`,
                    contatto3: \`\${data.contatto3_nome || ''} \${data.contatto3_cognome || ''} - Tel: \${data.contatto3_telefono || ''} - Email: \${data.contatto3_email || 'N/A'}\`,
                    patologie: data.patologie ? data.patologie.join(', ') : 'Nessuna',
                    farmaci_nome: data.farmaco_nome ? data.farmaco_nome.join(', ') : 'Nessuno',
                    farmaci_dosaggio: data.farmaco_dosaggio ? data.farmaco_dosaggio.join(', ') : '',
                    farmaci_orario: data.farmaco_orario ? data.farmaco_orario.join(', ') : '',
                    note: data.note || 'Nessuna nota aggiuntiva'
                };
                
                // Send via EmailJS
                const response = await emailjs.send(
                    'service_uypbq0i',      // Your service ID
                    'template_hgwejgr',     // Your template ID
                    emailData
                );
                
                console.log('Email sent successfully:', response);
                
                // Show success message
                document.getElementById('successMessage').classList.remove('hidden');
                document.getElementById('errorMessage').classList.add('hidden');
                
                // Scroll to success message
                document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth' });
                
                // Reset form
                this.reset();
                
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
            } catch (error) {
                console.error('Error sending email:', error);
                
                // Show error message
                document.getElementById('errorMessage').classList.remove('hidden');
                document.getElementById('successMessage').classList.add('hidden');
                
                // Scroll to error message
                document.getElementById('errorMessage').scrollIntoView({ behavior: 'smooth' });
                
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    </script>
</body>
</html>`;
}

export default configFormApi;
export { generateToken, verifyToken };
