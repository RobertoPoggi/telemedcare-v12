#!/usr/bin/env python3
# fix3.py — Fix remaining MISS items in seo-manager-dashboard.ts
# All strings read directly from file bytes — no shell quoting issues

with open('src/modules/seo-manager-dashboard.ts', 'rb') as f:
    raw = f.read()

content = raw.decode('utf-8')
original = content

replacements = []

# ── 1. Comment header
replacements.append((
    'SEO TECNICO DASHBOARD — TeleMedCare V12.0',
    'SEO TECNICO DASHBOARD — eCura V12.0'
))

# ── 2. Hub emoji — 🏠 HUB: /telemedicina
replacements.append((
    '\U0001f3e0 HUB: /telemedicina',
    '\U0001f3e0 HUB: /teleassistenza-anziani'
))

# ── 3. Image prompt 0 — 👨‍⚕️ Medico in videochiamata
replacements.append((
    '\U0001f468\u200d\u2695\ufe0f Medico in videochiamata',
    '\U0001f474 Anziano con bracciale SiDLY CARE'
))

# ── 4. Image prompt 1 — 💻 Piattaforma digitale sanitaria
replacements.append((
    '\U0001f4bb Piattaforma digitale sanitaria',
    '\U0001f469\u200d\U0001f467 Figlia caregiver e genitore anziano'
))

# ── 5. Image prompt 2 — 🏥 Struttura medica moderna
replacements.append((
    '\U0001f3e5 Struttura medica moderna',
    '\U0001f3c5 Certificazione CE classe IIA MDR'
))

# ── 6. Image prompt 3 — 📱 Paziente usa app mobile (only the 2nd occurrence, in image prompts section)
# The first 📱 is in the SERP device selector — we must NOT touch that
# So we replace the specific surrounding text
replacements.append((
    '\U0001f4f1 Paziente usa app mobile',
    '\U0001f4f2 App eCura con GPS in tempo reale'
))

# ── 7. Image prompt 4 — 🔬 Specialista settore medico
replacements.append((
    '\U0001f52c Specialista settore medico',
    '\U0001f6a8 Allarme SOS caduta — risposta immediata'
))

# ── 8. Image prompt 5 — 📊 Infografica dati sanitari
replacements.append((
    '\U0001f4ca Infografica dati sanitari',
    '\U0001f4c8 Infografica: 3.200 morti/anno per caduta anziani'
))

# ── 9. YouTube TAG line with straight apostrophes
replacements.append((
    "\u00f4 TAG YOUTUBE: medico online, telemedicina, ' + topic.split(' ').slice(0,3).join(', ') + ', salute digitale",
    "\u00f4 TAG YOUTUBE: bracciale cadute anziani, SiDLY CARE, ' + topic.split(' ').slice(0,3).join(', ') + ', teleassistenza anziani"
))

# ── 10. Cos'è SERP (curly apostrophe U+2019)
replacements.append((
    'Cos\u2019\u00e8 e come funziona',
    'Come funziona SiDLY CARE'
))

# ── 11. Score textarea — La telemedicina full block
# Read the exact string from file
old_score = (
    "La telemedicina sta rivoluzionando l\\'accesso alle cure mediche in Italia. "
    "Con il servizio di medico online di TeleMedCare, puoi consultare specialisti "
    "qualificati direttamente dal tuo smartphone o computer. I nostri medici sono "
    "disponibili 7 giorni su 7, con tempi di risposta inferiori ai 30 minuti e "
    "certificati secondo le normative europee. Servizio attivo in tutta Italia, "
    "sicuro e conforme alle linee guida ISS. Prenota una visita con il medico "
    "online in pochi minuti: seleziona la specialit\u00e0, scegli il professionista "
    "e avvia la videochiamata."
)
new_score = (
    "Il bracciale SiDLY CARE di eCura \u00e8 un dispositivo medico certificato "
    "classe IIA (BD/RDM 2853300, CND V0399) per la teleassistenza anziani. "
    "Rileva automaticamente le cadute con sensori avanzati, trasmette la posizione "
    "GPS in real-time e attiva allarmi SOS immediati verso caregiver e centrale "
    "operativa attiva 24/7. Progettato per anziani che vivono soli e famiglie che "
    "vogliono sicurezza certificata. Piani di abbonamento flessibili: Base, Plus e "
    "Family. Conforme al Regolamento MDR 2017/745. Attivo in tutta Italia, consegna "
    "in 48 ore con assistenza dedicata."
)
replacements.append((old_score, new_score))

# ── 12. Persona d'attesa — Accesso limitato keywords
old_persona = (
    'Accesso limitato a specialisti. Keyword: \\"specialista senza lista d\'attesa\\", '
    '\\"medico online Sicilia\\", \\"consulto remoto urgente\\"'
)
new_persona = (
    'Figlia caregiver preoccupata per genitore anziano solo. Keyword: \\"bracciale cadute anziani\\", '
    '\\"teleassistenza anziani\\", \\"SiDLY CARE opinioni\\"'
)
replacements.append((old_persona, new_persona))

# ── 13. ISTAT l'adozione (straight apostrophe)
replacements.append((
    "Il Nord-Est guida l\\'adozione con il 74% di utilizzo",
    "Il Nord-Est guida l\\'adozione con il 68% degli over 65 a rischio caduta ogni anno"
))

# ── 14. salute digitale in deep research Frost text
old_frost_ctx = (
    "Il mercato europeo della salute digitale raggiunger\u00e0 \u20ac87 miliardi "
    "entro il 2028 (CAGR +18.4%). L'Italia \u00e8 il 4\u00b0 mercato per dimensioni "
    "con \u20ac4.2 miliardi"
)
new_frost_ctx = (
    "Il mercato europeo del telemonitoraggio anziani raggiunger\u00e0 \u20ac12.4 miliardi "
    "entro il 2028 (CAGR +22.1%). L'Italia conta 13.8M over-65 con crescita al 34% "
    "entro il 2050. Dispositivi classe IIA in forte espansione: \u20ac890M nel 2024"
)
replacements.append((old_frost_ctx, new_frost_ctx))

# ── 15. Backlink alert — 1.248 link trovati
replacements.append((
    '1.248 link trovati \u00b7 8 tossici da disavow \u00b7 198 domini referenti',
    '1.248 link trovati \u00b7 3 tossici da disavow \u00b7 248 domini referenti'
))

# ── 16. TeleMedCare in score textarea (if still present after fix 11)
replacements.append((
    'TeleMedCare',
    'eCura'
))

# ── 17. remaining 'medico online' references
replacements.append((
    'medico online',
    'teleassistenza anziani'
))

# ── 18. remaining 'telemedicina' references
replacements.append((
    'telemedicina',
    'teleassistenza anziani'
))

# Apply all
ok = 0
miss = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        ok += 1
        print(f"OK : {repr(old[:70])}")
    else:
        miss += 1
        print(f"MISS: {repr(old[:70])}")

print(f"\nDone. OK: {ok}, MISS: {miss}, len change: {len(content) - len(original)}")

with open('src/modules/seo-manager-dashboard.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("File saved.")
