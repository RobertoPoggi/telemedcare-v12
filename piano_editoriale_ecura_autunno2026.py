#!/usr/bin/env python3
"""
Genera il Piano Editoriale eCura Autunno 2026 in PDF
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import cm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                 TableStyle, HRFlowable, KeepTogether)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import PageBreak

# ── Colori brand eCura ──────────────────────────────────────────────────────
TEAL    = HexColor('#068D86')
TEAL_LT = HexColor('#E6F5F4')
ORANGE  = HexColor('#F5A623')
DARK    = HexColor('#1A1A2E')
GRAY    = HexColor('#6B7280')
GRAY_LT = HexColor('#F9FAFB')
RED_LT  = HexColor('#FEF2F2')
GREEN_LT= HexColor('#F0FDF4')

OUTPUT = '/home/user/webapp/Piano_Editoriale_eCura_Autunno2026.pdf'

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=2*cm, leftMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm,
    title='Piano Editoriale eCura — Campagna Autunno 2026',
    author='eCura — Medica GB Srl',
)

styles = getSampleStyleSheet()

# Stili personalizzati
H1 = ParagraphStyle('H1', parent=styles['Heading1'],
    fontSize=22, textColor=TEAL, spaceAfter=6, spaceBefore=0,
    fontName='Helvetica-Bold')

H2 = ParagraphStyle('H2', parent=styles['Heading2'],
    fontSize=14, textColor=TEAL, spaceAfter=4, spaceBefore=12,
    fontName='Helvetica-Bold')

H3 = ParagraphStyle('H3', parent=styles['Heading3'],
    fontSize=11, textColor=DARK, spaceAfter=3, spaceBefore=8,
    fontName='Helvetica-Bold')

BODY = ParagraphStyle('BODY', parent=styles['Normal'],
    fontSize=9.5, leading=14, textColor=DARK, spaceAfter=4)

SMALL = ParagraphStyle('SMALL', parent=styles['Normal'],
    fontSize=8.5, leading=12, textColor=GRAY)

CAPTION = ParagraphStyle('CAPTION', parent=styles['Normal'],
    fontSize=8, leading=11, textColor=GRAY, alignment=TA_CENTER)

NOTE_BOX = ParagraphStyle('NOTE_BOX', parent=styles['Normal'],
    fontSize=9, leading=13, textColor=DARK,
    backColor=TEAL_LT, borderPadding=8)

CENTER = ParagraphStyle('CENTER', parent=styles['Normal'],
    fontSize=10, alignment=TA_CENTER, textColor=DARK)

APPROV = ParagraphStyle('APPROV', parent=styles['Normal'],
    fontSize=10, leading=15, textColor=DARK, spaceAfter=6)

story = []

# ════════════════════════════════════════════════════════════════════
# COPERTINA
# ════════════════════════════════════════════════════════════════════
story.append(Spacer(1, 1.5*cm))

# Header band
header_data = [[Paragraph('<font color="white"><b>PIANO EDITORIALE — SOCIAL MEDIA</b></font>', 
                           ParagraphStyle('hd', fontSize=11, alignment=TA_CENTER, textColor=white))]]
header_tbl = Table(header_data, colWidths=[17*cm])
header_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), TEAL),
    ('TOPPADDING', (0,0), (-1,-1), 10),
    ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ('ROUNDEDCORNERS', [6]),
]))
story.append(header_tbl)
story.append(Spacer(1, 0.4*cm))

story.append(Paragraph('Campagna eCura Autunno 2026', H1))
story.append(Paragraph('Facebook · Instagram · Gruppi Professionali', 
    ParagraphStyle('sub', fontSize=13, textColor=GRAY)))
story.append(Spacer(1, 0.3*cm))

# Riquadro info campagna
info_data = [
    ['📅 Periodo', '15 Settembre — 21 Dicembre 2026'],
    ['🎯 Obiettivo', 'Lead organici + Partner + Awareness'],
    ['📱 Canali', 'Facebook (pagina eCura) · Instagram @ecura_it · Gruppi FB'],
    ['🏷️ Codice sconto', 'ECURAAUTUNNO25 — 5% sconto · valido fino 21/12/2026'],
    ['📧 Contatto', 'info@ecura.it · +39 335 730 1206 · www.ecura.it'],
    ['✍️ Preparato da', 'Team eCura / Medica GB Srl'],
    ['📋 Da approvare', 'Stefania — entro _______________'],
]
info_tbl = Table(info_data, colWidths=[4.5*cm, 12.5*cm])
info_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (0,-1), TEAL_LT),
    ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('TEXTCOLOR', (0,0), (0,-1), TEAL),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('GRID', (0,0), (-1,-1), 0.5, HexColor('#D1D5DB')),
    ('ROWBACKGROUNDS', (0,0), (-1,-1), [white, GRAY_LT]),
]))
story.append(info_tbl)
story.append(Spacer(1, 0.5*cm))

story.append(HRFlowable(width='100%', thickness=1, color=TEAL))
story.append(Spacer(1, 0.3*cm))

# ════════════════════════════════════════════════════════════════════
# SEZIONE 1 — STRATEGIA
# ════════════════════════════════════════════════════════════════════
story.append(Paragraph('1. Strategia e Obiettivi', H2))

story.append(Paragraph(
    'La campagna autunnale punta a generare lead organici (gratuiti) attraverso contenuti '
    'educativi di valore, passaparola professionale e promozione del programma partner. '
    'Il periodo settembre–dicembre è storicamente il più ricettivo per il target (rientro '
    'dalle vacanze, riflessioni sulla sicurezza dei genitori anziani).', BODY))

# 3 colonne obiettivi
obj_data = [
    [
        Paragraph('<b>🎯 Lead organici</b>', ParagraphStyle('ot', fontSize=9, fontName='Helvetica-Bold', textColor=TEAL)),
        Paragraph('<b>🤝 Partner</b>', ParagraphStyle('ot', fontSize=9, fontName='Helvetica-Bold', textColor=TEAL)),
        Paragraph('<b>📣 Awareness</b>', ParagraphStyle('ot', fontSize=9, fontName='Helvetica-Bold', textColor=TEAL)),
    ],
    [
        Paragraph('Famiglie con anziani che cercano soluzioni di sicurezza. Target: figli 40-65 anni.', SMALL),
        Paragraph('Fisioterapisti, infermieri, farmacisti, medici di base. Programma referral con commissione.', SMALL),
        Paragraph('Posizionare eCura come la scelta certificata vs Seremy e concorrenza generica.', SMALL),
    ],
]
obj_tbl = Table(obj_data, colWidths=[5.5*cm, 5.5*cm, 5.5*cm])
obj_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), TEAL_LT),
    ('BACKGROUND', (0,1), (-1,1), white),
    ('BOX', (0,0), (-1,-1), 0.5, HexColor('#D1D5DB')),
    ('INNERGRID', (0,0), (-1,-1), 0.5, HexColor('#D1D5DB')),
    ('TOPPADDING', (0,0), (-1,-1), 7),
    ('BOTTOMPADDING', (0,0), (-1,-1), 7),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
]))
story.append(obj_tbl)
story.append(Spacer(1, 0.3*cm))

# Codice sconto
sconto_data = [[
    Paragraph('🏷️  Codice sconto campagna: <b>ECURAAUTUNNO25</b> — 5% di sconto su tutti i piani eCura<br/>'
              'Valido dal 15 settembre al 21 dicembre 2026. Già attivo nel sistema CRM.',
              ParagraphStyle('sc', fontSize=9.5, textColor=DARK))
]]
sconto_tbl = Table(sconto_data, colWidths=[17*cm])
sconto_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), HexColor('#FFFBEB')),
    ('BOX', (0,0), (-1,-1), 1.5, ORANGE),
    ('TOPPADDING', (0,0), (-1,-1), 10),
    ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ('LEFTPADDING', (0,0), (-1,-1), 12),
]))
story.append(sconto_tbl)
story.append(Spacer(1, 0.4*cm))

# ════════════════════════════════════════════════════════════════════
# SEZIONE 2 — CALENDARIO (tabella compatta)
# ════════════════════════════════════════════════════════════════════
story.append(Paragraph('2. Calendario Editoriale — 12 Post in 4 Settimane', H2))

cal_header = ['Data', 'Tipo', 'Argomento', 'Canale', 'Target']
cal_rows = [
    ['Lun 15/09', 'BLOG', 'Anziano solo in casa: soluzioni sicurezza', 'FB + IG', 'Famiglie'],
    ['Mer 17/09', 'PARTNER', 'Programma partner per professionisti sanità', 'FB Gruppi', 'Fisio/Inferm/Farm'],
    ['Ven 19/09', 'BLOG', 'Badante vs Teleassistenza: costi 2026', 'FB + IG', 'Chi valuta badante'],
    ['Lun 22/09', 'BLOG', 'Bracciale detraibile 19%: guida fiscale', 'FB + IG', 'Famiglie / 730'],
    ['Mer 24/09', 'CONFRONTO', 'Seremy €480 vs eCura €390,50: confronto', 'FB + IG', 'Chi cerca Seremy'],
    ['Ven 26/09', 'PARTNER', 'Farmacisti e MMG: diventa partner eCura', 'FB Gruppi Prof.', 'Farmacisti / MMG'],
    ['Lun 29/09', 'BLOG', 'Prevenzione cadute: 10 consigli pratici', 'FB + IG', 'Famiglie anziani'],
    ['Mer 01/10', 'BLOG', 'GPS indoor anziani: come funziona', 'FB + IG', 'Curiosi / Tech'],
    ['Ven 03/10', 'PROMO', 'Promo ECURAAUTUNNO25: -5% fino 21 dic', 'FB + IG', 'Tutti'],
    ['Lun 06/10', 'BLOG', 'Centrale H24: cosa succede al SOS', 'FB + IG', 'Scettici'],
    ['Mer 08/10', 'BLOG', 'Dispositivo Classe IIA: perché conta', 'FB + IG', 'Consapevoli'],
    ['Ven 10/10', 'PARTNER', 'Condividi eCura coi tuoi pazienti', 'FB + IG + Gruppi', 'Rete professionale'],
]

tipo_colors = {
    'BLOG': HexColor('#EFF6FF'),
    'PARTNER': HexColor('#F0FDF4'),
    'CONFRONTO': HexColor('#FEF3C7'),
    'PROMO': HexColor('#FFF0F0'),
}

cal_data = [
    [Paragraph(f'<b>{h}</b>', ParagraphStyle('ch', fontSize=8.5, fontName='Helvetica-Bold', textColor=white))
     for h in cal_header]
] + [
    [Paragraph(str(r[i]), ParagraphStyle('cd', fontSize=8.5, leading=12)) for i in range(5)]
    for r in cal_rows
]

cal_tbl = Table(cal_data, colWidths=[2*cm, 2*cm, 6.5*cm, 3*cm, 3.5*cm])
ts = [
    ('BACKGROUND', (0,0), (-1,0), TEAL),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('GRID', (0,0), (-1,-1), 0.4, HexColor('#D1D5DB')),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('FONTSIZE', (0,1), (-1,-1), 8.5),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, GRAY_LT]),
]
# Colorazione per tipo
for i, row in enumerate(cal_rows, 1):
    tipo = row[1]
    color = tipo_colors.get(tipo, white)
    ts.append(('BACKGROUND', (1,i), (1,i), color))
    ts.append(('FONTNAME', (1,i), (1,i), 'Helvetica-Bold'))
cal_tbl.setStyle(TableStyle(ts))
story.append(cal_tbl)
story.append(Spacer(1, 0.2*cm))

# Legenda tipi
leg_data = [[
    Paragraph('■ BLOG = articolo blog ecura.it', ParagraphStyle('lg', fontSize=7.5, textColor=HexColor('#1D4ED8'))),
    Paragraph('■ PARTNER = post per professionisti sanità', ParagraphStyle('lg', fontSize=7.5, textColor=HexColor('#15803D'))),
    Paragraph('■ CONFRONTO = vs Seremy/concorrenti', ParagraphStyle('lg', fontSize=7.5, textColor=HexColor('#92400E'))),
    Paragraph('■ PROMO = codice sconto campagna', ParagraphStyle('lg', fontSize=7.5, textColor=HexColor('#DC2626'))),
]]
leg_tbl = Table(leg_data, colWidths=[4.25*cm]*4)
leg_tbl.setStyle(TableStyle([
    ('TOPPADDING', (0,0), (-1,-1), 3),
    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
]))
story.append(leg_tbl)

story.append(PageBreak())

# ════════════════════════════════════════════════════════════════════
# SEZIONE 3 — TESTI POST (tutti e 12)
# ════════════════════════════════════════════════════════════════════
story.append(Paragraph('3. Testi Completi dei Post', H2))
story.append(Paragraph(
    'Ogni post è pronto per essere copiato e pubblicato. '
    'Il testo Facebook è più lungo (algoritmo premia il contenuto); '
    'quello Instagram è breve con hashtag. '
    '<b>Orario consigliato:</b> Facebook 19:00–21:00 · Instagram 12:30 o 20:30.', BODY))
story.append(Spacer(1, 0.3*cm))

posts = [
    {
        'n': 1, 'data': 'LUNEDÌ 15 SETTEMBRE', 'tipo': 'BLOG',
        'tema': 'Sicurezza anziano solo in casa',
        'url': 'https://www.ecura.it/blog/anziano-solo-casa-soluzioni-sicurezza/',
        'fb': (
            'Tuo padre o tua madre sono soli in casa tutto il giorno?\n\n'
            'È una delle preoccupazioni più comuni tra le famiglie italiane — e spesso viene gestita '
            'con soluzioni improvvisate: telefonate continue, vicini di casa, telecamere…\n\n'
            'Ma cosa succede di notte? O se cade in bagno e il telefono è in un\'altra stanza?\n\n'
            'Abbiamo scritto una guida completa con le soluzioni reali per chi ha un anziano solo in casa:\n\n'
            '👉 https://www.ecura.it/blog/anziano-solo-casa-soluzioni-sicurezza/\n\n'
            'Se conosci una famiglia in questa situazione, condividi — può fare la differenza.\n\n'
            'Per informazioni: info@ecura.it · +39 335 730 1206 · www.ecura.it\n\n'
            '#anziani #caregiver #teleassistenza #sicurezza #famiglia'
        ),
        'ig': (
            'La domanda che molte famiglie si fanno ogni mattina:\n'
            '"Starà bene quando esco?" 💙\n\n'
            'Guida completa sulle soluzioni per anziani soli in casa 👇\n'
            '🔗 Link in bio — www.ecura.it\n'
            '📞 +39 335 730 1206\n\n'
            '#anziani #famiglia #caregiver #bracciale #teleassistenza #sicurezza #italia'
        ),
    },
    {
        'n': 2, 'data': 'MERCOLEDÌ 17 SETTEMBRE', 'tipo': 'PARTNER',
        'tema': 'Programma Partner — professionisti sanitari',
        'url': 'https://www.ecura.it/partner/',
        'fb': (
            '👨‍⚕️ Sei un fisioterapista, infermiere, farmacista o medico di base?\n\n'
            'Ogni giorno hai pazienti anziani che vivono soli o con famiglie preoccupate per la loro sicurezza.\n\n'
            'eCura ha un programma partner pensato per i professionisti della salute:\n'
            '✅ Commissione per ogni paziente che attiva il servizio\n'
            '✅ I tuoi pazienti ricevono un dispositivo medico certificato Classe IIA\n'
            '✅ Nessun costo di adesione, nessun obbligo\n\n'
            'Più di 50 professionisti in Italia lo stanno già facendo.\n\n'
            '👉 https://www.ecura.it/partner/\n\n'
            'Per info: info@ecura.it · +39 335 730 1206\n\n'
            '#fisioterapia #infermieri #farmacisti #medicidibase #partner #teleassistenza'
        ),
        'ig': (
            '👨‍⚕️ Professionisti della salute:\n\n'
            'Hai pazienti anziani che vivono soli?\n'
            'Il programma partner eCura ti permette di aiutarli '
            'con un dispositivo medico certificato — e guadagnare una commissione.\n\n'
            '🔗 www.ecura.it/partner\n'
            '📧 info@ecura.it\n\n'
            '#partner #fisioterapia #infermieri #farmacisti #medici #teleassistenza #anziani'
        ),
    },
    {
        'n': 3, 'data': 'VENERDÌ 19 SETTEMBRE', 'tipo': 'BLOG',
        'tema': 'Badante vs Teleassistenza — risparmio',
        'url': 'https://www.ecura.it/blog/badante-vs-teleassistenza-costi-2026/',
        'fb': (
            '"Una badante costa troppo, ma lasciare mio padre solo mi spaventa."\n\n'
            'È esattamente quello che ci scrivono ogni settimana decine di famiglie.\n\n'
            'La realtà è che confrontare i costi fa impressione:\n'
            '💰 Badante part-time: €800–1.200/mese\n'
            '💰 eCura teleassistenza: €390,50/anno (€32/mese)\n\n'
            'Non è la stessa cosa, certo. Ma per molte famiglie la teleassistenza copre '
            'esattamente ciò di cui hanno bisogno: sicurezza H24, GPS, rilevamento cadute.\n\n'
            '👉 https://www.ecura.it/blog/badante-vs-teleassistenza-costi-2026/\n\n'
            'info@ecura.it · +39 335 730 1206 · www.ecura.it\n\n'
            '#badante #teleassistenza #anziani #costi #risparmio #famiglia'
        ),
        'ig': (
            'Badante: €1.000/mese\neCura: €32/mese 💡\n\n'
            'Non è la stessa cosa — ma per molte famiglie\n'
            'la differenza è esattamente questa.\n\n'
            '🔗 Confronto completo in bio\n'
            '📞 +39 335 730 1206\n\n'
            '#badante #teleassistenza #anziani #risparmio #famiglia #caregiver'
        ),
    },
    {
        'n': 4, 'data': 'LUNEDÌ 22 SETTEMBRE', 'tipo': 'BLOG',
        'tema': 'Detraibilità fiscale 19%',
        'url': 'https://www.ecura.it/blog/bracciale-anziani-detraibile-19-percento/',
        'fb': (
            'Lo sapevi? Il bracciale per anziani si può detrarre al 19% nel 730.\n\n'
            'Ma solo se è un dispositivo medico certificato. Qui sta la differenza.\n\n'
            'eCura è certificato Classe IIA — la stessa classe di certi glucometri.\n\n'
            '📋 Detraibile come spesa sanitaria\n'
            '💶 Su €390,50/anno → recuperi ~€74 di tasse\n'
            '💡 Costo netto reale: €316,50/anno (€26/mese)\n\n'
            '👉 Guida completa: https://www.ecura.it/blog/bracciale-anziani-detraibile-19-percento/\n\n'
            'info@ecura.it · +39 335 730 1206 · www.ecura.it\n\n'
            '#detraibile #730 #spesesanitarie #bracciale #anziani #risparmio'
        ),
        'ig': (
            '📋 Il bracciale anziani si può detrarre al 19%\n\n'
            'eCura è certificato Classe IIA → detraibile\n'
            'Costo netto reale: €316,50/anno\n\n'
            '🔗 Guida completa in bio\n'
            '📞 +39 335 730 1206\n\n'
            '#detraibile #730 #anziani #risparmio #bracciale #teleassistenza'
        ),
    },
    {
        'n': 5, 'data': 'MERCOLEDÌ 24 SETTEMBRE', 'tipo': 'CONFRONTO',
        'tema': 'Seremy vs eCura — confronto prezzi',
        'url': 'https://www.ecura.it/confronto-bracciali-anziani/',
        'fb': (
            '"Ho visto Seremy in TV — è buono?"\n\n'
            'Risposta onesta — guarda i numeri:\n\n'
            '                    Seremy          eCura\n'
            'Prezzo annuo:       ~€480            €390,50\n'
            'Detraibile:          ❌ No            ✅ Sì (-19%)\n'
            'Classe IIA:          ❌ No            ✅ Sì\n'
            'Costo netto reale:   €480             €316,50\n\n'
            'La differenza è €163,50/anno — e soprattutto la certificazione medica.\n\n'
            '👉 Confronto completo: https://www.ecura.it/confronto-bracciali-anziani/\n\n'
            'info@ecura.it · +39 335 730 1206 · www.ecura.it\n\n'
            '#seremy #bracciale #confronto #anziani #teleassistenza'
        ),
        'ig': (
            'Seremy vs eCura 2026 👇\n\n'
            'Seremy: ~€480/anno · non detraibile\n'
            'eCura: €390,50/anno · Classe IIA · detraibile\n\n'
            'Costo netto eCura: €316,50/anno\n\n'
            '🔗 Confronto completo in bio\n'
            '📞 +39 335 730 1206\n\n'
            '#seremy #ecura #bracciale #confronto #anziani'
        ),
    },
    {
        'n': 6, 'data': 'VENERDÌ 26 SETTEMBRE', 'tipo': 'PARTNER',
        'tema': 'Partner — farmacisti e MMG',
        'url': 'https://www.ecura.it/partner/',
        'fb': (
            '💊 Farmacisti e medici di base: avete ogni giorno pazienti anziani che '
            'chiedono consiglio su come vivere in sicurezza a casa.\n\n'
            'Il programma partner eCura vi permette di:\n'
            '✅ Consigliare un dispositivo medico certificato ai vostri pazienti\n'
            '✅ Ricevere una commissione per ogni attivazione\n'
            '✅ Aderire gratuitamente, senza obblighi di vendita\n\n'
            '👉 Scopri il programma: https://www.ecura.it/partner/\n\n'
            'Contatto diretto: info@ecura.it · +39 335 730 1206\n\n'
            '#farmacisti #medicidibase #mmg #partner #anziani #teleassistenza #salute'
        ),
        'ig': (
            '💊 Farmacisti e medici:\n\n'
            'I vostri pazienti anziani meritano sicurezza H24.\n'
            'Con il programma partner eCura potete aiutarli — e ricevere una commissione.\n\n'
            '🔗 www.ecura.it/partner\n'
            '📧 info@ecura.it\n\n'
            '#farmacisti #medici #partner #teleassistenza #anziani #salute'
        ),
    },
    {
        'n': 7, 'data': 'LUNEDÌ 29 SETTEMBRE', 'tipo': 'BLOG',
        'tema': 'Prevenzione cadute — 10 consigli',
        'url': 'https://www.ecura.it/blog/prevenzione-cadute-anziani-10-consigli/',
        'fb': (
            '⚠️ In Italia, una persona anziana su tre cade almeno una volta all\'anno.\n\n'
            'Il 90% delle cadute avviene in casa — e il 30% di chi cade non riesce ad alzarsi da solo.\n\n'
            'Abbiamo scritto una guida con 10 interventi pratici (e a basso costo) per '
            'rendere la casa più sicura:\n\n'
            '👉 https://www.ecura.it/blog/prevenzione-cadute-anziani-10-consigli/\n\n'
            'Salvala o condividila con chi ha un anziano in famiglia — è davvero utile.\n\n'
            'info@ecura.it · +39 335 730 1206 · www.ecura.it\n\n'
            '#cadute #anziani #sicurezza #prevenzione #caregiver #casa'
        ),
        'ig': (
            '⚠️ 1 anziano su 3 cade ogni anno.\n'
            'Il 90% delle cadute: in casa.\n\n'
            '10 consigli pratici per renderla più sicura 👇\n'
            '🔗 Link in bio\n'
            '📞 +39 335 730 1206\n\n'
            '#cadute #anziani #sicurezza #prevenzione #casa #caregiver'
        ),
    },
    {
        'n': 8, 'data': 'MERCOLEDÌ 1 OTTOBRE', 'tipo': 'BLOG',
        'tema': 'GPS indoor anziani — come funziona',
        'url': 'https://www.ecura.it/blog/gps-anziani-indoor-come-funziona/',
        'fb': (
            '"Ma il GPS funziona anche in casa?"\n\n'
            'È la domanda che ci fanno quasi ogni giorno. E la risposta dipende molto '
            'dalla tecnologia usata.\n\n'
            'Il GPS classico in casa non funziona bene — il segnale satellitare non '
            'passa attraverso solai e muri.\n\n'
            'eCura usa una combinazione di GPS + Wi-Fi che permette di localizzare '
            'l\'anziano anche in casa, anche in bagno.\n\n'
            '👉 Spieghiamo tutto qui: https://www.ecura.it/blog/gps-anziani-indoor-come-funziona/\n\n'
            'info@ecura.it · +39 335 730 1206 · www.ecura.it\n\n'
            '#gps #anziani #indoor #localizzatore #bracciale #tecnologia'
        ),
        'ig': (
            '"Il GPS funziona anche in casa?" 🏠\n\n'
            'Dipende dalla tecnologia.\n'
            'eCura usa GPS + Wi-Fi: localizza l\'anziano\n'
            'anche in bagno, anche di notte.\n\n'
            '🔗 Articolo completo in bio\n'
            '📞 +39 335 730 1206\n\n'
            '#gps #indoor #anziani #bracciale #tecnologia #teleassistenza'
        ),
    },
    {
        'n': 9, 'data': 'VENERDÌ 3 OTTOBRE', 'tipo': 'PROMO',
        'tema': 'Codice ECURAAUTUNNO25 — promo 5%',
        'url': 'https://www.ecura.it/',
        'fb': (
            '🍂 Promo Autunno 2026 — codice ECURAAUTUNNO25\n\n'
            'Per chi sta ancora valutando eCura per un familiare anziano:\n\n'
            '✂️ Usa il codice <b>ECURAAUTUNNO25</b> e ottieni il 5% di sconto.\n\n'
            '€390,50 → €371/anno\n'
            'Con detrazione 19% → costo netto ~€300/anno (€25/mese)\n\n'
            'Dispositivo medico certificato Classe IIA · GPS indoor/outdoor · '
            'Centrale H24 · Rilevamento cadute AI · Pulsante SOS\n\n'
            '👉 Richiedi informazioni: www.ecura.it\n'
            '📧 info@ecura.it · 📞 +39 335 730 1206\n\n'
            '⏰ Offerta valida fino al 21 dicembre 2026\n\n'
            '#ecura #promo #sconto #bracciale #anziani #autunno2026'
        ),
        'ig': (
            '🍂 Promo Autunno 2026\n\n'
            'Codice: ECURAAUTUNNO25\n'
            '→ 5% di sconto su eCura\n'
            '→ Valido fino al 21 dicembre\n\n'
            'Con detrazione 19%: costo netto ~€300/anno\n\n'
            '🔗 www.ecura.it\n'
            '📞 +39 335 730 1206\n\n'
            '#ecura #sconto #promo #bracciale #anziani #autunno'
        ),
    },
    {
        'n': 10, 'data': 'LUNEDÌ 6 OTTOBRE', 'tipo': 'BLOG',
        'tema': 'Centrale operativa H24 — cosa succede',
        'url': 'https://www.ecura.it/blog/centrale-operativa-h24-teleassistenza/',
        'fb': (
            '"Ok, scatta l\'allarme — e poi cosa succede esattamente?"\n\n'
            'È la domanda giusta da fare prima di scegliere qualsiasi dispositivo di telesoccorso.\n\n'
            'Abbiamo descritto passo per passo cosa succede quando il bracciale eCura '
            'rileva una caduta o quando l\'anziano preme il SOS:\n\n'
            '⏱️ Entro 3-5 secondi: l\'allarme arriva alla Centrale H24\n'
            '📞 La centrale chiama l\'anziano\n'
            '🚑 Se non risponde: coordinamento con il 118 e avviso ai familiari\n\n'
            '👉 https://www.ecura.it/blog/centrale-operativa-h24-teleassistenza/\n\n'
            'info@ecura.it · +39 335 730 1206 · www.ecura.it\n\n'
            '#centrale #h24 #telesoccorso #anziani #emergenza #sicurezza'
        ),
        'ig': (
            'Scatta l\'allarme — cosa succede? ⏱️\n\n'
            '1. Entro 3-5 sec: allarme alla Centrale H24\n'
            '2. La centrale chiama l\'anziano\n'
            '3. Se non risponde → 118 + familiari\n\n'
            'Tutto automatico, tutto certificato.\n\n'
            '🔗 Approfondimento in bio\n'
            '📞 +39 335 730 1206\n\n'
            '#centrale #h24 #telesoccorso #anziani #sicurezza #emergenza'
        ),
    },
    {
        'n': 11, 'data': 'MERCOLEDÌ 8 OTTOBRE', 'tipo': 'BLOG',
        'tema': 'Dispositivo medico Classe IIA — perché conta',
        'url': 'https://www.ecura.it/blog/dispositivo-medico-classe-iia-anziani/',
        'fb': (
            'Tutti i bracciali sembrano uguali. Non lo sono.\n\n'
            'La differenza più importante — quella che pochi conoscono — è la classificazione '
            'come dispositivo medico.\n\n'
            'eCura è certificato Classe IIA secondo il Regolamento Europeo MDR 2017/745.\n\n'
            'Cosa significa nella pratica:\n'
            '✅ Il rilevamento cadute è validato clinicamente\n'
            '✅ È detraibile al 19% come spesa sanitaria\n'
            '✅ È prescrivibile da un medico\n'
            '✅ Ha controlli obbligatori periodici\n\n'
            '👉 https://www.ecura.it/blog/dispositivo-medico-classe-iia-anziani/\n\n'
            'info@ecura.it · +39 335 730 1206 · www.ecura.it\n\n'
            '#classeiia #dispositivomedico #mdr #anziani #certificazione #teleassistenza'
        ),
        'ig': (
            'Tutti i bracciali sembrano uguali.\nNon lo sono. 🔬\n\n'
            'eCura è certificato Classe IIA — MDR 2017/745\n'
            '→ Cadute validate clinicamente\n'
            '→ Detraibile al 19%\n'
            '→ Prescrivibile dal medico\n\n'
            '🔗 Scopri di più in bio\n'
            '📞 +39 335 730 1206\n\n'
            '#classeiia #dispositivomedico #anziani #certificazione #bracciale'
        ),
    },
    {
        'n': 12, 'data': 'VENERDÌ 10 OTTOBRE', 'tipo': 'PARTNER',
        'tema': 'Partner — chiamata finale alla rete professionale',
        'url': 'https://www.ecura.it/partner/',
        'fb': (
            'Hai già consigliato eCura a qualche tuo paziente o conoscente?\n\n'
            'Se sei un professionista della salute — fisioterapista, infermiere, farmacista, '
            'medico, operatore socio-sanitario — e hai pazienti anziani, '
            'il programma partner eCura è pensato per te.\n\n'
            'Non serve fare il venditore. Basta condividere un link o dare il nostro contatto '
            'a chi potrebbe averne bisogno.\n\n'
            '👉 https://www.ecura.it/partner/\n'
            '📧 info@ecura.it · 📞 +39 335 730 1206\n\n'
            '#partner #network #fisioterapia #infermieri #farmacisti #anziani #teleassistenza'
        ),
        'ig': (
            'Hai pazienti anziani che vivono soli? 👴👵\n\n'
            'Condividi eCura con loro.\n'
            'Programma partner gratuito — commissione per ogni attivazione.\n\n'
            '🔗 www.ecura.it/partner\n'
            '📧 info@ecura.it\n'
            '📞 +39 335 730 1206\n\n'
            '#partner #fisioterapia #infermieri #farmacisti #medici #anziani'
        ),
    },
]

for p in posts:
    tipo_color = tipo_colors.get(p['tipo'], GRAY_LT)

    # Intestazione post
    header = Table([[
        Paragraph(f"<b>POST #{p['n']} — {p['data']}</b>",
                  ParagraphStyle('ph', fontSize=10, textColor=white, fontName='Helvetica-Bold')),
        Paragraph(f"<b>{p['tipo']}</b>",
                  ParagraphStyle('pt', fontSize=9, textColor=white, alignment=TA_RIGHT)),
    ]], colWidths=[13*cm, 4*cm])
    header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), TEAL),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (0,-1), 10),
        ('RIGHTPADDING', (-1,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))

    # Tema + URL
    meta = Table([[
        Paragraph(f"🎯 <b>Tema:</b> {p['tema']}", SMALL),
        Paragraph(f"🔗 <b>URL:</b> {p['url']}", SMALL),
    ]], colWidths=[8*cm, 9*cm])
    meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), TEAL_LT),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.3, HexColor('#CBD5E1')),
    ]))

    # Corpo FB
    fb_label = Table([[Paragraph('📘 TESTO FACEBOOK', ParagraphStyle('fl', fontSize=8.5, fontName='Helvetica-Bold', textColor=white))]],
                     colWidths=[17*cm])
    fb_label.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor('#1877F2')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))

    fb_body_txt = p['fb'].replace('\n', '<br/>')
    fb_body = Table([[Paragraph(fb_body_txt, ParagraphStyle('fb', fontSize=8.5, leading=13, textColor=DARK))]],
                    colWidths=[17*cm])
    fb_body.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor('#F0F4FF')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 0.5, HexColor('#BFDBFE')),
    ]))

    # Corpo IG
    ig_label = Table([[Paragraph('📸 TESTO INSTAGRAM (+ hashtag)', ParagraphStyle('il', fontSize=8.5, fontName='Helvetica-Bold', textColor=white))]],
                     colWidths=[17*cm])
    ig_label.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor('#E1306C')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))

    ig_body_txt = p['ig'].replace('\n', '<br/>')
    ig_body = Table([[Paragraph(ig_body_txt, ParagraphStyle('ig', fontSize=8.5, leading=13, textColor=DARK))]],
                    colWidths=[17*cm])
    ig_body.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor('#FFF0F5')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 0.5, HexColor('#FBCFE8')),
    ]))

    block = KeepTogether([
        header, meta, fb_label, fb_body, ig_label, ig_body,
        Spacer(1, 0.5*cm),
    ])
    story.append(block)

story.append(PageBreak())

# ════════════════════════════════════════════════════════════════════
# SEZIONE 4 — GRUPPI FB
# ════════════════════════════════════════════════════════════════════
story.append(Paragraph('4. Gruppi Facebook — Dove Pubblicare i Post Partner', H2))
story.append(Paragraph(
    'I post di tipo PARTNER (17/09, 26/09, 10/10) vanno pubblicati anche nei seguenti '
    'gruppi Facebook. Accedere con il profilo Iris Bernasconi / assistenza@irbema.com.', BODY))

gruppi = [
    ['Tipo', 'Nome gruppo (cerca su FB)', 'Frequenza', 'Note'],
    ['Famiglie', 'Anziani e Caregivers Italia', '1×/mese', 'Post blog + promo sconto'],
    ['Famiglie', 'Genitori anziani: consigli e supporto', '1×/mese', 'Post blog + consigli'],
    ['Famiglie', 'Caregiver Familiari Italia', '1×/mese', 'Post emotivi + soluzioni'],
    ['Professionale', 'Fisioterapisti italiani', '1×/mese', 'Solo post PARTNER'],
    ['Professionale', 'Infermieri d\'Italia', '1×/mese', 'Solo post PARTNER'],
    ['Professionale', 'Farmacisti italiani', '1×/mese', 'Solo post PARTNER'],
    ['Professionale', 'Medici di medicina generale', '1×/mese', 'Solo post PARTNER'],
    ['Locale', 'Gruppi città/provincia (es. "Milano anziani")', 'occasionale', 'Molto efficace'],
]
g_tbl = Table(gruppi, colWidths=[3*cm, 6.5*cm, 2.5*cm, 5*cm])
g_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), TEAL),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('GRID', (0,0), (-1,-1), 0.4, HexColor('#D1D5DB')),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, GRAY_LT]),
]))
story.append(g_tbl)
story.append(Spacer(1, 0.4*cm))

# ════════════════════════════════════════════════════════════════════
# SEZIONE 5 — NOTE OPERATIVE
# ════════════════════════════════════════════════════════════════════
story.append(Paragraph('5. Note Operative', H2))

note = [
    ['⏰', 'Orari consigliati', 'Facebook: 19:00–21:00 · Instagram: 12:30 o 20:30'],
    ['🔗', 'Link in bio Instagram', 'Impostare www.ecura.it (aggiornare se necessario)'],
    ['📞', 'Contatto unico', 'info@ecura.it · +39 335 730 1206 · www.ecura.it'],
    ['🏷️', 'Codice sconto', 'ECURAAUTUNNO25 — 5% — valido fino 21/12/2026'],
    ['❌', 'Da evitare', 'Link nudi senza testo · Più di 1 post/giorno · >10 hashtag su FB'],
    ['✅', 'Rispondere ai commenti', 'Sempre entro 24h — anche solo con un "Grazie!"'],
    ['📊', 'Monitoraggio', 'Verificare ogni settimana: reach, like, commenti, messaggi ricevuti'],
]
for icon, titolo, testo in note:
    story.append(Paragraph(f'<b>{icon} {titolo}:</b> {testo}', BODY))
story.append(Spacer(1, 0.4*cm))

# ════════════════════════════════════════════════════════════════════
# SEZIONE 6 — APPROVAZIONE
# ════════════════════════════════════════════════════════════════════
story.append(HRFlowable(width='100%', thickness=1, color=TEAL))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph('6. Approvazione', H2))

approv_data = [
    [
        Paragraph('<b>Preparato da</b>', ParagraphStyle('al', fontSize=9, fontName='Helvetica-Bold', textColor=TEAL)),
        Paragraph('<b>Data preparazione</b>', ParagraphStyle('al', fontSize=9, fontName='Helvetica-Bold', textColor=TEAL)),
        Paragraph('<b>Approvato da (Stefania)</b>', ParagraphStyle('al', fontSize=9, fontName='Helvetica-Bold', textColor=TEAL)),
        Paragraph('<b>Data approvazione</b>', ParagraphStyle('al', fontSize=9, fontName='Helvetica-Bold', textColor=TEAL)),
    ],
    [
        Paragraph('Team eCura / Medica GB Srl', APPROV),
        Paragraph('13 settembre 2026', APPROV),
        Paragraph('_______________________', APPROV),
        Paragraph('___________________', APPROV),
    ],
    [
        Paragraph('', APPROV),
        Paragraph('', APPROV),
        Paragraph('Firma: _________________', APPROV),
        Paragraph('Note: __________________', APPROV),
    ],
]
approv_tbl = Table(approv_data, colWidths=[4.25*cm]*4)
approv_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), TEAL_LT),
    ('GRID', (0,0), (-1,-1), 0.5, HexColor('#D1D5DB')),
    ('TOPPADDING', (0,0), (-1,-1), 8),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
]))
story.append(approv_tbl)
story.append(Spacer(1, 0.5*cm))

story.append(Paragraph(
    '<i>Documento riservato — eCura · Medica GB Srl · info@ecura.it · +39 335 730 1206 · www.ecura.it</i>',
    ParagraphStyle('foot', fontSize=7.5, textColor=GRAY, alignment=TA_CENTER)))

# BUILD
doc.build(story)
print(f'✅ PDF generato: {OUTPUT}')
