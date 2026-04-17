const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./server/models/User');

dotenv.config({ path: './server/.env' });

const testLogin = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'user@cityserve.com';
        const password = 'user123';

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found: ${email}`);
            const allUsers = await User.find({}).select('email');
            console.log('Existing users:', allUsers.map(u => u.email));
        } else {
            console.log(`User found: ${user.email}`);
            const isMatch = await user.matchPassword(password);
            console.log(`Password match for ${password}: ${isMatch}`);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

testLogin();
