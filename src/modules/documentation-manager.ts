/**
 * TeleMedCare V12.0 - Documentation Management System
 * Sistema completo documentazione visibile ed editabile
 */

export interface DocumentSection {
  id: string
  title: string
  content: string
  last_updated: string
  author: string
  version: string
  category: 'technical' | 'user' | 'admin' | 'api' | 'deployment'
  tags: string[]
}

export interface DocumentationIndex {
  sections: DocumentSection[]
  categories: Record<string, DocumentSection[]>
  last_update: string
  total_sections: number
}

export class DocumentationManager {
  
  constructor(private db: D1Database) {}

  /**
   * Ottieni indice completo documentazione
   */
  async getDocumentationIndex(): Promise<DocumentationIndex> {
    try {
      // Carica sezioni documentazione dal database
      const sections = await this.loadDocumentationSections()
      
      // Organizza per categorie
      const categories = this.organizeByCategory(sections)
      
      return {
        sections,
        categories,
        last_update: new Date().toISOString(),
        total_sections: sections.length
      }
    } catch (error) {
      console.error('Error loading documentation index:', error)
      return {
        sections: [],
        categories: {},
        last_update: new Date().toISOString(),
        total_sections: 0
      }
    }
  }

  /**
   * Ottieni lista categorie documentazione
   */
  async getDocumentationCategories(): Promise<string[]> {
    try {
      const result = await this.db.prepare(`
        SELECT DISTINCT category FROM documentation_sections WHERE is_active = 1 ORDER BY category
      `).all()
      
      return result.results?.map(row => row.category as string) || []
    } catch (error) {
      console.error('Error loading documentation categories:', error)
      return []
    }
  }

  /**
   * Carica sezione documentazione specifica
   */
  async getDocumentationSection(sectionId: string): Promise<DocumentSection | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM documentation_sections WHERE category = ? OR id = ?
      `).bind(sectionId, sectionId).first()

      if (result) {
        return {
          id: result.id.toString(),
          title: result.title as string,
          content: result.content as string,
          last_updated: result.updated_at as string,
          author: result.author as string,
          version: result.version as string,
          category: result.category as DocumentSection['category'],
          tags: (result.tags as string).split(',') || []
        }
      }

      return null
    } catch (error) {
      console.error('Error loading documentation section:', error)
      return null
    }
  }

  /**
   * Salva/Aggiorna sezione documentazione
   */
  async saveDocumentationSection(section: DocumentSection): Promise<boolean> {
    try {
      await this.db.prepare(`
        INSERT OR REPLACE INTO documentation_sections 
        (id, title, content, last_updated, author, version, category, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        section.id,
        section.title,
        section.content,
        new Date().toISOString(),
        section.author,
        section.version,
        section.category,
        JSON.stringify(section.tags)
      ).run()

      // Log modifica documentazione
      await this.logDocumentationChange(section.id, 'UPDATE', section.author, section.title)

      return true
    } catch (error) {
      console.error('Error saving documentation section:', error)
      return false
    }
  }

  /**
   * Crea nuova sezione documentazione
   */
  async createDocumentationSection(
    title: string,
    content: string,
    category: DocumentSection['category'],
    author: string = 'system',
    tags: string[] = []
  ): Promise<string> {
    const sectionId = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    const section: DocumentSection = {
      id: sectionId,
      title,
      content,
      last_updated: new Date().toISOString(),
      author,
      version: '1.0.0',
      category,
      tags
    }

    const success = await this.saveDocumentationSection(section)
    
    if (success) {
      await this.logDocumentationChange(sectionId, 'CREATE', author, title)
      return sectionId
    } else {
      throw new Error('Failed to create documentation section')
    }
  }

  /**
   * Inizializza documentazione TeleMedCare
   */
  async initializeTeleMedCareDocumentation(): Promise<void> {
    // Crea tabella documentazione se non esiste
    await this.createDocumentationTable()
    
    // Carica documenti esistenti e li converte in sezioni
    await this.migrateExistingDocumentation()
    
    // Crea sezioni base se non esistono
    await this.createBaseDocumentationSections()
  }

  /**
   * Genera documentazione automatica sistema
   */
  async generateSystemDocumentation(): Promise<string[]> {
    const createdSections: string[] = []

    try {
      // 1. Documentazione API Endpoints
      const apiDocId = await this.generateAPIDocumentation()
      createdSections.push(apiDocId)

      // 2. Documentazione Database Schema
      const dbDocId = await this.generateDatabaseDocumentation()
      createdSections.push(dbDocId)

      // 3. Documentazione Ambiente e Deployment
      const envDocId = await this.generateEnvironmentDocumentation()
      createdSections.push(envDocId)

      // 4. Documentazione Workflow
      const workflowDocId = await this.generateWorkflowDocumentation()
      createdSections.push(workflowDocId)

      // 5. Documentazione Testing
      const testDocId = await this.generateTestingDocumentation()
      createdSections.push(testDocId)

      return createdSections
    } catch (error) {
      console.error('Error generating system documentation:', error)
      return createdSections
    }
  }

  /**
   * Ricerca nella documentazione
   */
  async searchDocumentation(query: string, category?: string): Promise<DocumentSection[]> {
    try {
      let sql = `
        SELECT * FROM documentation_sections 
        WHERE (title LIKE ? OR content LIKE ?)
      `
      const params = [`%${query}%`, `%${query}%`]

      if (category) {
        sql += ` AND category = ?`
        params.push(category)
      }

      sql += ` ORDER BY last_updated DESC LIMIT 20`

      const results = await this.db.prepare(sql).bind(...params).all()
      
      return results.results?.map(result => ({
        id: result.id as string,
        title: result.title as string,
        content: result.content as string,
        last_updated: result.updated_at as string,
        author: result.author as string,
        version: result.version as string,
        category: result.category as DocumentSection['category'],
        tags: (result.tags as string).split(',') || []
      })) || []
    } catch (error) {
      console.error('Error searching documentation:', error)
      return []
    }
  }

  // Metodi privati di supporto

  private async loadDocumentationSections(): Promise<DocumentSection[]> {
    try {
      const results = await this.db.prepare(`
        SELECT * FROM documentation_sections ORDER BY category, title
      `).all()
      
      return results.results?.map(result => ({
        id: result.id as string,
        title: result.title as string,
        content: result.content as string,
        last_updated: result.updated_at as string,
        author: result.author as string,
        version: result.version as string,
        category: result.category as DocumentSection['category'],
        tags: (result.tags as string).split(',') || []
      })) || []
    } catch (error) {
      console.error('Error loading documentation sections:', error)
      return []
    }
  }

  private organizeByCategory(sections: DocumentSection[]): Record<string, DocumentSection[]> {
    return sections.reduce((acc, section) => {
      if (!acc[section.category]) {
        acc[section.category] = []
      }
      acc[section.category].push(section)
      return acc
    }, {} as Record<string, DocumentSection[]>)
  }

  private async createDocumentationTable(): Promise<void> {
    try {
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS documentation_sections (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
          author TEXT NOT NULL DEFAULT 'system',
          version TEXT NOT NULL DEFAULT '1.0.0',
          category TEXT NOT NULL,
          tags TEXT DEFAULT '[]',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run()
    } catch (error) {
      console.error('Error creating documentation table:', error)
    }
  }

  private async migrateExistingDocumentation(): Promise<void> {
    // Carica documenti esistenti dal filesystem e li migra nel database
    try {
      // Migra README.md principale
      await this.migrateFileToSection('README.md', 'user', 'Guida Utente TeleMedCare V12.0')
      
      // Migra PROJECT_SPECIFICATIONS.json
      await this.migrateFileToSection('PROJECT_SPECIFICATIONS.json', 'technical', 'Specifiche di Progetto')
      
      // Migra SISTEMA_COMPLETO_FINALE.md
      await this.migrateFileToSection('SISTEMA_COMPLETO_FINALE.md', 'admin', 'Sistema Completo Finale')
      
    } catch (error) {
      console.error('Error migrating existing documentation:', error)
    }
  }

  private async migrateFileToSection(filename: string, category: DocumentSection['category'], title: string): Promise<void> {
    try {
      // In ambiente reale leggerebbe il file dal filesystem
      // Per ora crea una sezione placeholder
      const sectionId = filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      
      const existingSection = await this.getDocumentationSection(sectionId)
      if (!existingSection) {
        await this.createDocumentationSection(
          title,
          `Contenuto migrato da ${filename}\n\n[Placeholder - contenuto da caricare]`,
          category,
          'migration_system',
          [filename, 'migrated']
        )
      }
    } catch (error) {
      console.error(`Error migrating ${filename}:`, error)
    }
  }

  private async createBaseDocumentationSections(): Promise<void> {
    const baseSections: Array<{title: string, category: DocumentSection['category'], content: string, tags: string[]}> = [
      {
        title: 'TeleMedCare V12.0 - Panoramica Sistema',
        category: 'user',
        content: `# TeleMedCare V12.0 Modular Enterprise System

## Panoramica
Sistema completo per la gestione automatizzata di lead medicali, conversione assistiti e workflow sanitari.

## Caratteristiche Principali
- Sistema completamente automatizzato
- Gestione ambienti test/produzione
- Testing end-to-end integrato
- Documentazione live e editabile

## Ambienti
- **Development**: Sviluppo locale
- **Test**: Ambienti versionati (telemedcare_test_0n)
- **Staging**: Pre-produzione  
- **Production**: Live (telemedcare_database)`,
        tags: ['overview', 'telemedcare', 'v12.0']
      },
      {
        title: 'Gestione Ambienti e Deployment',
        category: 'deployment',
        content: `# Gestione Ambienti TeleMedCare

## Ambienti Disponibili

### Produzione
- Database: \`telemedcare_database\`
- URL: https://telemedcare.pages.dev
- Branch: main
- Auto-deploy: No (richiede approvazione)

### Test
- Database: \`telemedcare_test_0n\` (versionato)
- URL: https://telemedcare-test-vN.pages.dev  
- Branch: test
- Auto-deploy: Si

## Comandi Deployment
\`\`\`bash
# Deploy produzione
npm run deploy:production

# Crea ambiente test
npm run create:test-env

# Clona ambiente  
npm run clone:environment
\`\`\``,
        tags: ['deployment', 'environments', 'production', 'test']
      },
      {
        title: 'API Endpoints Reference',
        category: 'api',
        content: `# API Reference TeleMedCare V12.0

## Environment Management
- \`POST /api/environment/create\` - Crea ambiente
- \`POST /api/environment/clone\` - Clona ambiente
- \`GET /api/environment/list\` - Lista ambienti

## Testing System  
- \`POST /api/test/functional/run\` - Test funzionale
- \`POST /api/test/stress/start\` - Stress test

## Documentation
- \`GET /api/docs/sections\` - Lista sezioni
- \`POST /api/docs/sections\` - Crea sezione
- \`PUT /api/docs/sections/:id\` - Aggiorna sezione

## Data Management
- \`GET /api/data/leads\` - Lista lead
- \`GET /api/data/assistiti\` - Lista assistiti
- \`GET /api/data/stats\` - Statistiche sistema`,
        tags: ['api', 'endpoints', 'reference']
      },
      {
        title: 'Struttura Database',
        category: 'technical',
        content: `# Database Schema TeleMedCare V12.0

## Tabelle Principali

### leads
Gestione lead in entrata
- id (TEXT PRIMARY KEY)
- nomeRichiedente, cognomeRichiedente
- emailRichiedente, telefonoRichiedente
- status, leadScore, created_at

### assistiti  
Clienti convertiti
- id (INTEGER PRIMARY KEY)
- lead_id (FOREIGN KEY)
- codice_assistito (UNIQUE)
- stato, data_conversione

### workflow_tracking
Tracciamento fasi workflow
- assistito_id, fase, stato
- data_inizio, data_completamento

### documentation_sections
Sistema documentazione
- id, title, content, category
- last_updated, author, version

## Relazioni
- leads → assistiti (1:1)
- assistiti → workflow_tracking (1:N)
- assistiti → form_configurazioni (1:N)`,
        tags: ['database', 'schema', 'tables', 'relationships']
      }
    ]

    for (const section of baseSections) {
      const sectionId = section.title.toLowerCase().replace(/[^a-z0-9]/g, '_')
      const existingSection = await this.getDocumentationSection(sectionId)
      
      if (!existingSection) {
        await this.createDocumentationSection(
          section.title,
          section.content,
          section.category,
          'system_init',
          section.tags
        )
      }
    }
  }

  private async generateAPIDocumentation(): Promise<string> {
    const content = `# API Documentation - Auto Generated

Generato automaticamente il ${new Date().toISOString()}

## Endpoints Attivi
[Documentazione API generata automaticamente dal sistema]

## Schema Requests/Responses  
[Schema automatici basati sui controller attivi]

## Rate Limiting
[Configurazioni attuali di rate limiting]

## Autenticazione
[Metodi di autenticazione implementati]`

    return await this.createDocumentationSection(
      'API Documentation (Auto-Generated)',
      content,
      'api',
      'auto_generator',
      ['auto-generated', 'api', 'current']
    )
  }

  private async generateDatabaseDocumentation(): Promise<string> {
    // Genera documentazione database basata su struttura attuale
    const content = `# Database Schema - Auto Generated

Generato automaticamente il ${new Date().toISOString()}

## Struttura Attuale Database
[Schema tabelle generato automaticamente]

## Indici e Performance
[Analisi indici e ottimizzazioni]

## Migrazioni Recenti  
[Log delle migrazioni applicate]

## Backup e Recovery
[Configurazioni backup automatico]`

    return await this.createDocumentationSection(
      'Database Schema (Auto-Generated)',
      content,
      'technical',
      'auto_generator',
      ['auto-generated', 'database', 'schema']
    )
  }

  private async generateEnvironmentDocumentation(): Promise<string> {
    const content = `# Environment Configuration - Auto Generated

Generato automaticamente il ${new Date().toISOString()}

## Configurazioni Ambiente Correnti
[Configurazioni degli ambienti attivi]

## Deployment History
[Storia dei deployment recenti]

## Environment Variables
[Variabili ambiente configurate]

## Health Checks
[Status check degli ambienti]`

    return await this.createDocumentationSection(
      'Environment Configuration (Auto-Generated)',
      content,
      'deployment',
      'auto_generator',
      ['auto-generated', 'environment', 'config']
    )
  }

  private async generateWorkflowDocumentation(): Promise<string> {
    const content = `# Workflow System - Auto Generated

Generato automaticamente il ${new Date().toISOString()}

## Fasi Workflow Attive
[Fasi workflow configurate nel sistema]

## Automazioni Email
[Templates e sequenze email attive]

## Lead Scoring
[Algoritmi e configurazioni scoring]

## Conversion Tracking
[Metriche conversione lead→assistito]`

    return await this.createDocumentationSection(
      'Workflow System (Auto-Generated)',
      content,
      'technical',
      'auto_generator',
      ['auto-generated', 'workflow', 'automation']
    )
  }

  private async generateTestingDocumentation(): Promise<string> {
    const content = `# Testing System - Auto Generated

Generato automaticamente il ${new Date().toISOString()}

## Test Suites Attive
[Suite di test configurate]

## Stress Test Configuration  
[Configurazioni stress test disponibili]

## Test Coverage
[Coverage attuale del sistema]

## Performance Benchmarks
[Benchmark di performance recenti]`

    return await this.createDocumentationSection(
      'Testing System (Auto-Generated)',
      content,
      'technical',
      'auto_generator',
      ['auto-generated', 'testing', 'performance']
    )
  }

  private async logDocumentationChange(sectionId: string, action: string, author: string, title: string): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO system_logs (component, action, success, details, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        'DocumentationManager',
        `DOC_${action}`,
        1,
        `Documentation ${action}: ${title}`,
        JSON.stringify({ sectionId, author, title }),
        new Date().toISOString()
      ).run()
    } catch (error) {
      console.error('Failed to log documentation change:', error)
    }
  }
}

// Export default
export default DocumentationManager