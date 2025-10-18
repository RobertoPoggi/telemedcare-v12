#!/usr/bin/env python3
"""
Test Sistema Generazione Documenti
TeleMedCare V11.0
"""

import sys
import os

# Aggiungi path moduli
current_dir = os.path.dirname(os.path.abspath(__file__))
services_dir = os.path.join(current_dir, 'src', 'services')
sys.path.insert(0, services_dir)

# Import dopo aver aggiunto il path
import json
from pathlib import Path

# Import diretto del modulo
spec = __import__('importlib.util').util.spec_from_file_location(
    "document_generator", 
    os.path.join(services_dir, "document-generator.py")
)
doc_gen = __import__('importlib.util').util.module_from_spec(spec)
spec.loader.exec_module(doc_gen)
DocumentGenerator = doc_gen.DocumentGenerator

def test_document_generation():
    """Test completo generazione documenti"""
    
    print("="*60)
    print("TEST SISTEMA GENERAZIONE DOCUMENTI")
    print("="*60)
    
    # Dati lead di test
    lead_data = {
        'id': '000123',
        'nomeRichiedente': 'Mario',
        'cognomeRichiedente': 'Rossi',
        'emailRichiedente': 'mario.rossi@example.com',
        'telefonoRichiedente': '+39 333 1234567',
        'nomeAssistito': 'Giulia',
        'cognomeAssistito': 'Verdi',
        'dataNascitaAssistito': '15/03/1950',
        'luogoNascitaAssistito': 'Roma',
        'cfAssistito': 'VRDGLI50C55H501Z',
        'indirizzoAssistito': 'Via dei Fiori 25, 00100 Roma RM',
        'cfRichiedente': 'RSSMRA70A01H501X',
        'indirizzoRichiedente': 'Via Milano 10, 20100 Milano MI',
        'pacchetto': 'Servizio Base',  # Prova anche 'Servizio Avanzato'
        'vuoleContratto': True,
        'intestazioneContratto': 'Assistito'
    }
    
    print("\n📋 DATI LEAD:")
    print(json.dumps(lead_data, indent=2, ensure_ascii=False))
    
    # Crea istanza generator
    generator = DocumentGenerator(
        templates_dir='./templates',
        output_dir='./documents'
    )
    
    # Genera documenti
    print("\n🚀 Avvio generazione documenti...")
    result = generator.generate_contract_from_lead(lead_data)
    
    print("\n" + "="*60)
    print("RISULTATO:")
    print("="*60)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    if result['success']:
        print("\n✅ Test completato con successo!")
        print(f"\n📄 Contratto generato: {result['contract_pdf_path']}")
        print(f"📄 Proforma generata: {result['proforma_pdf_path']}")
        print(f"\n💰 Tipo servizio: {result['tipo_servizio']}")
        print(f"💰 Prezzo base: €{result['prezzo_base']:.2f}")
        print(f"💰 Prezzo IVA inclusa: €{result['prezzo_iva_inclusa']:.2f}")
    else:
        print("\n❌ Test fallito!")
        print("Errori:")
        for error in result.get('errors', []):
            print(f"  - {error}")
    
    print("\n" + "="*60)

if __name__ == '__main__':
    test_document_generation()
