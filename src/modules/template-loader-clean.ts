/**
 * Clean Email Template Loader
 * Simple, reliable template loading from D1 database
 */

import { D1Database } from '@cloudflare/workers-types'

/**
 * Load email template from D1 database or fallback to file system
 */
export async function loadEmailTemplate(
  templateName: string,
  db: D1Database,
  env?: any
): Promise<string> {
  // Try loading from database first
  if (db) {
    try {
      const result = await db
        .prepare('SELECT html_content FROM document_templates WHERE id = ? AND active = 1 LIMIT 1')
        .bind(templateName)
        .first<{ html_content: string }>()

      if (result && result.html_content) {
        console.log(`📧 [TEMPLATE] Loaded "${templateName}" from database`)
        return result.html_content
      }
    } catch (error) {
      console.warn(`⚠️ [TEMPLATE] Database error for "${templateName}":`, error)
      // Continue to file fallback
    }
  }

  // Fallback: Load from file system (public/templates/email/)
  console.log(`📂 [TEMPLATE] Loading "${templateName}" from file system (fallback)`)
  
  try {
    const baseUrl = env?.PUBLIC_URL || env?.PAGES_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'
    const templatePath = `/templates/email/${templateName}.html`
    const templateUrl = `${baseUrl}${templatePath}`
    
    console.log(`📥 [TEMPLATE] Fetching from: ${templateUrl}`)
    
    const response = await fetch(templateUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    console.log(`✅ [TEMPLATE] Loaded "${templateName}" from file (${html.length} chars)`)
    return html
    
  } catch (error) {
    console.error(`❌ [TEMPLATE] Error loading template "${templateName}":`, error)
    throw new Error(`Template "${templateName}" not found in database or file system`)
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
