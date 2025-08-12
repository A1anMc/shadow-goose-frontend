// Test API Connection Script
const API_URL = 'https://shadow-goose-api.onrender.com';

async function testAPIConnection() {
  console.log('🔍 Testing API Connection...\n');

  try {
    // 1. Test authentication
    console.log('1. Testing Authentication...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', password: 'test' })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const authData = await loginResponse.json();
    console.log('✅ Authentication successful');
    console.log(`   User: ${authData.user.username} (${authData.user.role})`);
    console.log(`   Token: ${authData.access_token.substring(0, 20)}...\n`);

    // 2. Test projects endpoint
    console.log('2. Testing Projects API...');
    const projectsResponse = await fetch(`${API_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });

    if (!projectsResponse.ok) {
      throw new Error(`Projects API failed: ${projectsResponse.status}`);
    }

    const projectsData = await projectsResponse.json();
    console.log('✅ Projects API successful');
    console.log(`   Projects found: ${projectsData.projects?.length || 0}\n`);

    // 3. Test user info
    console.log('3. Testing User Info API...');
    const userResponse = await fetch(`${API_URL}/auth/user`, {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });

    if (!userResponse.ok) {
      throw new Error(`User API failed: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    console.log('✅ User Info API successful');
    console.log(`   User: ${userData.username} (${userData.role})\n`);

    console.log('🎉 All API tests passed! The backend is ready for integration.');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
testAPIConnection();
