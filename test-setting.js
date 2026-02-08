// Simula la query DB
const settingResult = { value: 'true' }
const adminEmailEnabled = settingResult?.value === 'true'
console.log('settingResult:', settingResult)
console.log('settingResult.value:', settingResult.value)
console.log('typeof settingResult.value:', typeof settingResult.value)
console.log('adminEmailEnabled:', adminEmailEnabled)
