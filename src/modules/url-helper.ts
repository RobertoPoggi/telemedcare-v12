/**
 * URL Helper - Gestisce URL base corretto per ogni ambiente
 * Usa CF_PAGES_URL fornito automaticamente da Cloudflare Pages
 */

/**
 * Get base URL for the current environment (Production or Preview)
 * 
 * Cloudflare Pages provides CF_PAGES_URL automatically:
 * - Production (main branch): https://telemedcare-v12.pages.dev
 * - Preview (test-environment branch): https://test-environment.telemedcare-v12.pages.dev
 * - Preview (feature-xyz branch): https://feature-xyz.telemedcare-v12.pages.dev
 * 
 * @param env - Environment object from Cloudflare Workers/Pages
 * @returns Base URL for the current environment
 */
export function getBaseUrl(env: any): string {
  const cfPagesUrl = env?.CF_PAGES_URL
  const publicUrl = env?.PUBLIC_URL
  const pagesUrl = env?.PAGES_URL
  const cfPagesBranch = env?.CF_PAGES_BRANCH
  const fallback = 'https://telemedcare-v12.pages.dev'
  
  // DEBUG: Log tutte le env vars URL disponibili
  console.log('🌐 [URL-HELPER] Environment URL variables:')
  console.log(`   CF_PAGES_URL: ${cfPagesUrl || '(undefined)'}`)
  console.log(`   CF_PAGES_BRANCH: ${cfPagesBranch || '(undefined)'}`)
  console.log(`   PUBLIC_URL: ${publicUrl || '(undefined)'}`)
  console.log(`   PAGES_URL: ${pagesUrl || '(undefined)'}`)
  
  // FALLBACK: Se CF_PAGES_URL non disponibile, costruisci da CF_PAGES_BRANCH
  let result = cfPagesUrl || publicUrl || pagesUrl
  
  if (!result && cfPagesBranch) {
    // Costruisci URL manualmente da branch name
    if (cfPagesBranch === 'main') {
      result = 'https://telemedcare-v12.pages.dev'
      console.log(`   🔧 Constructed from branch 'main': ${result}`)
    } else {
      result = `https://${cfPagesBranch}.telemedcare-v12.pages.dev`
      console.log(`   🔧 Constructed from branch '${cfPagesBranch}': ${result}`)
    }
  }
  
  if (!result) {
    result = fallback
    console.log(`   ⚠️ Using fallback: ${result}`)
  } else {
    console.log(`   ✅ Using: ${result}`)
  }
  
  return result
}
