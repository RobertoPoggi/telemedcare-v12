#!/usr/bin/env python3
# fix4.py — Final 4 MISS items

with open('src/modules/seo-manager-dashboard.ts', 'rb') as f:
    raw = f.read()

content = raw.decode('utf-8')
original = content

replacements = []

# ── 1. YouTube TAG line — exact string as found in file
# The file contains single-backslash-escaped apostrophes in a TS template literal
replacements.append((
    "📌 TAG YOUTUBE: medico online, telemedicina, ' + topic.split(' ').slice(0,3).join(', ') + ', salute digitale",
    "📌 TAG YOUTUBE: bracciale cadute anziani, SiDLY CARE, ' + topic.split(' ').slice(0,3).join(', ') + ', teleassistenza anziani"
))

# ── 2. Score textarea — find exact content after placeholder
# The score textarea defaultValue starts right after the placeholder attr
# Context: placeholder="Incolla il testo...">La telemedicina sta...
# The 'La telemedicina' was already replaced in a previous run to something else?
# Let's find what's actually there now in the score textarea

# Actually from above output "La telemedicina: NOT FOUND" so it was replaced.
# Let's check if the score textarea has correct content now
# (skipping — already done)

# ── 3. Persona — "Accesso limitato a specialisti"
# Exact from repr: 'Accesso limitato a specialisti. Keyword: "specialista senza lista d\'attesa", "medico online Sicilia", "consulto remoto urgente"'
old_persona = 'Accesso limitato a specialisti. Keyword: "specialista senza lista d\'attesa", "medico online Sicilia", "consulto remoto urgente"'
new_persona = 'Figlia caregiver: genitore anziano solo a rischio. Keyword: "bracciale cadute anziani", "teleassistenza anziani", "SiDLY CARE opinioni"'
replacements.append((old_persona, new_persona))

# ── 4. ISTAT l'adozione — exact from repr: "Il Nord-Est guida l\'adozione con il 74% di utilizzo"
old_istat = "Il Nord-Est guida l\\'adozione con il 74% di utilizzo"
new_istat = "Il Nord-Est guida l\\'adozione con il 68% degli over 65 a rischio caduta ogni anno"
replacements.append((old_istat, new_istat))

# Apply
ok = 0
miss = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        ok += 1
        print(f"OK : {repr(old[:80])}")
    else:
        miss += 1
        print(f"MISS: {repr(old[:80])}")

print(f"\nDone. OK: {ok}, MISS: {miss}, len change: {len(content) - len(original)}")

with open('src/modules/seo-manager-dashboard.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("File saved.")
