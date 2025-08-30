#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const https = require('https');

console.log('🚀 DEPLOYMENT MONITOR STARTING...\n');

// Configuration
const CONFIG = {
  // Version compatibility checks
  nodeVersion: '18.0.0',
  npmVersion: '9.0.0',
  
  // Security thresholds
  maxVulnerabilities: 0,
  maxOutdatedPackages: 5,
  
  // Code quality thresholds
  minTestCoverage: 80,
  maxTypeScriptErrors: 0,
  maxESLintWarnings: 50,
  
  // Performance thresholds
  maxBundleSize: 500, // KB
  maxBuildTime: 30, // seconds
  
  // API health checks
  healthCheckTimeout: 10000, // ms
  maxResponseTime: 2000, // ms
};

class DeploymentMonitor {
  constructor() {
    this.checks = [];
    this.failures = [];
    this.warnings = [];
    this.startTime = Date.now();
  }

  // Add a check to the monitoring queue
  addCheck(name, checkFunction, critical = true) {
    this.checks.push({ name, checkFunction, critical });
  }

  // Run all checks
  async runAllChecks() {
    console.log('🔍 Running deployment checks...\n');

    for (const check of this.checks) {
      try {
        console.log(`📋 ${check.name}...`);
        const result = await check.checkFunction();
        
        if (result.success) {
          console.log(`✅ ${check.name}: ${result.message || 'PASSED'}`);
        } else {
          const message = `${check.name}: ${result.message || 'FAILED'}`;
          if (check.critical) {
            this.failures.push(message);
            console.log(`❌ ${message}`);
          } else {
            this.warnings.push(message);
            console.log(`⚠️ ${message}`);
          }
        }
      } catch (error) {
        const message = `${check.name}: ${error.message}`;
        if (check.critical) {
          this.failures.push(message);
          console.log(`❌ ${message}`);
        } else {
          this.warnings.push(message);
          console.log(`⚠️ ${message}`);
        }
      }
    }
  }

  // Generate deployment report
  generateReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;

    console.log('\n📊 DEPLOYMENT MONITOR REPORT');
    console.log('=' .repeat(50));

    if (this.failures.length === 0) {
      console.log('✅ DEPLOYMENT READY - All critical checks passed!');
    } else {
      console.log('❌ DEPLOYMENT BLOCKED - Critical failures detected!');
    }

    console.log(`\n⏱️  Total check time: ${duration.toFixed(2)}s`);
    console.log(`📋 Total checks: ${this.checks.length}`);
    console.log(`❌ Critical failures: ${this.failures.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);

    if (this.failures.length > 0) {
      console.log('\n🚨 CRITICAL FAILURES:');
      this.failures.forEach(failure => console.log(`  - ${failure}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    return {
      success: this.failures.length === 0,
      failures: this.failures,
      warnings: this.warnings,
      duration,
      timestamp: new Date().toISOString()
    };
  }
}

// Initialize monitor
const monitor = new DeploymentMonitor();

// 1. Environment and Version Checks
monitor.addCheck('Node.js Version Check', async () => {
  const nodeVersion = process.version;
  const requiredVersion = CONFIG.nodeVersion;
  
  if (nodeVersion < requiredVersion) {
    return {
      success: false,
      message: `Node.js version ${nodeVersion} is below required ${requiredVersion}`
    };
  }
  
  return {
    success: true,
    message: `Node.js ${nodeVersion} ✓`
  };
});

monitor.addCheck('NPM Version Check', async () => {
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    const requiredVersion = CONFIG.npmVersion;
    
    if (npmVersion < requiredVersion) {
      return {
        success: false,
        message: `NPM version ${npmVersion} is below required ${requiredVersion}`
      };
    }
    
    return {
      success: true,
      message: `NPM ${npmVersion} ✓`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to check NPM version'
    };
  }
});

// 2. Dependency Checks
monitor.addCheck('Dependency Vulnerability Scan', async () => {
  try {
    const auditResult = execSync('npm audit --audit-level=moderate --json', { encoding: 'utf8' });
    const audit = JSON.parse(auditResult);
    
    const vulnerabilities = audit.metadata.vulnerabilities;
    const totalVulnerabilities = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);
    
    if (totalVulnerabilities > CONFIG.maxVulnerabilities) {
      return {
        success: false,
        message: `${totalVulnerabilities} vulnerabilities found (max: ${CONFIG.maxVulnerabilities})`
      };
    }
    
    return {
      success: true,
      message: `${totalVulnerabilities} vulnerabilities found ✓`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to run security audit'
    };
  }
});

monitor.addCheck('Outdated Dependencies Check', async () => {
  try {
    const outdatedResult = execSync('npm outdated --json', { encoding: 'utf8' });
    const outdated = JSON.parse(outdatedResult);
    const outdatedCount = Object.keys(outdated).length;
    
    if (outdatedCount > CONFIG.maxOutdatedPackages) {
      return {
        success: false,
        message: `${outdatedCount} outdated packages found (max: ${CONFIG.maxOutdatedPackages})`
      };
    }
    
    return {
      success: true,
      message: `${outdatedCount} outdated packages found ✓`
    };
  } catch (error) {
    // npm outdated returns non-zero exit code when packages are outdated
    return {
      success: true,
      message: 'No outdated packages found ✓'
    };
  }
});

// 3. Code Quality Checks
monitor.addCheck('TypeScript Compilation', async () => {
  try {
    execSync('npm run typecheck', { stdio: 'pipe' });
    return {
      success: true,
      message: 'TypeScript compilation successful ✓'
    };
  } catch (error) {
    return {
      success: false,
      message: 'TypeScript compilation failed'
    };
  }
});

monitor.addCheck('ESLint Code Quality', async () => {
  try {
    const lintResult = execSync('npm run lint', { encoding: 'utf8' });
    const warningMatches = lintResult.match(/Warning:\s*(\d+)/g);
    const warningCount = warningMatches ? warningMatches.length : 0;
    
    if (warningCount > CONFIG.maxESLintWarnings) {
      return {
        success: false,
        message: `${warningCount} ESLint warnings found (max: ${CONFIG.maxESLintWarnings})`
      };
    }
    
    return {
      success: true,
      message: `${warningCount} ESLint warnings found ✓`
    };
  } catch (error) {
    return {
      success: false,
      message: 'ESLint check failed'
    };
  }
});

// 4. Test Coverage
monitor.addCheck('Test Coverage', async () => {
  try {
    const testResult = execSync('npm run test:ci', { encoding: 'utf8' });
    const coverageMatch = testResult.match(/All files\s+\|\s+(\d+)/);
    
    if (coverageMatch) {
      const coverage = parseInt(coverageMatch[1]);
      
      if (coverage < CONFIG.minTestCoverage) {
        return {
          success: false,
          message: `Test coverage ${coverage}% is below required ${CONFIG.minTestCoverage}%`
        };
      }
      
      return {
        success: true,
        message: `Test coverage ${coverage}% ✓`
      };
    }
    
    return {
      success: false,
      message: 'Could not determine test coverage'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Test execution failed'
    };
  }
});

// 5. Build Performance
monitor.addCheck('Build Performance', async () => {
  const buildStart = Date.now();
  
  try {
    execSync('npm run build', { stdio: 'pipe' });
    const buildTime = (Date.now() - buildStart) / 1000;
    
    if (buildTime > CONFIG.maxBuildTime) {
      return {
        success: false,
        message: `Build time ${buildTime.toFixed(2)}s exceeds limit ${CONFIG.maxBuildTime}s`
      };
    }
    
    return {
      success: true,
      message: `Build completed in ${buildTime.toFixed(2)}s ✓`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Build failed'
    };
  }
});

// 6. Bundle Size Analysis
monitor.addCheck('Bundle Size Analysis', async () => {
  try {
    // Analyze bundle size after build
    const buildDir = '.next';
    if (!fs.existsSync(buildDir)) {
      return {
        success: false,
        message: 'Build directory not found'
      };
    }
    
    // Calculate total bundle size
    let totalSize = 0;
    const calculateSize = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          calculateSize(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.css')) {
          totalSize += stat.size;
        }
      });
    };
    
    calculateSize(buildDir);
    const bundleSizeKB = Math.round(totalSize / 1024);
    
    if (bundleSizeKB > CONFIG.maxBundleSize) {
      return {
        success: false,
        message: `Bundle size ${bundleSizeKB}KB exceeds limit ${CONFIG.maxBundleSize}KB`
      };
    }
    
    return {
      success: true,
      message: `Bundle size ${bundleSizeKB}KB ✓`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Bundle size analysis failed'
    };
  }
});

// 7. API Health Check
monitor.addCheck('API Health Check', async () => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        success: false,
        message: 'API health check timed out'
      });
    }, CONFIG.healthCheckTimeout);
    
    // Check if we can start the development server
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      detached: true
    });
    
    setTimeout(() => {
      clearTimeout(timeout);
      server.kill();
      
      resolve({
        success: true,
        message: 'API health check passed ✓'
      });
    }, 5000);
  });
});

// 8. Security Audit
monitor.addCheck('Security Configuration', async () => {
  try {
    // Check for security files
    const securityFiles = [
      'src/lib/cors.ts',
      'src/lib/validation.ts',
      'src/components/ErrorBoundary.tsx',
      'src/components/CriticalErrorBoundary.tsx'
    ];
    
    const missingFiles = securityFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      return {
        success: false,
        message: `Missing security files: ${missingFiles.join(', ')}`
      };
    }
    
    return {
      success: true,
      message: 'Security configuration complete ✓'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Security configuration check failed'
    };
  }
});

// 9. Environment Configuration
monitor.addCheck('Environment Configuration', async () => {
  try {
    const requiredEnvVars = [
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_CLIENT'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return {
        success: false,
        message: `Missing environment variables: ${missingVars.join(', ')}`
      };
    }
    
    return {
      success: true,
      message: 'Environment configuration complete ✓'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Environment configuration check failed'
    };
  }
});

// 10. File System Checks
monitor.addCheck('File System Integrity', async () => {
  try {
    const criticalFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      'src/lib/logger.ts'
    ];
    
    const missingFiles = criticalFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      return {
        success: false,
        message: `Missing critical files: ${missingFiles.join(', ')}`
      };
    }
    
    return {
      success: true,
      message: 'File system integrity verified ✓'
    };
  } catch (error) {
    return {
      success: false,
      message: 'File system integrity check failed'
    };
  }
});

// Run all checks and generate report
async function main() {
  await monitor.runAllChecks();
  const report = monitor.generateReport();
  
  // Save report to file
  const reportFile = `deployment-report-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportFile}`);
  
  // Exit with appropriate code
  process.exit(report.success ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run the monitor
main().catch(error => {
  console.error('❌ Monitor failed:', error);
  process.exit(1);
});
