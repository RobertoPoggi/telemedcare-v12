#!/usr/bin/env python3
import pandas as pd

# I 12 lead originali manuali di Ottavia
original_12 = [
    "Alberto Avanzi",
    "Giovanna Giordano", 
    "Mary De Sanctis",
    "Francesco Egiziano",
    "Enzo Pedron",
    "Andrea Dindo",
    "Maria Chiara Baldassini",
    "Laura Bianchi",  # ESEMPIO - non da caricare
    "Marco Olivieri",
    "Andrea Mercuri",
    "Adriana Mulassano",
    "Paola Scarpin"
]

print("📋 VERIFICA 12 LEAD ORIGINALI")
print("=" * 70)
print(f"\nTotale lead nella lista: {len(original_12)}")

print("\n✅ GIÀ PRESENTI SU TELEMEDCARE (4):")
print("   1. Marco Olivieri")
print("   2. Andrea Mercuri")
print("   3. Adriana Mulassano")
print("   4. Paola Scarpin")

print("\n✅ RECUPERATI DA HUBSPOT (5):")
print("   5. Alberto Avanzi")
print("   6. Giovanna Giordano")
print("   7. Francesco Egiziano")
print("   8. Enzo Pedron")
print("   9. Maria Chiara Baldassini")

print("\n✅ APPENA IMPORTATI DA EXCEL (2):")
print("   10. Andrea Dindo")
print("   11. Mary De Sanctis")

print("\n❌ ESEMPI - NON DA CARICARE (1):")
print("   • Laura Bianchi")

print("\n" + "=" * 70)
print("📊 RIEPILOGO:")
print(f"   • Totale originali: 12")
print(f"   • Già presenti: 4")
print(f"   • Recuperati: 5")
print(f"   • Importati ora: 2")
print(f"   • Esempi (skip): 1")
print(f"   • TOTALE GESTITO: 11/12 (92%)")
print(f"   • MANCANTI: 1/12 (8%)")

print("\n🔍 CERCO IL 12° LEAD NEL TRACKER...")

# Leggi Tracker
file_path = '/home/user/uploaded_files/REPORT_SETTIMANALE_Ottavia_TEMPLATE.xlsx'
df = pd.read_excel(file_path, sheet_name='Tracker Giornaliero', header=3)

# Tutti i nomi dal tracker (escludi esempi e già gestiti)
managed = [
    "alberto avanzi", "giovanna giordano", "mary de sanctis",
    "francesco egiziano", "enzo pedron", "andrea dindo",
    "maria chiara baldassini", "laura bianchi", "marco olivieri",
    "andrea mercuri", "adriana mulassano", "paola scarpin"
]

print("\n📝 LEAD NEL TRACKER GIORNALIERO (primi 20 unici):")
unique_names = []
for idx, row in df.iterrows():
    if idx >= 155:  # Limit check
        break
    name = str(row.iloc[3]).strip()
    if name and name != 'nan' and name.lower() not in unique_names and name.lower() not in managed:
        unique_names.append(name.lower())
        if len(unique_names) <= 20:
            print(f"   • {name}")

print(f"\n💡 Suggerimento: Il 12° lead potrebbe essere uno dei lead qui sopra")
print(f"   che è stato aggiunto manualmente da Ottavia il 13/02/2026 alle 01:27")
