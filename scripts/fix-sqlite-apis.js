#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'pages/api/impact/impact-stories.ts',
  'pages/api/impact/project-mappings.ts',
  'pages/api/impact/sdg-mappings.ts'
];

// Fix patterns
const fixes = [
  // Replace PostgreSQL parameter placeholders
  { from: /\$(\d+)/g, to: '?' },
  // Replace pool.query with db.prepare
  { from: /const result = await pool\.query\(query, params\);/g, to: 'const stmt = db.prepare(query);\n      const result = stmt.all(params);' },
  { from: /const result = await pool\.query\(query, \[([^\]]+)\]\);/g, to: 'const stmt = db.prepare(query);\n      const result = stmt.all([$1]);' },
  // Replace result.rows with result
  { from: /result\.rows/g, to: 'result' },
  // Replace NOW() with CURRENT_TIMESTAMP
  { from: /NOW\(\)/g, to: 'CURRENT_TIMESTAMP' }
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    fixes.forEach(fix => {
      content = content.replace(fix.from, fix.to);
    });
    
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed ${file}`);
  }
});

console.log('🎉 All API files updated for SQLite!');

