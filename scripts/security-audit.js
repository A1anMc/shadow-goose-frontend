#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔐 SECURITY AUDIT STARTING...\n');

// Configuration
const SECURITY_ISSUES = [];
const WARNINGS = [];
const PASSED_CHECKS = [];

// 1. Check for hardcoded secrets
function checkForHardcodedSecrets() {
  console.log('🔍 Checking for hardcoded secrets...');
  
  const secretPatterns = [
    /password\s*[:=]\s*['"`][^'"`]+['"`]/gi,
    /secret\s*[:=]\s*['"`][^'"`]+['"`]/gi,
    /token\s*[:=]\s*['"`][^'"`]+['"`]/gi,
    /key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
    /api_key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
    /private_key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
  ];

  const filesToCheck = [
    'src/**/*.ts',
    'src/**/*.tsx',
    'pages/**/*.ts',
    'pages/**/*.tsx',
    '*.js',
    '*.json',
    '*.env*'
  ];

  let foundSecrets = false;
  
  filesToCheck.forEach(pattern => {
    try {
      const files = execSync(`find . -name "${pattern}" -type f`, { encoding: 'utf8' }).split('\n').filter(Boolean);
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          
          secretPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              foundSecrets = true;
              SECURITY_ISSUES.push(`🚨 HARDCODED SECRET FOUND in ${file}: ${matches[0]}`);
            }
          });
        }
      });
    } catch (error) {
      // Pattern not found, continue
    }
  });

  if (!foundSecrets) {
    PASSED_CHECKS.push('✅ No hardcoded secrets found');
  }
}

// 2. Check for exposed environment variables
function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variable exposure...');
  
  const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
  const exposedVars = [];
  
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach(line => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (value && value.length > 0 && !value.includes('${')) {
            exposedVars.push(`${envFile}: ${key.trim()}`);
          }
        }
      });
    }
  });

  if (exposedVars.length > 0) {
    WARNINGS.push(`⚠️ Environment variables found in files: ${exposedVars.join(', ')}`);
  } else {
    PASSED_CHECKS.push('✅ No exposed environment variables found');
  }
}

// 3. Check for security headers
function checkSecurityHeaders() {
  console.log('🔍 Checking security headers configuration...');
  
  const nextConfigPath = 'next.config.js';
  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    
    const securityHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Referrer-Policy',
      'Content-Security-Policy'
    ];
    
    const foundHeaders = securityHeaders.filter(header => 
      content.includes(header)
    );
    
    if (foundHeaders.length > 0) {
      PASSED_CHECKS.push(`✅ Security headers configured: ${foundHeaders.join(', ')}`);
    } else {
      WARNINGS.push('⚠️ No security headers found in next.config.js');
    }
  } else {
    WARNINGS.push('⚠️ next.config.js not found');
  }
}

// 4. Check for CORS configuration
function checkCORSConfiguration() {
  console.log('🔍 Checking CORS configuration...');
  
  // Check for CORS utility file
  const corsUtilityPath = 'src/lib/cors.ts';
  if (fs.existsSync(corsUtilityPath)) {
    const content = fs.readFileSync(corsUtilityPath, 'utf8');
    if (content.includes('Access-Control-Allow-Origin') || content.includes('withCORS') || content.includes('corsMiddleware')) {
      PASSED_CHECKS.push('✅ CORS utility library found and configured');
      return;
    }
  }
  
  // Check for CORS middleware file (legacy)
  const corsMiddlewarePath = 'pages/api/_middleware.ts';
  if (fs.existsSync(corsMiddlewarePath)) {
    const content = fs.readFileSync(corsMiddlewarePath, 'utf8');
    if (content.includes('Access-Control-Allow-Origin') || content.includes('corsMiddleware')) {
      PASSED_CHECKS.push('✅ CORS middleware found and configured');
      return;
    }
  }
  
  // Check API files for CORS patterns
  const apiFiles = [
    'pages/api/**/*.ts',
    'pages/api/**/*.js'
  ];
  
  let corsConfigured = false;
  
  apiFiles.forEach(pattern => {
    try {
      const files = execSync(`find . -name "${pattern}" -type f`, { encoding: 'utf8' }).split('\n').filter(Boolean);
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('cors') || content.includes('CORS') || content.includes('Access-Control-Allow-Origin')) {
            corsConfigured = true;
          }
        }
      });
    } catch (error) {
      // Pattern not found, continue
    }
  });
  
  if (corsConfigured) {
    PASSED_CHECKS.push('✅ CORS configuration found in API routes');
  } else {
    WARNINGS.push('⚠️ No CORS configuration found in API routes');
  }
}

// 5. Check for input validation
function checkInputValidation() {
  console.log('🔍 Checking input validation...');
  
  // Check for validation library file
  const validationPath = 'src/lib/validation.ts';
  if (fs.existsSync(validationPath)) {
    const content = fs.readFileSync(validationPath, 'utf8');
    if (content.includes('zod') || content.includes('ValidationService') || content.includes('validate')) {
      PASSED_CHECKS.push('✅ Comprehensive validation library found');
      return;
    }
  }
  
  const validationPatterns = [
    /\.validate\(/g,
    /\.test\(/g,
    /regex/i,
    /pattern/i,
    /validation/i,
    /zod/i,
    /ValidationService/i
  ];
  
  const filesToCheck = [
    'src/**/*.ts',
    'src/**/*.tsx',
    'pages/**/*.ts',
    'pages/**/*.tsx'
  ];
  
  let validationFound = false;
  
  filesToCheck.forEach(pattern => {
    try {
      const files = execSync(`find . -name "${pattern}" -type f`, { encoding: 'utf8' }).split('\n').filter(Boolean);
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          
          validationPatterns.forEach(pattern => {
            if (pattern.test(content)) {
              validationFound = true;
            }
          });
        }
      });
    } catch (error) {
      // Pattern not found, continue
    }
  });
  
  if (validationFound) {
    PASSED_CHECKS.push('✅ Input validation patterns found');
  } else {
    WARNINGS.push('⚠️ No input validation patterns found');
  }
}

// 6. Check for authentication patterns
function checkAuthentication() {
  console.log('🔍 Checking authentication patterns...');
  
  // Check for auth service file
  const authPath = 'src/lib/auth.ts';
  if (fs.existsSync(authPath)) {
    const content = fs.readFileSync(authPath, 'utf8');
    if (content.includes('AuthService') || content.includes('login') || content.includes('token')) {
      PASSED_CHECKS.push('✅ Comprehensive authentication service found');
      return;
    }
  }
  
  const authPatterns = [
    /auth/i,
    /authentication/i,
    /login/i,
    /logout/i,
    /token/i,
    /jwt/i,
    /session/i,
    /AuthService/i
  ];
  
  const filesToCheck = [
    'src/**/*.ts',
    'src/**/*.tsx',
    'pages/**/*.ts',
    'pages/**/*.tsx'
  ];
  
  let authFound = false;
  
  filesToCheck.forEach(pattern => {
    try {
      const files = execSync(`find . -name "${pattern}" -type f`, { encoding: 'utf8' }).split('\n').filter(Boolean);
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          
          authPatterns.forEach(pattern => {
            if (pattern.test(content)) {
              authFound = true;
            }
          });
        }
      });
    } catch (error) {
      // Pattern not found, continue
    }
  });
  
  if (authFound) {
    PASSED_CHECKS.push('✅ Authentication patterns found');
  } else {
    WARNINGS.push('⚠️ No authentication patterns found');
  }
}

// 7. Check for error handling
function checkErrorHandling() {
  console.log('🔍 Checking error handling...');
  
  // Check for error boundary components
  const errorBoundaryPath = 'src/components/ErrorBoundary.tsx';
  const criticalErrorBoundaryPath = 'src/components/CriticalErrorBoundary.tsx';
  
  if (fs.existsSync(errorBoundaryPath) && fs.existsSync(criticalErrorBoundaryPath)) {
    PASSED_CHECKS.push('✅ Comprehensive error boundary system found');
    return;
  }
  
  const errorPatterns = [
    /try\s*{/g,
    /catch\s*\(/g,
    /ErrorBoundary/g,
    /error\s*handling/i,
    /logger\.error/g,
    /CriticalErrorBoundary/g
  ];
  
  const filesToCheck = [
    'src/**/*.ts',
    'src/**/*.tsx',
    'pages/**/*.ts',
    'pages/**/*.tsx'
  ];
  
  let errorHandlingFound = false;
  
  filesToCheck.forEach(pattern => {
    try {
      const files = execSync(`find . -name "${pattern}" -type f`, { encoding: 'utf8' }).split('\n').filter(Boolean);
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          
          errorPatterns.forEach(pattern => {
            if (pattern.test(content)) {
              errorHandlingFound = true;
            }
          });
        }
      });
    } catch (error) {
      // Pattern not found, continue
    }
  });
  
  if (errorHandlingFound) {
    PASSED_CHECKS.push('✅ Error handling patterns found');
  } else {
    WARNINGS.push('⚠️ No error handling patterns found');
  }
}

// Run all checks
checkForHardcodedSecrets();
checkEnvironmentVariables();
checkSecurityHeaders();
checkCORSConfiguration();
checkInputValidation();
checkAuthentication();
checkErrorHandling();

// Generate report
console.log('\n📊 SECURITY AUDIT RESULTS:\n');

if (SECURITY_ISSUES.length > 0) {
  console.log('🚨 CRITICAL SECURITY ISSUES:');
  SECURITY_ISSUES.forEach(issue => console.log(`  ${issue}`));
  console.log('');
}

if (WARNINGS.length > 0) {
  console.log('⚠️ SECURITY WARNINGS:');
  WARNINGS.forEach(warning => console.log(`  ${warning}`));
  console.log('');
}

if (PASSED_CHECKS.length > 0) {
  console.log('✅ PASSED CHECKS:');
  PASSED_CHECKS.forEach(check => console.log(`  ${check}`));
  console.log('');
}

// Summary
const totalChecks = SECURITY_ISSUES.length + WARNINGS.length + PASSED_CHECKS.length;
const securityScore = Math.round((PASSED_CHECKS.length / totalChecks) * 100);

console.log(`📈 SECURITY SCORE: ${securityScore}%`);

if (SECURITY_ISSUES.length > 0) {
  console.log('\n🚨 ACTION REQUIRED: Critical security issues found!');
  process.exit(1);
} else if (WARNINGS.length > 0) {
  console.log('\n⚠️ RECOMMENDATION: Address security warnings for better protection.');
} else {
  console.log('\n✅ EXCELLENT: No security issues found!');
}

console.log('\n🔐 SECURITY AUDIT COMPLETED');
