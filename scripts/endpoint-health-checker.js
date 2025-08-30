#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 ENDPOINT HEALTH CHECKER STARTING...\n');

class EndpointHealthChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.apiRoutes = [];
    this.startTime = Date.now();
  }

  // Scan for API routes
  scanApiRoutes() {
    const apiDir = 'pages/api';
    if (!fs.existsSync(apiDir)) {
      this.issues.push('API directory not found');
      return;
    }

    const scanDirectory = (dir, basePath = '') => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDirectory(filePath, path.join(basePath, file));
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
          const routePath = path.join(basePath, file.replace(/\.(ts|js)$/, ''));
          this.apiRoutes.push({
            path: routePath,
            fullPath: filePath,
            content: fs.readFileSync(filePath, 'utf8')
          });
        }
      });
    };

    scanDirectory(apiDir);
    console.log(`📋 Found ${this.apiRoutes.length} API routes`);
  }

  // Check for common endpoint issues
  checkEndpointIssues() {
    console.log('\n🔍 Checking for endpoint issues...\n');

    this.apiRoutes.forEach(route => {
      const { path: routePath, fullPath, content } = route;
      
      // Check for missing exports
      if (!content.includes('export default') && !content.includes('module.exports')) {
        this.issues.push(`Missing default export in ${routePath}`);
      }

      // Check for proper Next.js API handler signature
      if (!content.includes('NextApiRequest') || !content.includes('NextApiResponse')) {
        this.warnings.push(`Missing proper Next.js API types in ${routePath}`);
      }

      // Check for error handling
      if (!content.includes('try') || !content.includes('catch')) {
        this.warnings.push(`Missing error handling in ${routePath}`);
      }

      // Check for CORS handling
      if (!content.includes('cors') && !content.includes('CORS')) {
        this.warnings.push(`Missing CORS handling in ${routePath}`);
      }

      // Check for input validation
      if (!content.includes('validation') && !content.includes('validate')) {
        this.warnings.push(`Missing input validation in ${routePath}`);
      }

      // Check for logging
      if (!content.includes('logger') && !content.includes('console.log')) {
        this.warnings.push(`Missing logging in ${routePath}`);
      }

      // Check for proper HTTP status codes
      if (!content.includes('res.status(')) {
        this.warnings.push(`Missing explicit status codes in ${routePath}`);
      }

      // Check for security headers
      if (!content.includes('setHeader') && !content.includes('headers')) {
        this.warnings.push(`Missing security headers in ${routePath}`);
      }
    });
  }

  // Check for specific error patterns
  checkErrorPatterns() {
    console.log('🔍 Checking for error patterns...\n');

    this.apiRoutes.forEach(route => {
      const { path: routePath, content } = route;
      
      // Check for hardcoded secrets
      const secretPatterns = [
        /api_key\s*[:=]\s*['"][^'"]+['"]/gi,
        /password\s*[:=]\s*['"][^'"]+['"]/gi,
        /secret\s*[:=]\s*['"][^'"]+['"]/gi,
        /token\s*[:=]\s*['"][^'"]+['"]/gi
      ];

      secretPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          this.issues.push(`Potential hardcoded secret in ${routePath}`);
        }
      });

      // Check for SQL injection vulnerabilities
      if (content.includes('query(') && !content.includes('parameterized')) {
        this.warnings.push(`Potential SQL injection risk in ${routePath}`);
      }

      // Check for XSS vulnerabilities
      if (content.includes('innerHTML') || content.includes('dangerouslySetInnerHTML')) {
        this.issues.push(`Potential XSS vulnerability in ${routePath}`);
      }

      // Check for missing authentication
      if (content.includes('req.body') && !content.includes('auth') && !content.includes('jwt')) {
        this.warnings.push(`Missing authentication check in ${routePath}`);
      }
    });
  }

  // Check for performance issues
  checkPerformanceIssues() {
    console.log('🔍 Checking for performance issues...\n');

    this.apiRoutes.forEach(route => {
      const { path: routePath, content } = route;
      
      // Check for synchronous file operations
      if (content.includes('fs.readFileSync') || content.includes('fs.writeFileSync')) {
        this.warnings.push(`Synchronous file operation in ${routePath} - consider async`);
      }

      // Check for missing caching
      if (content.includes('fetch(') && !content.includes('cache')) {
        this.warnings.push(`Missing caching for external API calls in ${routePath}`);
      }

      // Check for large data processing
      if (content.includes('.map(') && content.includes('.filter(') && content.includes('.reduce(')) {
        this.warnings.push(`Complex data processing in ${routePath} - consider optimization`);
      }
    });
  }

  // Check for TypeScript issues
  checkTypeScriptIssues() {
    console.log('🔍 Checking for TypeScript issues...\n');

    this.apiRoutes.forEach(route => {
      const { path: routePath, content } = route;
      
      // Check for any types
      if (content.includes(': any')) {
        this.warnings.push(`Usage of 'any' type in ${routePath}`);
      }

      // Check for missing type imports
      if (content.includes('NextApiRequest') && !content.includes('import.*NextApiRequest')) {
        this.warnings.push(`Missing NextApiRequest import in ${routePath}`);
      }

      // Check for proper error typing
      if (content.includes('catch') && !content.includes(': Error')) {
        this.warnings.push(`Missing error type annotation in ${routePath}`);
      }
    });
  }

  // Check for environment variable usage
  checkEnvironmentVariables() {
    console.log('🔍 Checking environment variable usage...\n');

    this.apiRoutes.forEach(route => {
      const { path: routePath, content } = route;
      
      // Check for hardcoded URLs
      const urlPatterns = [
        /https?:\/\/[^\s'"]+/g,
        /localhost:\d+/g
      ];

      urlPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          this.warnings.push(`Hardcoded URLs found in ${routePath}: ${matches.join(', ')}`);
        }
      });

      // Check for missing environment variable validation
      if (content.includes('process.env') && !content.includes('||') && !content.includes('??')) {
        this.warnings.push(`Missing environment variable fallback in ${routePath}`);
      }
    });
  }

  // Generate health report
  generateReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;

    console.log('\n📊 ENDPOINT HEALTH REPORT');
    console.log('=' .repeat(50));

    console.log(`📋 Total API routes: ${this.apiRoutes.length}`);
    console.log(`❌ Critical issues: ${this.issues.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`⏱️  Check time: ${duration.toFixed(2)}s`);

    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ All endpoints are healthy!');
    } else {
      if (this.issues.length > 0) {
        console.log('\n🚨 CRITICAL ISSUES:');
        this.issues.forEach(issue => console.log(`  - ${issue}`));
      }

      if (this.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        this.warnings.forEach(warning => console.log(`  - ${warning}`));
      }
    }

    return {
      totalRoutes: this.apiRoutes.length,
      issues: this.issues,
      warnings: this.warnings,
      duration,
      timestamp: new Date().toISOString()
    };
  }

  // Run all checks
  async runAllChecks() {
    this.scanApiRoutes();
    this.checkEndpointIssues();
    this.checkErrorPatterns();
    this.checkPerformanceIssues();
    this.checkTypeScriptIssues();
    this.checkEnvironmentVariables();
    
    const report = this.generateReport();
    
    // Save report
    const reportFile = `endpoint-health-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportFile}`);
    
    return report;
  }
}

// Run the health checker
async function main() {
  const checker = new EndpointHealthChecker();
  const report = await checker.runAllChecks();
  
  // Exit with appropriate code
  process.exit(report.issues.length > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run the checker
main().catch(error => {
  console.error('❌ Health checker failed:', error);
  process.exit(1);
});
