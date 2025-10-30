/**
 * Email Template Loader Helper - D1 Database Version
 * 
 * This module loads email templates from the D1 database (document_templates table).
 * No more embedded templates - all templates are stored in the database for easy management.
 * 
 * IMPORTANT: Templates are loaded from D1 database at runtime.
 * 
 * To update templates:
 * 1. Edit template files in /templates/
 * 2. Run: python3 scripts/populate_templates.py
 * 3. Apply migration: npx wrangler d1 execute telemedcare-leads --local --file=migrations/0012_populate_templates.sql
 * 
 * Benefits of D1 storage:
 * - No code redeployment needed for template updates
 * - Centralized template management
 * - Version control via database
 * - Easy A/B testing with multiple template versions
 */

import { D1Database } from '@cloudflare/workers-types'

/**
 * Interface for template data from database
 */
interface TemplateRecord {
  id: number
  name: string
  category: string
  description: string
  version: string
  html_content: string
  variables: string // JSON array
  subject: string | null
  from_name: string | null
  active: boolean
  usage_count: number
  last_used: string | null
  created_at: string
  updated_at: string
}

/**
 * Load email template from D1 database
 * 
 * @param templateName - Name of the template (e.g., 'email_notifica_info')
 * @param db - D1 database instance (optional, for when available)
 * @returns HTML content of the template
 */
export async function loadEmailTemplate(
  templateName: string,
  db?: D1Database
): Promise<string> {
  // If no database provided, throw error
  if (!db) {
    throw new Error(
      `Cannot load template "${templateName}": D1 database not available. ` +
      `Please ensure database is configured in wrangler.toml and passed to loadEmailTemplate().`
    )
  }

  try {
    // Query template from database
    const result = await db
      .prepare(`
        SELECT html_content, active
        FROM document_templates
        WHERE id = ? AND active = 1
        LIMIT 1
      `)
      .bind(templateName)
      .first<{ html_content: string; active: number }>()

    if (!result) {
      throw new Error(
        `Template "${templateName}" not found in database. ` +
        `Available templates can be viewed with: ` +
        `SELECT name, category FROM document_templates WHERE active = 1`
      )
    }

    // Update usage statistics (fire and forget - don't wait)
    db.prepare(`
      UPDATE document_templates 
      SET usage_count = usage_count + 1,
          last_used = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
      .bind(templateName)
      .run()
      .catch(err => {
        console.error(`Failed to update template usage stats:`, err)
      })

    return result.html_content

  } catch (error) {
    console.error(`Error loading template "${templateName}":`, error)
    throw new Error(
      `Failed to load template "${templateName}": ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Get template metadata without loading full content
 * Useful for listing available templates or checking template info
 */
export async function getTemplateInfo(
  templateName: string,
  db: D1Database
): Promise<Omit<TemplateRecord, 'html_content'> | null> {
  try {
    const result = await db
      .prepare(`
        SELECT 
          id, name, category, description, version,
          variables, subject, from_name, active,
          usage_count, last_used, created_at, updated_at
        FROM document_templates
        WHERE name = ?
        LIMIT 1
      `)
      .bind(templateName)
      .first<Omit<TemplateRecord, 'html_content'>>()

    return result || null
  } catch (error) {
    console.error(`Error getting template info for "${templateName}":`, error)
    return null
  }
}

/**
 * List all available templates
 * 
 * @param db - D1 database instance
 * @param category - Optional filter by category (EMAIL, FORM, etc.)
 * @param activeOnly - Only return active templates (default: true)
 */
export async function listTemplates(
  db: D1Database,
  category?: string,
  activeOnly: boolean = true
): Promise<Array<Pick<TemplateRecord, 'id' | 'name' | 'category' | 'description' | 'version'>>> {
  try {
    let query = `
      SELECT id, name, category, description, version
      FROM document_templates
    `
    const conditions: string[] = []
    const bindings: any[] = []

    if (activeOnly) {
      conditions.push('active = 1')
    }

    if (category) {
      conditions.push('category = ?')
      bindings.push(category)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY category, name'

    const stmt = db.prepare(query)
    const result = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all()

    return result.results as Array<Pick<TemplateRecord, 'id' | 'name' | 'category' | 'description' | 'version'>>
  } catch (error) {
    console.error('Error listing templates:', error)
    return []
  }
}

/**
 * Render template by replacing placeholders with actual data
 * 
 * Supports {{PLACEHOLDER}} syntax
 * 
 * @param template - HTML template string
 * @param data - Object with placeholder values
 * @returns Rendered HTML with placeholders replaced
 */
export function renderTemplate(
  template: string,
  data: Record<string, any>
): string {
  let rendered = template

  // Replace all {{PLACEHOLDER}} with actual values
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    
    // Convert value to string, handle null/undefined
    const stringValue = value !== null && value !== undefined ? String(value) : ''
    
    rendered = rendered.replace(regex, stringValue)
  }

  return rendered
}

/**
 * Validate that template has all required placeholders
 * 
 * @param template - HTML template string
 * @param requiredPlaceholders - Array of required placeholder names
 * @returns Object with validation result and missing placeholders
 */
export function validateTemplate(
  template: string,
  requiredPlaceholders: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const placeholder of requiredPlaceholders) {
    const pattern = `{{${placeholder}}}`
    if (!template.includes(pattern)) {
      missing.push(placeholder)
    }
  }

  return {
    valid: missing.length === 0,
    missing
  }
}

/**
 * Extract all placeholders from a template
 * 
 * @param template - HTML template string
 * @returns Array of placeholder names found in template
 */
export function extractPlaceholders(template: string): string[] {
  const regex = /\{\{([A-Z_0-9]+)\}\}/g
  const placeholders: string[] = []
  let match

  while ((match = regex.exec(template)) !== null) {
    if (!placeholders.includes(match[1])) {
      placeholders.push(match[1])
    }
  }

  return placeholders
}
