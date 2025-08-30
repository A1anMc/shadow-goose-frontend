#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING CORS ISSUES ACROSS ALL API ROUTES...\n');

// Common imports for API routes
const commonImports = `import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../src/lib/logger';
import { withCORS } from '../../src/lib/cors';`;

const commonImportsNested = `import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../../src/lib/logger';
import { withCORS } from '../../../src/lib/cors';`;

// API routes that need CORS fixes
const apiRoutes = [
  {
    path: 'pages/api/health.ts',
    imports: commonImports,
    needsSecurityHeaders: true
  },
  {
    path: 'pages/api/status.ts',
    imports: commonImports,
    needsSecurityHeaders: true
  },
  {
    path: 'pages/api/analytics/google.ts',
    imports: commonImportsNested,
    needsSecurityHeaders: false
  },
  {
    path: 'pages/api/analytics/instant.ts',
    imports: commonImportsNested,
    needsSecurityHeaders: false
  },
  {
    path: 'pages/api/impact/impact-measurements.ts',
    imports: commonImportsNested,
    needsSecurityHeaders: false
  },
  {
    path: 'pages/api/impact/impact-stories.ts',
    imports: commonImportsNested,
    needsSecurityHeaders: false
  },
  {
    path: 'pages/api/impact/project-mappings.ts',
    imports: commonImportsNested,
    needsSecurityHeaders: false
  },
  {
    path: 'pages/api/impact/sdg-mappings.ts',
    imports: commonImportsNested,
    needsSecurityHeaders: false
  }
];

function fixCorsForRoute(routeConfig) {
  const { path: filePath, imports, needsSecurityHeaders } = routeConfig;
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  console.log(`🔧 Fixing CORS for: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has CORS
  if (content.includes('withCORS')) {
    console.log(`✅ Already has CORS: ${filePath}`);
    return;
  }

  // Extract the existing handler function
  const handlerMatch = content.match(/export default async function handler\([^)]*\)\s*{([\s\S]*?)}/);
  if (!handlerMatch) {
    console.log(`⚠️  Could not find handler function in ${filePath}`);
    return;
  }

  const handlerBody = handlerMatch[1];
  const routeName = filePath.replace('pages/api/', '').replace('.ts', '').replace(/\//g, '_').replace(/-/g, '_');
  
  // Add security headers if needed
  let enhancedHandlerBody = handlerBody;
  if (needsSecurityHeaders) {
    const securityHeaders = `
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');`;
    
    // Insert security headers after method check
    enhancedHandlerBody = handlerBody.replace(
      /(if \(req\.method !== 'GET'\) \{[\s\S]*?return res\.status\(405\)\.json\([^)]*\);\s*\})/,
      `$1${securityHeaders}`
    );
  }

  // Create new content with CORS wrapper
  const newContent = `${imports}

async function ${routeName}Handler(req: NextApiRequest, res: NextApiResponse) {${enhancedHandlerBody}
}

export default withCORS(${routeName}Handler);`;

  // Write the fixed content
  fs.writeFileSync(filePath, newContent);
  console.log(`✅ Fixed CORS for: ${filePath}`);
}

// Fix CORS for all API routes
apiRoutes.forEach(fixCorsForRoute);

console.log('\n🎉 CORS fixes completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run typecheck');
console.log('2. Run: node scripts/endpoint-health-checker.js');
console.log('3. Test API endpoints');
console.log('4. Verify CORS is working in production');
