/**
 * URL Helper - Gestisce URL base corretto per ogni ambiente
 *
 * ⚠️ IMPORTANTE: CF_PAGES_URL NON va usato per link nelle email.
 * CF_PAGES_URL è l'URL del singolo deployment con hash univoco
 * (es. df71e390.telemedcare-v12.pages.dev) — cambia ad ogni deploy
 * e non è il dominio canonico del sito.
 *
 * Priorità corretta:
 * 1. PUBLIC_URL  → impostata manualmente in Cloudflare Pages Settings
 * 2. CF_PAGES_BRANCH === 'main' → https://telemedcare-v12.pages.dev (hardcoded)
 * 3. Fallback hardcoded → https://telemedcare-v12.pages.dev
 */

/**
 * Get base URL for the current environment
 * Returns always the canonical domain, never a per-deployment hash URL.
 *
 * @param env - Environment object from Cloudflare Workers/Pages
 * @returns Canonical base URL (never a hash-deployment URL)
 */
export function getBaseUrl(env: any): string {
  const publicUrl = env?.PUBLIC_URL
  const cfPagesBranch = env?.CF_PAGES_BRANCH
  const canonicalUrl = 'https://telemedcare-v12.pages.dev'

  // 1. Priorità massima: PUBLIC_URL impostata manualmente (es. dominio custom)
  if (publicUrl && !publicUrl.includes('pages.dev/')) {
    console.log(`🌐 [URL-HELPER] Using PUBLIC_URL: ${publicUrl}`)
    return publicUrl
  }

  // 2. Se siamo su branch main → dominio canonico
  if (cfPagesBranch === 'main' || !cfPagesBranch) {
    console.log(`🌐 [URL-HELPER] Using canonical URL (branch=${cfPagesBranch || 'unknown'}): ${canonicalUrl}`)
    return canonicalUrl
  }

  // 3. Preview branch → sottodominio branch (solo per test, non per email produzione)
  const previewUrl = `https://${cfPagesBranch}.telemedcare-v12.pages.dev`
  console.log(`🌐 [URL-HELPER] Preview branch '${cfPagesBranch}': ${previewUrl}`)
  return previewUrl
}
