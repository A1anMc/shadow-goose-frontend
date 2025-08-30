#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING API ROUTES...\n');

// Common imports and security setup
const commonImports = `import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../src/lib/logger';
import { withCORS } from '../../src/lib/cors';
import { validateUserInput } from '../../src/lib/validation';`;

const securityHeaders = `  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');`;

const errorHandling = (routePath) => `  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('API error', { 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: '${routePath}',
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }`;

// API route configurations
const apiRoutes = [
  {
    path: 'pages/api/status.ts',
    method: 'GET',
    validation: {
      method: 'GET',
      query: {},
      body: {}
    }
  },
  {
    path: 'pages/api/analytics/dashboard.ts',
    method: 'GET',
    validation: {
      method: 'GET',
      query: { client: 'string?' },
      body: {}
    }
  },
  {
    path: 'pages/api/analytics/google.ts',
    method: 'GET',
    validation: {
      method: 'GET',
      query: { client: 'string?' },
      body: {}
    }
  },
  {
    path: 'pages/api/analytics/instant.ts',
    method: 'GET',
    validation: {
      method: 'GET',
      query: { client: 'string?' },
      body: {}
    }
  },
  {
    path: 'pages/api/impact/impact-measurements.ts',
    method: 'GET',
    validation: {
      method: 'GET',
      query: { client: 'string?' },
      body: {}
    }
  },
  {
    path: 'pages/api/impact/impact-stories.ts',
    method: 'GET',
    validation: {
      method: 'GET',
      query: { client: 'string?' },
      body: {}
    }
  },
  {
    path: 'pages/api/impact/project-mappings.ts',
    method: 'GET',
    validation: {
      method: 'GET',
      query: { client: 'string?' },
      body: {}
    }
  },
  {
    path: 'pages/api/impact/sdg-mappings.ts',
    method: 'GET',
      validation: {
      method: 'GET',
      query: { client: 'string?' },
      body: {}
    }
  }
];

function fixApiRoute(routeConfig) {
  const { path: filePath, method, validation } = routeConfig;
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  console.log(`🔧 Fixing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the existing handler function
  const handlerMatch = content.match(/export default async function handler\([^)]*\)\s*{([\s\S]*?)}/);
  if (!handlerMatch) {
    console.log(`⚠️  Could not find handler function in ${filePath}`);
    return;
  }

  const handlerBody = handlerMatch[1];
  const routeName = filePath.replace('pages/api/', '').replace('.ts', '').replace(/\//g, '-');
  
  // Create new content with security improvements
  const newContent = `${commonImports}

// ${routeName} validation schema
const ${routeName}Schema = ${JSON.stringify(validation, null, 2)};

async function ${routeName}Handler(req: NextApiRequest, res: NextApiResponse) {
${securityHeaders}

  if (req.method !== '${method}') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request
    const validation = validateUserInput(${routeName}Schema, {
      method: req.method,
      query: req.query,
      body: req.body
    });

    if (!validation.success) {
      logger.warn('${routeName} validation failed', { errors: validation.errors });
      return res.status(400).json({ 
        error: 'Invalid request',
        details: validation.errors 
      });
    }

    // Original handler logic
${handlerBody.replace(/^\s*if \(req\.method !== 'GET'\) \{[\s\S]*?return res\.status\(405\)\.json\([^)]*\);\s*\}/m, '')}
${errorHandling(routeName)}
}

export default withCORS(${routeName}Handler);`;

  // Write the fixed content
  fs.writeFileSync(filePath, newContent);
  console.log(`✅ Fixed: ${filePath}`);
}

// Fix all API routes
apiRoutes.forEach(fixApiRoute);

console.log('\n🎉 API route fixes completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run typecheck');
console.log('2. Run: node scripts/endpoint-health-checker.js');
console.log('3. Test API endpoints');
