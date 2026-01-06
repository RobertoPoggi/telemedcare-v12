/**
 * Clean Email Template Loader
 * Simple, reliable template loading from D1 database
 */

import { D1Database } from '@cloudflare/workers-types'

/**
 * Load email template from file system (public/templates/email/)
 */
export async function loadEmailTemplate(
  templateName: string,
  db: D1Database,
  env?: any
): Promise<string> {
  const baseUrl = env?.PUBLIC_URL || env?.PAGES_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'
  const templatePath = `/templates/email/${templateName}.html`
  const templateUrl = `${baseUrl}${templatePath}`
  
  console.log(`📂 [TEMPLATE] Loading "${templateName}" from: ${templateUrl}`)
  
  try {
    const response = await fetch(templateUrl)
    
    if (!response.ok) {
      throw new Error(`Template not found: HTTP ${response.status}`)
    }
    
    const html = await response.text()
    console.log(`✅ [TEMPLATE] Loaded "${templateName}" (${html.length} chars)`)
    return html
    
  } catch (error) {
    console.error(`❌ [TEMPLATE] Error loading "${templateName}":`, error)
    throw new Error(`Template "${templateName}" not found at ${templateUrl}`)
  }
}

/**
 * Render template by replacing placeholders with actual data
 * Supports {{PLACEHOLDER}} syntax
 */
export function renderTemplate(
  template: string,
  data: Record<string, any>
): string {
  let rendered = template

  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    const stringValue = value !== null && value !== undefined ? String(value) : ''
    rendered = rendered.replace(regex, stringValue)
  }

  return rendered
}
