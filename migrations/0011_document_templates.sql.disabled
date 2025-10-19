-- =============================================
-- TELEMEDCARE - DOCUMENT TEMPLATES SYSTEM
-- =============================================
-- Migration 0011: Create document_templates table for storing email and form templates
-- Data: 2025-10-18
-- =============================================

-- =====================================
-- TABELLA DOCUMENT_TEMPLATES
-- =====================================
CREATE TABLE IF NOT EXISTS document_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- EMAIL, FORM, CONTRACT, PROFORMA, BROCHURE
    description TEXT,
    version TEXT NOT NULL DEFAULT '1.0',
    
    -- Template content
    html_content TEXT NOT NULL,
    css_styles TEXT,
    variables TEXT, -- JSON array of available placeholders
    
    -- Configuration
    subject TEXT, -- For email templates
    from_name TEXT, -- For email templates
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    last_used DATETIME,
    
    -- Metadata
    author TEXT DEFAULT 'system',
    notes TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_category ON document_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_active ON document_templates(active);
CREATE INDEX IF NOT EXISTS idx_templates_name ON document_templates(name);

-- Trigger for updated_at
CREATE TRIGGER IF NOT EXISTS templates_updated_at 
    AFTER UPDATE ON document_templates 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE document_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
