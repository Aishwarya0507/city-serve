const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const UserSchema = new mongoose.Schema({
    email: String,
    password: String
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function resetPassword() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully.');

        const email = 'admin@cityserve.com';
        const newPassword = 'admin123';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const result = await User.updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount > 0) {
            console.log(`✅ Password reset successfully for ${email}`);
            console.log(`New Password: ${newPassword}`);
        } else {
            console.log(`❌ User ${email} not found.`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

resetPassword();
