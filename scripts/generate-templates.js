#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const outputFile = path.join(__dirname, '..', 'src', 'modules', 'dashboard-templates.ts');

const htmlFiles = {
  'home.html': 'home',
  'dashboard.html': 'dashboard',
  'leads-dashboard.html': 'leads_dashboard',
  'data-dashboard.html': 'data_dashboard',
  'workflow-manager.html': 'workflow_manager'
};

let output = '// Auto-generated dashboard templates\n';
output += '// Generated from public/*.html files\n\n';

for (const [filename, varName] of Object.entries(htmlFiles)) {
  const filePath = path.join(publicDir, filename);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const escaped = content.replace(/`/g, '\\`').replace(/\${/g, '\\${');
    output += `export const ${varName} = \`${escaped}\`\n\n`;
    console.log(`✅ Generated ${varName} from ${filename}`);
  } else {
    console.log(`⚠️  File not found: ${filename}`);
  }
}

fs.writeFileSync(outputFile, output);
console.log(`\n✅ Templates written to ${outputFile}`);
