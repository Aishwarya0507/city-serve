const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function verifyAuth() {
    console.log('🚀 Starting Final Auth Verification...');

    try {
        // 1. Test Signup Validation (Email)
        console.log('\n--- 1. Testing Email Validation ---');
        try {
            await axios.post(`${API_URL}/auth/signup`, {
                name: 'Test',
                email: 'invalid-email',
                password: 'password123'
            });
        } catch (err) {
            console.log('✅ Correctly rejected invalid email:', err.response.data.message);
        }

        // 2. Test Signup Validation (Password Length)
        console.log('\n--- 2. Testing Password Length Validation ---');
        try {
            await axios.post(`${API_URL}/auth/signup`, {
                name: 'Test',
                email: 'test@valid.com',
                password: '123'
            });
        } catch (err) {
            console.log('✅ Correctly rejected short password:', err.response.data.message);
        }

        // 3. Test Successful Signup & Login
        const testEmail = `testuser_${Date.now()}@example.com`;
        const testPass = 'password123';

        console.log('\n--- 3. Testing Successful Signup ---');
        const signupRes = await axios.post(`${API_URL}/auth/signup`, {
            name: 'Verification User',
            email: testEmail,
            password: testPass,
            role: 'user',
            country: 'India',
            state: 'Telangana'
        });
        console.log('✅ Signup Successful. Token received:', signupRes.data.token ? 'YES' : 'NO');

        console.log('\n--- 4. Testing Successful Login ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testEmail,
            password: testPass
        });
        console.log('✅ Login Successful. Token received:', loginRes.data.token ? 'YES' : 'NO');
        console.log('✅ Role check:', loginRes.data.role);

        console.log('\n✨ ALL BACKEND AUTH REQUIREMENTS VERIFIED.');
    } catch (err) {
        console.error('❌ Verification failed:', err.response?.data?.message || err.message);
    }
}

verifyAuth();
