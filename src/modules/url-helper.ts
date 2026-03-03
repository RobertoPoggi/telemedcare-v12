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
  return env?.CF_PAGES_URL || env?.PUBLIC_URL || env?.PAGES_URL || 'https://telemedcare-v12.pages.dev'
}
