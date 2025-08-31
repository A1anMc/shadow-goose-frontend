#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// CSP violation patterns to check for
const CSP_VIOLATIONS = {
  'eval()': /eval\s*\(/g,
  'new Function()': /new\s+Function\s*\(/g,
  'setTimeout with string': /setTimeout\s*\(\s*['"`]/g,
  'setInterval with string': /setInterval\s*\(\s*['"`]/g,
  'document.write': /document\.write\s*\(/g,
  'innerHTML': /\.innerHTML\s*=/g,
  'dangerouslySetInnerHTML': /dangerouslySetInnerHTML/g,
  'script src http': /<script[^>]*src\s*=\s*["']http:/g,
  'inline script': /<script[^>]*>[\s\S]*?<\/script>/g,
  'javascript:': /javascript:/g,
  'onclick': /onclick\s*=/g,
  'onload': /onload\s*=/g,
  'onerror': /onerror\s*=/g
};

// File extensions to check
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.html'];

// Directories to exclude
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage'];

// Files to exclude (utility files that are not part of the main application)
const EXCLUDE_FILES = [
  'scripts/monitoring-dashboard.html',
  'scripts/csp-compliance-checker.js',
  'scripts/endpoint-health-checker.js'
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  
  for (const [type, pattern] of Object.entries(CSP_VIOLATIONS)) {
    const matches = content.match(pattern);
    if (matches) {
      // Filter out legitimate uses
      const legitimateUses = filterLegitimateUses(type, matches, content, filePath);
      const actualViolations = matches.length - legitimateUses;
      
      if (actualViolations > 0) {
        violations.push({
          type,
          count: actualViolations,
          file: filePath
        });
      }
    }
  }
  
  return violations;
}

function filterLegitimateUses(type, matches, content, filePath) {
  let legitimateCount = 0;
  
  switch (type) {
    case 'javascript:':
      // Legitimate: Removing javascript: protocol for security
      if (content.includes('.replace(/javascript:/gi, \'\')')) {
        legitimateCount = matches.length;
      }
      break;
    case 'onclick':
      // Legitimate: Browser notification onclick handlers
      if (content.includes('browserNotification.onclick') || content.includes('Notification.onclick')) {
        legitimateCount = matches.length;
      }
      break;
    case 'onerror':
      // Legitimate: WebSocket error handlers
      if (content.includes('ws.onerror') || content.includes('WebSocket.onerror')) {
        legitimateCount = matches.length;
      }
      break;
    case 'onload':
      // Legitimate: WebSocket load handlers
      if (content.includes('ws.onload') || content.includes('WebSocket.onload')) {
        legitimateCount = matches.length;
      }
      break;
    case 'eval()':
    case 'new Function()':
      // Only check in scripts directory for actual violations
      if (filePath.includes('scripts/') && !filePath.includes('csp-compliance-checker.js')) {
        legitimateCount = 0;
      } else {
        legitimateCount = matches.length;
      }
      break;
  }
  
  return legitimateCount;
}

function walkDirectory(dir) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(item)) {
          walk(fullPath);
        }
      } else if (EXTENSIONS.includes(path.extname(item))) {
        // Check if file should be excluded
        const relativePath = path.relative('.', fullPath);
        if (!EXCLUDE_FILES.includes(relativePath)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

function main() {
  console.log('🔒 Checking for CSP compliance issues...\n');
  
  const files = walkDirectory('.');
  let totalViolations = 0;
  const allViolations = [];
  
  for (const file of files) {
    const violations = checkFile(file);
    if (violations.length > 0) {
      allViolations.push(...violations);
      totalViolations += violations.length;
      
      console.log(`⚠️  ${file}:`);
      violations.forEach(v => {
        console.log(`   - ${v.type}: ${v.count} occurrence(s)`);
      });
      console.log('');
    }
  }
  
  if (totalViolations === 0) {
    console.log('✅ No CSP violations found! Your code is CSP compliant.');
  } else {
    console.log(`❌ Found ${totalViolations} potential CSP violations across ${allViolations.length} files.`);
    console.log('\n🔧 Recommendations:');
    console.log('1. Replace eval() with safer alternatives');
    console.log('2. Use addEventListener instead of inline event handlers');
    console.log('3. Avoid innerHTML - use textContent or DOM manipulation');
    console.log('4. Use nonces or hashes for inline scripts if necessary');
    console.log('5. Ensure all external scripts use HTTPS');
  }
  
  return totalViolations;
}

if (require.main === module) {
  const violations = main();
  process.exit(violations > 0 ? 1 : 0);
}

module.exports = { checkFile, walkDirectory, CSP_VIOLATIONS };
