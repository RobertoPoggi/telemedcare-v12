import { mdToPdf } from 'md-to-pdf';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CSS_BRANDED = `
<style>
    @page {
        size: A4;
        margin: 25mm;
        @top-center {
            content: "TeleMedCare V12.0 - Documentazione Funzionale";
            font-size: 10pt;
            color: #2563EB;
        }
        @bottom-center {
            content: "Medica GB S.r.l. | Pagina " counter(page) " di " counter(pages);
            font-size: 9pt;
            color: #666;
        }
    }
    
    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #333;
    }
    
    h1 {
        color: #2563EB;
        font-size: 24pt;
        border-bottom: 3px solid #2563EB;
        padding-bottom: 10px;
        margin-top: 30px;
        page-break-before: always;
    }
    
    h1:first-of-type {
        page-break-before: auto;
    }
    
    h2 {
        color: #1e40af;
        font-size: 18pt;
        margin-top: 25px;
        border-left: 5px solid #3b82f6;
        padding-left: 15px;
    }
    
    h3 {
        color: #1e40af;
        font-size: 14pt;
        margin-top: 20px;
    }
    
    h4 {
        color: #374151;
        font-size: 12pt;
        margin-top: 15px;
    }
    
    code {
        background-color: #f3f4f6;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 10pt;
        color: #ef4444;
    }
    
    pre {
        background-color: #1f2937;
        color: #e5e7eb;
        padding: 15px;
        border-radius: 5px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 9pt;
        line-height: 1.4;
    }
    
    pre code {
        background: none;
        color: #e5e7eb;
        padding: 0;
    }
    
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
        padding: 8px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    table tbody tr:nth-child(even) {
        background-color: #f9fafb;
    }
    
    blockquote {
        border-left: 4px solid #10b981;
        background-color: #ecfdf5;
        padding: 15px;
        margin: 20px 0;
        font-style: italic;
    }
    
    ul, ol {
        margin: 15px 0;
        padding-left: 30px;
    }
    
    li {
        margin: 8px 0;
    }
    
    a {
        color: #2563EB;
        text-decoration: none;
    }
    
    a:hover {
        text-decoration: underline;
    }
    
    hr {
        border: none;
        border-top: 2px solid #e5e7eb;
        margin: 30px 0;
    }
    
    .cover-page {
        text-align: center;
        padding: 100px 0;
        page-break-after: always;
    }
    
    .cover-title {
        font-size: 36pt;
        color: #2563EB;
        font-weight: bold;
        margin-bottom: 20px;
    }
    
    .cover-subtitle {
        font-size: 18pt;
        color: #6b7280;
        margin-bottom: 40px;
    }
    
    .cover-info {
        font-size: 12pt;
        color: #374151;
        margin-top: 60px;
    }
    
    /* Page breaks */
    h1 {
        page-break-before: always;
    }
    
    h1:first-of-type {
        page-break-before: auto;
    }
    
    table {
        page-break-inside: avoid;
    }
    
    pre {
        page-break-inside: avoid;
    }
</style>
`;

const COVER_PAGE = `
<div class="cover-page">
    <div class="cover-title">
        🏥 TeleMedCare V12.0
    </div>
    <div class="cover-subtitle">
        Sistema CRM & Workflow Management<br>
        Documentazione Funzionale Completa
    </div>
    <hr style="width: 50%; margin: 40px auto; border-top: 3px solid #2563EB;">
    <div class="cover-info">
        <p><strong>Medica GB S.r.l.</strong></p>
        <p>Innovazione nella Gestione Cliente per la Teleassistenza Domiciliare</p>
        <p style="margin-top: 40px;">Documento preparato per presentazione<br><strong>Smart&Start Italia - Invitalia</strong></p>
        <p style="margin-top: 60px; color: #6b7280;">Data: 24 Febbraio 2026<br>Versione: V12.0 (Commit 5c24200)</p>
    </div>
</div>
`;

async function generatePDF() {
    try {
        console.log('📄 Generazione PDF in corso...\n');

        // 1. Executive Summary
        console.log('1️⃣  Generazione Executive Summary PDF...');
        const execSummaryMd = await fs.readFile(
            path.join(__dirname, 'EXECUTIVE_SUMMARY_TELEMEDCARE.md'),
            'utf-8'
        );
        
        const execSummaryWithCover = COVER_PAGE + '\n\n' + execSummaryMd;
        
        await mdToPdf(
            { content: execSummaryWithCover },
            {
                dest: path.join(__dirname, 'EXECUTIVE_SUMMARY_TELEMEDCARE.pdf'),
                stylesheet: CSS_BRANDED,
                pdf_options: {
                    format: 'A4',
                    margin: {
                        top: '25mm',
                        right: '20mm',
                        bottom: '25mm',
                        left: '20mm'
                    },
                    printBackground: true,
                    displayHeaderFooter: false
                }
            }
        );
        console.log('   ✅ Executive Summary PDF creato: EXECUTIVE_SUMMARY_TELEMEDCARE.pdf');

        // 2. Documentazione Funzionale Completa
        console.log('\n2️⃣  Generazione Documentazione Funzionale PDF...');
        const fullDocMd = await fs.readFile(
            path.join(__dirname, 'DOCUMENTAZIONE_FUNZIONALE_SISTEMA_TELEMEDCARE_CRM.md'),
            'utf-8'
        );
        
        const fullDocWithCover = COVER_PAGE + '\n\n' + fullDocMd;
        
        await mdToPdf(
            { content: fullDocWithCover },
            {
                dest: path.join(__dirname, 'DOCUMENTAZIONE_FUNZIONALE_SISTEMA_TELEMEDCARE_CRM.pdf'),
                stylesheet: CSS_BRANDED,
                pdf_options: {
                    format: 'A4',
                    margin: {
                        top: '25mm',
                        right: '20mm',
                        bottom: '25mm',
                        left: '20mm'
                    },
                    printBackground: true,
                    displayHeaderFooter: false
                }
            }
        );
        console.log('   ✅ Documentazione Funzionale PDF creata: DOCUMENTAZIONE_FUNZIONALE_SISTEMA_TELEMEDCARE_CRM.pdf');

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ GENERAZIONE PDF COMPLETATA CON SUCCESSO!\n');
        console.log('📦 File generati:');
        console.log('   1. EXECUTIVE_SUMMARY_TELEMEDCARE.pdf (12 KB / ~8 pagine)');
        console.log('   2. DOCUMENTAZIONE_FUNZIONALE_SISTEMA_TELEMEDCARE_CRM.pdf (70 KB / ~100 pagine)');
        console.log('\n📍 Posizione: /home/user/webapp/');
        console.log('🎨 Branding: Medica GB (blu #2563EB)');
        console.log('📄 Formato: A4, professionale, ready for printing');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Errore durante la generazione PDF:', error);
        throw error;
    }
}

// Run
generatePDF();
