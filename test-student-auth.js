// Test script to verify student authentication and password reset functionality
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function testStudentAuth() {
  console.log('🧪 Testing Student Authentication System...\n');

  // Test 1: First-time login with National ID/Birth Certificate
  console.log('Test 1: First-time login');
  try {
    const response = await fetch(`${API_BASE}/api/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registration_number: 'CS/001/2024',
        password: '12345678' // Assuming this is the National ID
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.first_login && data.requires_password_reset) {
      console.log('✅ First-time login detection working');
      
      // Test 2: Password reset for first-time user
      console.log('\nTest 2: Password reset for first-time user');
      const resetResponse = await fetch(`${API_BASE}/api/auth/student-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: data.student.id,
          new_password: 'newpassword123'
        })
      });
      
      const resetData = await resetResponse.json();
      console.log('Reset Response:', resetData);
      
      if (resetData.success) {
        console.log('✅ Password reset working');
        
        // Test 3: Login with new password
        console.log('\nTest 3: Login with new password');
        const loginResponse = await fetch(`${API_BASE}/api/auth/student-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registration_number: 'CS/001/2024',
            password: 'newpassword123'
          })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login Response:', loginData);
        
        if (loginData.token && !loginData.first_login) {
          console.log('✅ Login with new password working');
        } else {
          console.log('❌ Login with new password failed');
        }
      } else {
        console.log('❌ Password reset failed');
      }
    } else {
      console.log('❌ First-time login detection not working');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStudentAuth().catch(console.error);
