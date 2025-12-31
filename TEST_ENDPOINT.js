// ========================================
// TEST RAPIDO ENDPOINT
// ========================================

console.clear();
console.log('🔍 TEST ENDPOINT /api/setup-real-contracts\n');

// Test POST (crea contratti)
console.log('📤 Testing POST...');
fetch('/api/setup-real-contracts', { 
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => {
  console.log('Status:', r.status, r.statusText);
  return r.json();
})
.then(data => {
  console.log('\n✅ RISPOSTA POST:');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.success) {
    console.log('\n✅ Endpoint funziona!');
    console.log('Contratti creati:', data.creati);
    console.log('Revenue:', data.revenue);
  } else {
    console.log('\n❌ Errore:', data.error);
  }
})
.catch(error => {
  console.error('❌ ERRORE:', error);
});
