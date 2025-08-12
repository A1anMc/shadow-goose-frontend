#!/usr/bin/env node

/**
 * SGE Authentication Flow Test
 * Diagnoses JWT token and backend API issues
 */

const https = require('https');
const http = require('http');

const API_BASE = 'https://shadow-goose-api.onrender.com';
const FRONTEND_BASE = 'https://sge-enhanced-dashboard.onrender.com';

// Test credentials
const TEST_CREDENTIALS = {
  username: 'test',
  password: 'test'
};

const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  diagnostics: {}
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) req.write(options.body);
    req.end();
  });
}

async function testBackendHealth() {
  console.log('🔍 Testing Backend Health...');

  try {
    const result = await makeRequest(`${API_BASE}/`, {
      method: 'GET',
      headers: {
        'User-Agent': 'SGE-Auth-Test/1.0',
        'Accept': 'application/json'
      }
    });

    if (result.status === 200) {
      console.log('✅ Backend Health: PASSED');
      testResults.passed++;
      testResults.diagnostics.backendHealth = 'healthy';
    } else {
      console.log(`❌ Backend Health: FAILED (${result.status})`);
      testResults.failed++;
      testResults.diagnostics.backendHealth = `unhealthy: ${result.status}`;
    }
  } catch (error) {
    console.log(`❌ Backend Health: ERROR - ${error.message}`);
    testResults.failed++;
    testResults.diagnostics.backendHealth = `error: ${error.message}`;
  }
}

async function testLoginEndpoint() {
  console.log('🔍 Testing Login Endpoint...');

  try {
    const result = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(TEST_CREDENTIALS)
    });

    if (result.status === 200) {
      console.log('✅ Login Endpoint: PASSED');
      testResults.passed++;
      testResults.diagnostics.loginEndpoint = 'working';

      if (result.data && result.data.access_token) {
        testResults.diagnostics.testToken = result.data.access_token;
        console.log('🔑 Test token obtained');
      }
    } else {
      console.log(`❌ Login Endpoint: FAILED (${result.status})`);
      testResults.failed++;
      testResults.diagnostics.loginEndpoint = `failed: ${result.status}`;

      if (result.data && result.data.detail) {
        console.log(`   Error: ${result.data.detail}`);
      }
    }
  } catch (error) {
    console.log(`❌ Login Endpoint: ERROR - ${error.message}`);
    testResults.failed++;
    testResults.diagnostics.loginEndpoint = `error: ${error.message}`;
  }
}

async function testTokenValidation() {
  console.log('🔍 Testing Token Validation...');

  const token = testResults.diagnostics.testToken;
  if (!token) {
    console.log('⚠️ No test token available, skipping token validation');
    return;
  }

  try {
    const result = await makeRequest(`${API_BASE}/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (result.status === 200) {
      console.log('✅ Token Validation: PASSED');
      testResults.passed++;
      testResults.diagnostics.tokenValidation = 'valid';
    } else {
      console.log(`❌ Token Validation: FAILED (${result.status})`);
      testResults.failed++;
      testResults.diagnostics.tokenValidation = `invalid: ${result.status}`;

      if (result.data && result.data.detail) {
        console.log(`   Error: ${result.data.detail}`);
      }
    }
  } catch (error) {
    console.log(`❌ Token Validation: ERROR - ${error.message}`);
    testResults.failed++;
    testResults.diagnostics.tokenValidation = `error: ${error.message}`;
  }
}

async function runAuthDiagnostics() {
  console.log('🚀 Starting SGE Authentication Diagnostics\n');
  console.log('📋 Testing JWT token flow and backend API connectivity...\n');

  await testBackendHealth();
  await testLoginEndpoint();
  await testTokenValidation();

  console.log('\n📊 Authentication Diagnostics Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  console.log('\n🔍 Detailed Diagnostics:');
  Object.entries(testResults.diagnostics).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  return testResults;
}

runAuthDiagnostics().catch(console.error);
