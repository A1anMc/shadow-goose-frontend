#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files with incorrect import paths
const filesToFix = [
  'pages/grants/applications/[id].tsx',
  'pages/grants/applications/dashboard.tsx',
  'pages/grants/applications/new.tsx',
  'pages/sge/applications/success-analysis.tsx',
  'src/components/AdvancedAnalyticsDashboard.tsx',
  'src/components/AIGrantWriter.tsx',
  'src/components/ExportPanel.tsx',
  'src/components/LiveDataStatus.tsx',
  'src/components/MonitoringDashboard.tsx',
  'src/lib/monitoring/health-monitor.ts',
  'src/lib/monitoring/init-monitoring.ts',
  'src/lib/monitoring/performance-middleware.ts',
  'src/lib/services/grants-bulletproof.service.ts',
  'src/lib/services/sge-grant-discovery.ts',
  'src/lib/services/sge-grants-service.ts',
  'src/lib/services/sge-ml-service.ts',
  'src/lib/services/sge-success-prediction.ts'
];

function getCorrectImportPath(filePath) {
  if (filePath.startsWith('pages/grants/applications/') || filePath.startsWith('pages/sge/applications/')) {
    return "import { logger } from '../../../src/lib/logger';";
  } else if (filePath.startsWith('pages/')) {
    return "import { logger } from '../../src/lib/logger';";
  } else if (filePath.startsWith('src/components/')) {
    return "import { logger } from '../lib/logger';";
  } else if (filePath.startsWith('src/lib/monitoring/')) {
    return "import { logger } from '../logger';";
  } else if (filePath.startsWith('src/lib/services/')) {
    return "import { logger } from '../logger';";
  } else if (filePath.startsWith('src/lib/')) {
    return "import { logger } from './logger';";
  }
  return "import { logger } from '../src/lib/logger';";
}

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  console.log(`Fixing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace incorrect import paths
  const incorrectPatterns = [
    /import \{ logger \} from '\.\.\/src\/lib\/logger';/g,
    /import \{ logger \} from '\.\.\/\.\.\/src\/lib\/logger';/g,
    /import \{ logger \} from '\.\/logger';/g
  ];
  
  const correctImport = getCorrectImportPath(filePath);
  let modified = false;
  
  for (const pattern of incorrectPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, correctImport);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔧 Fixing Logger Import Paths');
  console.log('==============================\n');
  
  let totalFixed = 0;
  
  for (const file of filesToFix) {
    if (fixFile(file)) {
      totalFixed++;
    }
  }
  
  console.log(`\n📊 Summary: ${totalFixed} files fixed`);
  
  if (totalFixed > 0) {
    console.log('\n✅ Import path fixes completed!');
    console.log('💡 Next steps:');
    console.log('   1. Run: npm run typecheck');
    console.log('   2. Run: npm run build');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFile };
