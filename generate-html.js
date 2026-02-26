import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - TeleMedCare V12.0</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            h1 {
                page-break-before: always;
            }
            
            h1:first-of-type {
                page-break-before: auto;
            }
            
            table, pre, blockquote {
                page-break-inside: avoid;
            }
            
            .cover-page {
                page-break-after: always;
            }
            
            .no-print {
                display: none;
            }
        }
        
        body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        /* Cover Page */
        .cover-page {
            text-align: center;
            padding: 100px 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .cover-logo {
            font-size: 48pt;
            margin-bottom: 20px;
        }
        
        .cover-title {
            font-size: 36pt;
            color: #2563EB;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .cover-subtitle {
            font-size: 18pt;
            color: #6b7280;
            margin-bottom: 40px;
            line-height: 1.4;
        }
        
        .cover-divider {
            width: 50%;
            height: 3px;
            background: linear-gradient(to right, transparent, #2563EB, transparent);
            margin: 40px auto;
        }
        
        .cover-info {
            font-size: 12pt;
            color: #374151;
            margin-top: 60px;
        }
        
        .cover-info p {
            margin: 10px 0;
        }
        
        .cover-footer {
            margin-top: 80px;
            font-size: 10pt;
            color: #9ca3af;
        }
        
        /* Typography */
        h1 {
            color: #2563EB;
            font-size: 24pt;
            border-bottom: 3px solid #2563EB;
            padding-bottom: 10px;
            margin-top: 40px;
            margin-bottom: 20px;
        }
        
        h2 {
            color: #1e40af;
            font-size: 18pt;
            margin-top: 30px;
            margin-bottom: 15px;
            border-left: 5px solid #3b82f6;
            padding-left: 15px;
        }
        
        h3 {
            color: #1e40af;
            font-size: 14pt;
            margin-top: 25px;
            margin-bottom: 12px;
        }
        
        h4 {
            color: #374151;
            font-size: 12pt;
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        p {
            margin: 12px 0;
            text-align: justify;
        }
        
        /* Code */
        code {
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', 'Consolas', monospace;
            font-size: 10pt;
            color: #ef4444;
        }
        
        pre {
            background-color: #1f2937;
            color: #e5e7eb;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-family: 'Courier New', 'Consolas', monospace;
            font-size: 9pt;
            line-height: 1.4;
            margin: 20px 0;
        }
        
        pre code {
            background: none;
            color: #e5e7eb;
            padding: 0;
        }
        
        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10pt;
        }
        
        table thead {
            background-color: #2563EB;
            color: white;
        }
        
        table th {
            padding: 10px;
            text-align: left;
            font-weight: 600;
        }
        
        table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        table tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }
        
        /* Lists */
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 8px 0;
        }
        
        /* Links */
        a {
            color: #2563EB;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        /* Blockquotes */
        blockquote {
            border-left: 4px solid #10b981;
            background-color: #ecfdf5;
            padding: 15px 20px;
            margin: 20px 0;
            font-style: italic;
        }
        
        /* Horizontal Rule */
        hr {
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: 30px 0;
        }
        
        /* Print Button */
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2563EB;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .print-button:hover {
            background: #1e40af;
        }
        
        @media print {
            .print-button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Stampa / Salva PDF</button>
    
    <!-- Cover Page -->
    <div class="cover-page">
        <div class="cover-logo">🏥</div>
        <div class="cover-title">TeleMedCare V12.0</div>
        <div class="cover-subtitle">
            Sistema CRM & Workflow Management<br>
            {{SUBTITLE}}
        </div>
        <div class="cover-divider"></div>
        <div class="cover-info">
            <p><strong>Medica GB S.r.l.</strong></p>
            <p>Innovazione nella Gestione Cliente<br>per la Teleassistenza Domiciliare</p>
            <p style="margin-top: 40px;">Documento preparato per presentazione<br><strong>Smart&Start Italia - Invitalia</strong></p>
        </div>
        <div class="cover-footer">
            <p>Data: 24 Febbraio 2026</p>
            <p>Versione Sistema: V12.0 (Commit 5c24200)</p>
        </div>
    </div>
    
    <!-- Content -->
    <div class="content">
        {{CONTENT}}
    </div>
    
    <!-- Footer -->
    <div class="no-print" style="text-align: center; padding: 40px 20px; background: #f9fafb; margin-top: 60px; border-top: 3px solid #2563EB;">
        <p style="color: #6b7280; font-size: 10pt;">
            © 2026 Medica GB S.r.l. - TeleMedCare V12.0<br>
            Sistema CRM & Workflow Management per Teleassistenza Domiciliare
        </p>
    </div>
</body>
</html>`;

async function generateHTML() {
    try {
        console.log('📄 Generazione HTML per stampa PDF...\n');

        // Install marked
        let markedModule;
        try {
            markedModule = await import('marked');
        } catch (e) {
            console.log('⚠️  Marked non trovato, installo...');
            const { execSync } = await import('child_process');
            execSync('npm install marked', { stdio: 'inherit' });
            markedModule = await import('marked');
        }
        
        const { marked } = markedModule;

        // 1. Executive Summary
        console.log('1️⃣  Generazione Executive Summary HTML...');
        const execSummaryMd = await fs.readFile(
            path.join(__dirname, 'EXECUTIVE_SUMMARY_TELEMEDCARE.md'),
            'utf-8'
        );
        
        const execSummaryHtml = marked.parse(execSummaryMd);
        const execSummaryFinal = HTML_TEMPLATE
            .replace('{{TITLE}}', 'Executive Summary')
            .replace('{{SUBTITLE}}', 'Executive Summary (2 pagine)')
            .replace('{{CONTENT}}', execSummaryHtml);
        
        await fs.writeFile(
            path.join(__dirname, 'EXECUTIVE_SUMMARY_TELEMEDCARE.html'),
            execSummaryFinal
        );
        console.log('   ✅ EXECUTIVE_SUMMARY_TELEMEDCARE.html');

        // 2. Documentazione Funzionale
        console.log('\n2️⃣  Generazione Documentazione Funzionale HTML...');
        const fullDocMd = await fs.readFile(
            path.join(__dirname, 'DOCUMENTAZIONE_FUNZIONALE_SISTEMA_TELEMEDCARE_CRM.md'),
            'utf-8'
        );
        
        const fullDocHtml = marked.parse(fullDocMd);
        const fullDocFinal = HTML_TEMPLATE
            .replace('{{TITLE}}', 'Documentazione Funzionale Completa')
            .replace('{{SUBTITLE}}', 'Documentazione Funzionale Completa')
            .replace('{{CONTENT}}', fullDocHtml);
        
        await fs.writeFile(
            path.join(__dirname, 'DOCUMENTAZIONE_FUNZIONALE_SISTEMA_TELEMEDCARE_CRM.html'),
            fullDocFinal
        );
        console.log('   ✅ DOCUMENTAZIONE_FUNZIONALE_SISTEMA_TELEMEDCARE_CRM.html');

        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('✅ GENERAZIONE HTML COMPLETATA CON SUCCESSO!\n');
        console.log('📦 File generati:');
        console.log('   1. EXECUTIVE_SUMMARY_TELEMEDCARE.html');
        console.log('   2. DOCUMENTAZIONE_FUNZIONALE_SISTEMA_TELEMEDCARE_CRM.html');
        console.log('\n📍 Posizione: /home/user/webapp/');
        console.log('🎨 Branding: Medica GB (blu #2563EB)');
        console.log('📄 Formato: A4, professionale, print-ready');
        console.log('\n🖨️  ISTRUZIONI PER CREARE PDF:');
        console.log('   1. Apri i file HTML nel browser');
        console.log('   2. Click sul pulsante "🖨️ Stampa / Salva PDF" in alto a destra');
        console.log('   3. Oppure usa Ctrl+P (Windows/Linux) o Cmd+P (Mac)');
        console.log('   4. Seleziona "Salva come PDF" come destinazione');
        console.log('   5. Imposta margini su "Predefiniti" o "Nessuno"');
        console.log('   6. Abilita "Grafiche di sfondo"');
        console.log('   7. Salva il PDF');
        console.log('\n💡 Alternativamente, puoi aprire i file HTML in:');
        console.log('   • Google Chrome/Edge: Ctrl+P → Salva come PDF');
        console.log('   • Firefox: Ctrl+P → Microsoft Print to PDF');
        console.log('   • Safari: Cmd+P → PDF → Salva come PDF');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Errore durante la generazione HTML:', error);
        throw error;
    }
}

// Run
generateHTML();
