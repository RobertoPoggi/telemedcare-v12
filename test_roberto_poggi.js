// Test completo flusso con Roberto Poggi

const BASE_URL = 'https://telemedcare-v12.pages.dev'

async function testCompleteFlow() {
  console.log('🧪 TEST COMPLETO FLUSSO - Roberto Poggi\n')
  
  // 1. Verifica se esiste già un lead
  console.log('1️⃣ Cerco lead esistente per Roberto Poggi...')
  
  const leadsResponse = await fetch(`${BASE_URL}/api/leads`)
  if (!leadsResponse.ok) {
    console.error('❌ Errore recupero leads:', await leadsResponse.text())
    return
  }
  
  const leads = await leadsResponse.json()
  let testLead = leads.find(l => 
    l.nomeRichiedente === 'Roberto' && 
    l.cognomeRichiedente === 'Poggi'
  )
  
  if (testLead) {
    console.log(`✅ Lead trovato: ${testLead.id}`)
  } else {
    console.log('⚠️ Lead non trovato, creo nuovo lead...')
    
    // Crea nuovo lead
    const createResponse = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nomeRichiedente: 'Roberto',
        cognomeRichiedente: 'Poggi',
        email: 'roberto.poggi@example.com',
        telefono: '+39 333 1234567',
        servizio: 'eCura PRO',
        pacchetto: 'AVANZATO',
        fonte: 'TEST_MANUAL',
        tipoServizio: 'AVANZATO',
        status: 'NEW'
      })
    })
    
    if (!createResponse.ok) {
      console.error('❌ Errore creazione lead:', await createResponse.text())
      return
    }
    
    testLead = await createResponse.json()
    console.log(`✅ Lead creato: ${testLead.id}`)
  }
  
  const leadId = testLead.id
  
  // 2. Test Manual Sign (firma manuale → crea contratto + proforma)
  console.log('\n2️⃣ Test Firma Manuale (crea contratto + proforma)...')
  const signResponse = await fetch(`${BASE_URL}/api/leads/${leadId}/manual-sign`, {
    method: 'POST'
  })
  
  if (!signResponse.ok) {
    console.error('❌ Errore firma manuale:', await signResponse.text())
    return
  }
  
  const signResult = await signResponse.json()
  console.log('✅ Firma manuale completata:', signResult)
  
  // 3. Test Send Proforma
  console.log('\n3️⃣ Test Invio Proforma...')
  const proformaResponse = await fetch(`${BASE_URL}/api/leads/${leadId}/send-proforma`, {
    method: 'POST'
  })
  
  if (!proformaResponse.ok) {
    console.error('❌ Errore invio proforma:', await proformaResponse.text())
  } else {
    const proformaResult = await proformaResponse.json()
    console.log('✅ Proforma inviata:', proformaResult)
  }
  
  // 4. Test Manual Payment (conferma pagamento → invia email form configurazione)
  console.log('\n4️⃣ Test Pagamento Manuale (trigger email configurazione)...')
  const paymentResponse = await fetch(`${BASE_URL}/api/leads/${leadId}/manual-payment`, {
    method: 'POST'
  })
  
  if (!paymentResponse.ok) {
    console.error('❌ Errore pagamento manuale:', await paymentResponse.text())
  } else {
    const paymentResult = await paymentResponse.json()
    console.log('✅ Pagamento confermato:', paymentResult)
    console.log('📧 Email benvenuto con link configurazione dovrebbe essere stata inviata!')
  }
  
  // 5. Test Send Configuration (re-invio email configurazione)
  console.log('\n5️⃣ Test Re-invio Form Configurazione...')
  const configResponse = await fetch(`${BASE_URL}/api/leads/${leadId}/send-configuration`, {
    method: 'POST'
  })
  
  if (!configResponse.ok) {
    console.error('❌ Errore invio configurazione:', await configResponse.text())
  } else {
    const configResult = await configResponse.json()
    console.log('✅ Email configurazione inviata:', configResult)
    console.log('📧 Email benvenuto con link configurazione dovrebbe essere stata inviata!')
  }
  
  console.log('\n✅ TEST COMPLETO TERMINATO!')
  console.log(`📊 Lead ID: ${leadId}`)
  console.log(`📧 Controlla email: roberto.poggi@example.com`)
  console.log(`🔗 Dashboard: ${BASE_URL}/admin/leads-dashboard`)
}

testCompleteFlow().catch(console.error)
