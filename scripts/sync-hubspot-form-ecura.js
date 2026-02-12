#!/usr/bin/env node
/**
 * Script: Sincronizzazione Lead Form eCura da HubSpot
 * 
 * Funzionalità:
 * 1. Query HubSpot per lead con hs_object_source_detail_1 = "Form eCura"
 * 2. Filtra per data creazione >= 1 gennaio 2026
 * 3. Trova corrispondenze nel database locale TeleMedCare
 * 4. Aggiorna fonte a "Form eCura"
 * 
 * Uso:
 *   HUBSPOT_ACCESS_TOKEN=xxx node scripts/sync-hubspot-form-ecura.js
 */

const API_BASE = 'https://telemedcare-v12.pages.dev'

// ============================================
// STEP 1: Query HubSpot API
// ============================================

async function getFormEcuraLeadsFromHubSpot(accessToken) {
  console.log('🔍 STEP 1: Query HubSpot per lead Form eCura\n')
  
  const url = 'https://api.hubapi.com/crm/v3/objects/contacts/search'
  
  const body = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: 'hs_object_source_detail_1',
            operator: 'EQ',
            value: 'Form eCura'
          },
          {
            propertyName: 'createdate',
            operator: 'GTE',
            value: new Date('2026-01-01').getTime().toString() // Timestamp Unix in ms
          }
        ]
      }
    ],
    properties: [
      'firstname',
      'lastname',
      'email',
      'phone',
      'createdate',
      'hs_object_source_detail_1',
      'servizio_ecura',
      'piano_ecura'
    ],
    limit: 100,
    sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }]
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HubSpot API Error: ${response.status} - ${error}`)
  }
  
  const data = await response.json()
  
  console.log(`✅ Trovati ${data.total} lead HubSpot con Form eCura (dal 1 gen 2026)\n`)
  
  if (data.results && data.results.length > 0) {
    console.log('Primi 10 lead HubSpot:')
    data.results.slice(0, 10).forEach((contact, i) => {
      const props = contact.properties
      console.log(`${i + 1}. HubSpot ID ${contact.id} - ${props.firstname} ${props.lastname} - ${props.email}`)
    })
    console.log()
  }
  
  return data.results || []
}

// ============================================
// STEP 2: Match con database locale
// ============================================

async function matchLeadsWithLocalDatabase(hubspotContacts) {
  console.log('🔍 STEP 2: Match con database TeleMedCare locale\n')
  
  // Carica tutti i lead dal database
  const response = await fetch(`${API_BASE}/api/leads?limit=200`)
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  
  const data = await response.json()
  const localLeads = data.leads || []
  
  console.log(`📊 Lead locali: ${localLeads.length}`)
  
  // Match per external_source_id (HubSpot ID)
  const matched = []
  
  for (const hubspotContact of hubspotContacts) {
    const hubspotId = hubspotContact.id
    
    // Cerca nel database locale
    const localLead = localLeads.find(lead => 
      lead.external_source_id === hubspotId
    )
    
    if (localLead) {
      matched.push({
        hubspotId,
        leadId: localLead.id,
        nome: `${hubspotContact.properties.firstname} ${hubspotContact.properties.lastname}`,
        email: hubspotContact.properties.email,
        fonteAttuale: localLead.fonte || '(vuota)',
        created_at: localLead.created_at
      })
    } else {
      console.log(`⚠️  HubSpot ID ${hubspotId} NON trovato nel database locale`)
    }
  }
  
  console.log(`\n✅ Matched: ${matched.length}/${hubspotContacts.length} lead\n`)
  
  if (matched.length > 0) {
    console.log('Lead da aggiornare:')
    matched.forEach((m, i) => {
      console.log(`${i + 1}. ${m.leadId} - ${m.nome} - Fonte attuale: ${m.fonteAttuale}`)
    })
    console.log()
  }
  
  return matched
}

// ============================================
// STEP 3: Aggiorna fonte
// ============================================

async function updateLeadsFonte(matchedLeads) {
  console.log('🔄 STEP 3: Aggiornamento fonte "Form eCura"\n')
  
  const leadIds = matchedLeads.map(m => m.leadId)
  
  if (leadIds.length === 0) {
    console.log('⚠️  Nessun lead da aggiornare')
    return { success: true, updated: 0 }
  }
  
  // Usa endpoint batch
  const response = await fetch(`${API_BASE}/api/admin/update-fonte-batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      leadIds,
      fonte: 'Form eCura'
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Update Error: ${response.status} - ${error}`)
  }
  
  const result = await response.json()
  
  console.log(`✅ Aggiornati ${result.successCount}/${result.total} lead`)
  console.log(`   Errori: ${result.errorCount}`)
  
  if (result.errors && result.errors.length > 0) {
    console.log('\n❌ Errori dettagliati:')
    result.errors.forEach(err => console.log(`   - ${err}`))
  }
  
  return result
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║  SYNC HUBSPOT FORM ECURA → TELEMEDCARE DATABASE          ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')
  
  // Verifica API token
  const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN
  
  if (!HUBSPOT_TOKEN) {
    console.error('❌ ERRORE: Variabile HUBSPOT_ACCESS_TOKEN non configurata')
    console.error('\nUso:')
    console.error('  HUBSPOT_ACCESS_TOKEN=pat-xxx node scripts/sync-hubspot-form-ecura.js')
    process.exit(1)
  }
  
  console.log(`✅ HubSpot Token: ${HUBSPOT_TOKEN.substring(0, 15)}...`)
  console.log(`✅ API Endpoint: ${API_BASE}\n`)
  
  try {
    // Step 1: Query HubSpot
    const hubspotContacts = await getFormEcuraLeadsFromHubSpot(HUBSPOT_TOKEN)
    
    if (hubspotContacts.length === 0) {
      console.log('⚠️  Nessun lead Form eCura trovato su HubSpot')
      process.exit(0)
    }
    
    // Step 2: Match con database locale
    const matchedLeads = await matchLeadsWithLocalDatabase(hubspotContacts)
    
    if (matchedLeads.length === 0) {
      console.log('⚠️  Nessun lead matchato con il database locale')
      process.exit(0)
    }
    
    // Step 3: Aggiorna fonte
    const result = await updateLeadsFonte(matchedLeads)
    
    console.log('\n╔══════════════════════════════════════════════════════════╗')
    console.log('║  SYNC COMPLETATO                                         ║')
    console.log('╚══════════════════════════════════════════════════════════╝')
    console.log(`\n📊 Riepilogo finale:`)
    console.log(`   - Lead HubSpot Form eCura: ${hubspotContacts.length}`)
    console.log(`   - Lead matchati: ${matchedLeads.length}`)
    console.log(`   - Lead aggiornati: ${result.successCount || 0}`)
    console.log(`   - Errori: ${result.errorCount || 0}`)
    
  } catch (error) {
    console.error('\n❌ ERRORE:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Esegui
main()
