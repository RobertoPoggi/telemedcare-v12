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

  // 1. Gestisci sezioni array ({{#KEY}}...{{/KEY}})
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      const sectionStart = `{{#${key}}}`
      const sectionEnd = `{{/${key}}}`
      const sectionRegex = new RegExp(`${sectionStart}([\\s\\S]*?)${sectionEnd}`, 'g')
      
      rendered = rendered.replace(sectionRegex, (match, sectionContent) => {
        if (value.length === 0) return ''
        
        return value.map(item => {
          let itemRendered = sectionContent
          for (const [itemKey, itemValue] of Object.entries(item)) {
            const itemPlaceholder = `{{${itemKey}}}`
            const itemRegex = new RegExp(itemPlaceholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
            const itemStringValue = itemValue !== null && itemValue !== undefined ? String(itemValue) : ''
            itemRendered = itemRendered.replace(itemRegex, itemStringValue)
          }
          return itemRendered
        }).join('')
      })
    }
  }

  // 2. Sostituisci placeholder semplici
  for (const [key, value] of Object.entries(data)) {
    if (!Array.isArray(value)) {
      const placeholder = `{{${key}}}`
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      const stringValue = value !== null && value !== undefined ? String(value) : ''
      rendered = rendered.replace(regex, stringValue)
    }
  }

  return rendered
}
