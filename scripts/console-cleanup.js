#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SOURCE_DIRS = [
  'src',
  'pages'
];

const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  'coverage',
  'WHITE_LABEL_UPDATED/scripts'
];

// Console replacement patterns
const CONSOLE_REPLACEMENTS = [
  {
    pattern: /console\.error\(/g,
    replacement: 'logger.error('
  },
  {
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn('
  },
  {
    pattern: /console\.log\(/g,
    replacement: 'logger.info('
  },
  {
    pattern: /console\.debug\(/g,
    replacement: 'logger.debug('
  }
];

function findFiles(dir, extensions = ['.ts', '.tsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!EXCLUDE_DIRS.some(exclude => fullPath.includes(exclude))) {
          traverse(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function getLoggerImportPath(filePath) {
  // Calculate relative path from file to src/lib/logger
  const relativePath = path.relative(path.dirname(filePath), 'src/lib/logger');
  return `import { logger } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}';`;
}

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if file already has logger import
  const hasLoggerImport = content.includes("import { logger }");
  
  // Replace console statements
  for (const replacement of CONSOLE_REPLACEMENTS) {
    if (replacement.pattern.test(content)) {
      content = content.replace(replacement.pattern, replacement.replacement);
      modified = true;
    }
  }
  
  // Add logger import if needed and console statements were found
  if (modified && !hasLoggerImport) {
    const importStatement = getLoggerImportPath(filePath);
    
    // Find the last import statement
    const importMatch = content.match(/(import.*?;[\r\n]*)+/);
    if (importMatch) {
      const lastImportIndex = content.lastIndexOf(importMatch[0]) + importMatch[0].length;
      content = content.slice(0, lastImportIndex) + '\n' + importStatement + '\n' + content.slice(lastImportIndex);
    } else {
      // No imports found, add at the beginning
      content = importStatement + '\n\n' + content;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔧 Console Statement Cleanup Script');
  console.log('=====================================\n');
  
  let totalProcessed = 0;
  let totalModified = 0;
  
  for (const sourceDir of SOURCE_DIRS) {
    if (fs.existsSync(sourceDir)) {
      console.log(`\n📁 Processing directory: ${sourceDir}`);
      const files = findFiles(sourceDir);
      
      for (const file of files) {
        totalProcessed++;
        if (processFile(file)) {
          totalModified++;
        }
      }
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`- Files processed: ${totalProcessed}`);
  console.log(`- Files modified: ${totalModified}`);
  console.log(`- Console statements replaced: ${totalModified > 0 ? 'Multiple' : 'None'}`);
  
  if (totalModified > 0) {
    console.log('\n✅ Console cleanup completed successfully!');
    console.log('💡 Next steps:');
    console.log('   1. Run: npm run typecheck');
    console.log('   2. Run: npm run build');
    console.log('   3. Test the application');
  } else {
    console.log('\nℹ️  No console statements found to replace.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, findFiles };
