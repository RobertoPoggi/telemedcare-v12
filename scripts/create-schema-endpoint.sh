#!/bin/bash
# Script per creare un endpoint temporaneo che espone lo schema del DB
echo "Creando endpoint /api/debug-schema..."

cat > /tmp/schema-endpoint.txt << 'EOF'
// Aggiungi questo endpoint TEMPORANEO a src/index.tsx
// DOPO il login, per sicurezza

app.get('/api/debug-schema', async (c) => {
  const db = c.env.DB;
  if (!db) {
    return c.json({ error: 'Database non configurato' }, 500);
  }

  try {
    // Lista tabelle
    const tables = await db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `).all();

    const schemas = {};

    // Per ogni tabella, ottieni lo schema
    for (const table of tables.results) {
      const tableName = table.name;
      const schema = await db.prepare(`PRAGMA table_info(${tableName})`).all();
      schemas[tableName] = schema.results;
    }

    // Esempio di dati reali da proforma
    const sampleProforma = await db.prepare(`
      SELECT * FROM proforma LIMIT 1
    `).first();

    return c.json({
      success: true,
      tables: tables.results.map(t => t.name),
      schemas,
      samples: {
        proforma: sampleProforma
      }
    });

  } catch (error) {
    return c.json({ 
      error: 'Errore interrogazione schema',
      details: error.message 
    }, 500);
  }
});
EOF

cat /tmp/schema-endpoint.txt
