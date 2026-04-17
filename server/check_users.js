const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const UserSchema = new mongoose.Schema({
    email: String,
    name: String,
    role: String
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function checkDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully.\n');

        const usersCount = await User.countDocuments();
        console.log(`Total users in database: ${usersCount}`);

        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('\n--- Registered Users ---');
        users.forEach(u => {
            const hasHashedPassword = u.password && u.password.startsWith('$2');
            console.log(`ID: ${u._id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Password Hashed: ${hasHashedPassword ? 'Yes' : 'NO (PLALINTEXT?)'}`);
        });

        console.log('\n--- End of Report ---');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkDatabase();
