/**
 * Clean Email Template Loader
 * Simple, reliable template loading from D1 database
 */

import { D1Database } from '@cloudflare/workers-types'

export interface EmailTemplate {
  subject: string
  html_content: string
}

/**
 * Load email template from D1 database
 */
export async function loadEmailTemplate(
  templateName: string,
  db: D1Database
): Promise<EmailTemplate> {
  if (!db) {
    throw new Error(`Database not available for template "${templateName}"`)
  }

  try {
    const result = await db
      .prepare('SELECT subject, html_content FROM document_templates WHERE id = ? AND active = 1 LIMIT 1')
      .bind(templateName)
      .first<EmailTemplate>()

    if (!result) {
      throw new Error(`Template "${templateName}" not found`)
    }

    return result
  } catch (error) {
    console.error(`Error loading template "${templateName}":`, error)
    throw error
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
