const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function checkUsers() {
    try {
        await mongoose.connect('mongodb+srv://aishwarya57:admin0507@cluster0.rpfz5yt.mongodb.net/?appName=Cluster0');
        console.log('✅ Connected to MongoDB');
        
        const User = require('./models/User');
        const users = await User.find({});
        
        console.log('\n--- User Password Status ---');
        for (const user of users) {
            const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
            console.log(`Email: ${user.email.padEnd(30)} | Hashed: ${isHashed ? 'YES' : 'NO '} | Role: ${user.role}`);
        }
        
        mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

checkUsers();
