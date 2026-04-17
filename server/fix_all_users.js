const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const fixAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Database connected');

        const users = await User.find({});
        console.log(`🔍 Checking ${users.length} users...`);

        for (const user of users) {
            let changed = false;

            // 1. Normalize email to lowercase
            const lowerEmail = user.email.toLowerCase();
            if (user.email !== lowerEmail) {
                console.log(`📧 Normalizing email: ${user.email} -> ${lowerEmail}`);
                user.email = lowerEmail;
                changed = true;
            }

            // 2. Hash plaintext passwords
            const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
            if (!isHashed) {
                console.log(`🔐 Hashing plaintext password for: ${user.email}`);
                // The pre('save') hook in the User model will hash this if we call save().
                // However, to be extra safe and explicit, let's hash it here if it's not already hashed.
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
                changed = true;
            }

            if (changed) {
                await user.save();
                console.log(`✅ Fixed user: ${user.email}`);
            }
        }

        console.log('✨ All user records fixed and synchronized.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixAllUsers();
