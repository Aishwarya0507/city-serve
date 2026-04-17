const axios = require('axios');

const testLogin = async (email, password) => {
    try {
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            email,
            password
        });
        console.log(`Login successful for ${email}:`, response.data);
    } catch (error) {
        console.error(`Login failed for ${email}:`, error.response ? error.response.data : error.message);
    }
};

const run = async () => {
    console.log('Testing Admin Login...');
    await testLogin('admin@cityserve.com', 'admin123');
    
    console.log('\nTesting Provider Login...');
    await testLogin('provider@cityserve.com', 'provider123');
};

run();
