#!/usr/bin/env node

/**
 * SGE Dashboard Functionality Test
 * Tests all API endpoints and page functionality
 */

const https = require('https');

const API_BASE = 'https://shadow-goose-api.onrender.com';
const FRONTEND_BASE = 'https://sge-enhanced-dashboard.onrender.com';

// Test token (you'll need to get a fresh one)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNzU1MDAyODQxfQ._83z-JRvN-ZExi8MZf0peRLWyyknFZDRxb8IcaOtivI';

const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function testEndpoint(name, path, expectedStatus = 200) {
  try {
    console.log(`Testing ${name}...`);
    const result = await makeRequest(`${API_BASE}${path}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (result.status === expectedStatus) {
      console.log(`✅ ${name}: PASSED (${result.status})`);
      testResults.passed++;
    } else {
      console.log(`❌ ${name}: FAILED (${result.status}) - Expected ${expectedStatus}`);
      testResults.failed++;
      testResults.errors.push(`${name}: Status ${result.status}, Expected ${expectedStatus}`);
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    testResults.failed++;
    testResults.errors.push(`${name}: ${error.message}`);
  }
}

async function testFrontendPage(name, path) {
  try {
    console.log(`Testing ${name}...`);
    const result = await makeRequest(`${FRONTEND_BASE}${path}`, {
      method: 'GET'
    });

    if (result.status === 200) {
      console.log(`✅ ${name}: PASSED (${result.status})`);
      testResults.passed++;
    } else {
      console.log(`❌ ${name}: FAILED (${result.status})`);
      testResults.failed++;
      testResults.errors.push(`${name}: Status ${result.status}`);
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    testResults.failed++;
    testResults.errors.push(`${name}: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting SGE Dashboard Functionality Test\n');

  // Test API endpoints
  console.log('📡 Testing API Endpoints:');
  await testEndpoint('API Health Check', '/');
  await testEndpoint('Authentication - User', '/auth/user');
  await testEndpoint('Projects API', '/api/projects');
  await testEndpoint('Grants API', '/api/grants', 500); // Expected to fail
  await testEndpoint('OKRs API', '/api/okrs', 404); // Expected to fail

  console.log('\n🌐 Testing Frontend Pages:');
  await testFrontendPage('Dashboard Page', '/dashboard');
  await testFrontendPage('Grants Page', '/grants');
  await testFrontendPage('OKRs Page', '/okrs');
  await testFrontendPage('Analytics Page', '/analytics');
  await testFrontendPage('Login Page', '/login');

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n🚨 Errors Found:');
    testResults.errors.forEach(error => console.log(`  - ${error}`));
  }

  console.log('\n🎯 Recommendations:');
  if (testResults.failed > 0) {
    console.log('  - Fix broken API endpoints before UI improvements');
    console.log('  - Implement proper error handling for failed endpoints');
    console.log('  - Add fallback data for critical features');
  } else {
    console.log('  - All tests passed! Ready for UI/UX improvements');
  }
}

runTests().catch(console.error);
