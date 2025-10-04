// Test IMEI valido per Luhn algorithm
function generateValidIMEI() {
  // Usa primi 14 digit fissi per test
  let imei = '86012345678901'
  
  // Calcola check digit con Luhn
  let sum = 0
  let alternate = true

  for (let i = imei.length - 1; i >= 0; i--) {
    let digit = parseInt(imei.charAt(i), 10)

    if (alternate) {
      digit *= 2
      if (digit > 9) {
        digit = digit % 10 + 1
      }
    }

    sum += digit
    alternate = !alternate
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return imei + checkDigit.toString()
}

console.log('IMEI valido:', generateValidIMEI())