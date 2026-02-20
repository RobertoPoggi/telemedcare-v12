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
  // 🔄 PRIORITÀ 1: Carica dal DATABASE
  try {
    console.log(`📂 [TEMPLATE] Tentativo caricamento da DB: "${templateName}"`)
    const dbTemplate = await db.prepare('SELECT id, name, subject, content FROM email_templates WHERE name = ?')
      .bind(templateName)
      .first()
    
    if (dbTemplate && (dbTemplate as any).content) {
      console.log(`✅ [TEMPLATE] Caricato dal DB: "${templateName}" (${((dbTemplate as any).content as string).length} chars)`)
      return (dbTemplate as any).content as string
    }
    
    console.log(`⚠️ [TEMPLATE] Template "${templateName}" non trovato nel DB, provo file statico...`)
  } catch (dbError) {
    console.error(`❌ [TEMPLATE] Errore caricamento DB:`, dbError)
    console.log(`⚠️ [TEMPLATE] Fallback a file statico...`)
  }
  
  // 🔄 FALLBACK: Carica da file statico
  const baseUrl = env?.PUBLIC_URL || env?.PAGES_URL || 'https://telemedcare-v12.pages.dev'
  const templatePath = `/templates/email/${templateName}.html`
  const templateUrl = `${baseUrl}${templatePath}`
  
  console.log(`📂 [TEMPLATE] Loading from file: ${templateUrl}`)
  
  try {
    const response = await fetch(templateUrl)
    
    if (!response.ok) {
      throw new Error(`Template not found: HTTP ${response.status}`)
    }
    
    const html = await response.text()
    console.log(`✅ [TEMPLATE] Loaded from file: "${templateName}" (${html.length} chars)`)
    return html
    
  } catch (error) {
    console.error(`❌ [TEMPLATE] Error loading "${templateName}":`, error)
    throw new Error(`Template "${templateName}" not found in DB or at ${templateUrl}`)
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
          
          // Prima risolvi le sezioni condizionali booleane dentro l'item
          for (const [itemKey, itemValue] of Object.entries(item)) {
            // Se il valore è booleano o truthy/falsy, gestisci sezioni condizionali
            const conditionRegex = new RegExp(`{{#${itemKey}}}([\\s\\S]*?){{/${itemKey}}}`, 'g')
            itemRendered = itemRendered.replace(conditionRegex, (condMatch, condContent) => {
              // Se il valore è truthy, mostra il contenuto, altrimenti rimuovilo
              return itemValue ? condContent : ''
            })
          }
          
          // Poi sostituisci i placeholder semplici
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

/**
 * Load HTML file from public directory
 */
export async function loadHtmlFile(
  filename: string,
  env?: any
): Promise<string> {
  const baseUrl = env?.PUBLIC_URL || env?.PAGES_URL || 'https://telemedcare-v12.pages.dev'
  const fileUrl = `${baseUrl}/${filename}`
  
  console.log(`📂 [HTML] Loading "${filename}" from: ${fileUrl}`)
  
  try {
    const response = await fetch(fileUrl)
    
    if (!response.ok) {
      throw new Error(`HTML file not found: HTTP ${response.status}`)
    }
    
    const html = await response.text()
    console.log(`✅ [HTML] Loaded "${filename}" (${html.length} chars)`)
    return html
    
  } catch (error) {
    console.error(`❌ [HTML] Error loading "${filename}":`, error)
    throw new Error(`HTML file "${filename}" not found at ${fileUrl}`)
  }
}
