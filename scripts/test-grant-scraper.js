#!/usr/bin/env node

/**
 * SGE Grant Scraper Test
 * Tests grant data sources and handles authentication issues
 */

const https = require('https');
const http = require('http');

// Grant data sources to test
const GRANT_SOURCES = [
  {
    name: 'Creative Australia',
    url: 'https://creative.gov.au/grants',
    type: 'government',
    requiresAuth: false
  },
  {
    name: 'Screen Australia',
    url: 'https://www.screenaustralia.gov.au/funding-and-support',
    type: 'government',
    requiresAuth: false
  },
  {
    name: 'VicScreen',
    url: 'https://vicscreen.vic.gov.au/funding',
    type: 'government',
    requiresAuth: false
  },
  {
    name: 'Regional Arts Fund',
    url: 'https://www.arts.gov.au/funding/regional-arts-fund',
    type: 'government',
    requiresAuth: false
  },
  {
    name: 'Victorian Government Grants',
    url: 'https://www.vic.gov.au/grants',
    type: 'government',
    requiresAuth: false
  }
];

// Alternative sources if primary ones are blocked
const ALTERNATIVE_SOURCES = [
  {
    name: 'GrantConnect',
    url: 'https://www.grants.gov.au',
    type: 'government',
    requiresAuth: false
  },
  {
    name: 'Pro Bono Australia',
    url: 'https://probonoaustralia.com.au/grants',
    type: 'private',
    requiresAuth: false
  },
  {
    name: 'Our Community',
    url: 'https://www.ourcommunity.com.au/grants',
    type: 'private',
    requiresAuth: false
  }
];

const testResults = {
  working: [],
  blocked: [],
  alternatives: [],
  errors: []
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
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

async function testGrantSource(source) {
  try {
    console.log(`🔍 Testing ${source.name} (${source.url})...`);

    const result = await makeRequest(source.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'SGE-Grant-Scraper/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    // Check if access is blocked
    if (result.status === 403 || result.status === 401) {
      console.log(`❌ ${source.name}: BLOCKED (${result.status}) - Authentication required`);
      testResults.blocked.push({
        ...source,
        status: result.status,
        reason: 'Authentication required'
      });
      return false;
    }

    if (result.status === 429) {
      console.log(`⚠️ ${source.name}: RATE LIMITED (${result.status}) - Too many requests`);
      testResults.blocked.push({
        ...source,
        status: result.status,
        reason: 'Rate limited'
      });
      return false;
    }

    if (result.status === 200) {
      // Check if content is accessible
      const hasGrantContent = result.data.toLowerCase().includes('grant') ||
                             result.data.toLowerCase().includes('funding') ||
                             result.data.toLowerCase().includes('apply');

      if (hasGrantContent) {
        console.log(`✅ ${source.name}: WORKING (${result.status}) - Grant content found`);
        testResults.working.push({
          ...source,
          status: result.status,
          contentLength: result.data.length
        });
        return true;
      } else {
        console.log(`⚠️ ${source.name}: NO GRANT CONTENT (${result.status}) - Page accessible but no grant info`);
        testResults.blocked.push({
          ...source,
          status: result.status,
          reason: 'No grant content found'
        });
        return false;
      }
    } else {
      console.log(`❌ ${source.name}: ERROR (${result.status})`);
      testResults.errors.push({
        ...source,
        status: result.status,
        reason: 'HTTP error'
      });
      return false;
    }

  } catch (error) {
    console.log(`❌ ${source.name}: ERROR - ${error.message}`);
    testResults.errors.push({
      ...source,
      error: error.message,
      reason: 'Network error'
    });
    return false;
  }
}

async function findAlternativeSource(blockedSource) {
  console.log(`\n🔍 Looking for alternative to ${blockedSource.name}...`);

  for (const alt of ALTERNATIVE_SOURCES) {
    if (alt.name !== blockedSource.name) {
      const isWorking = await testGrantSource(alt);
      if (isWorking) {
        console.log(`✅ Found alternative: ${alt.name}`);
        testResults.alternatives.push({
          original: blockedSource,
          alternative: alt
        });
        return alt;
      }
    }
  }

  console.log(`❌ No working alternative found for ${blockedSource.name}`);
  return null;
}

async function runGrantScraperTest() {
  console.log('🚀 Starting SGE Grant Scraper Test\n');
  console.log('📋 Testing grant data sources for authentication and accessibility...\n');

  // Test primary sources
  console.log('🔍 Testing Primary Grant Sources:');
  for (const source of GRANT_SOURCES) {
    const isWorking = await testGrantSource(source);

    // If blocked, try to find alternative
    if (!isWorking) {
      await findAlternativeSource(source);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n📊 Grant Scraper Test Summary:');
  console.log(`✅ Working Sources: ${testResults.working.length}`);
  console.log(`❌ Blocked Sources: ${testResults.blocked.length}`);
  console.log(`🔄 Alternative Sources: ${testResults.alternatives.length}`);
  console.log(`🚨 Errors: ${testResults.errors.length}`);

  if (testResults.working.length > 0) {
    console.log('\n✅ Working Grant Sources:');
    testResults.working.forEach(source => {
      console.log(`  - ${source.name} (${source.url})`);
    });
  }

  if (testResults.blocked.length > 0) {
    console.log('\n❌ Blocked Sources (Will be removed):');
    testResults.blocked.forEach(source => {
      console.log(`  - ${source.name}: ${source.reason}`);
    });
  }

  if (testResults.alternatives.length > 0) {
    console.log('\n🔄 Alternative Sources Found:');
    testResults.alternatives.forEach(pair => {
      console.log(`  - ${pair.original.name} → ${pair.alternative.name}`);
    });
  }

  console.log('\n🎯 Recommendations:');

  if (testResults.working.length >= 3) {
    console.log('  ✅ Sufficient grant sources available');
    console.log('  ✅ Proceed with current scraper configuration');
  } else if (testResults.alternatives.length > 0) {
    console.log('  🔄 Some sources blocked, but alternatives found');
    console.log('  🔄 Update scraper to use alternative sources');
  } else {
    console.log('  ❌ Multiple sources blocked');
    console.log('  ❌ Consider manual grant research or API integration');
  }

  // Return results for potential use in scraper configuration
  return {
    workingSources: testResults.working,
    blockedSources: testResults.blocked,
    alternativeSources: testResults.alternatives,
    recommendations: testResults.working.length >= 3 ? 'proceed' : 'update'
  };
}

// Run the test
runGrantScraperTest().catch(console.error);
