const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./server/models/User');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const manageRole = async () => {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('\x1b[33m%s\x1b[0m', 'Usage: node manage-roles.js <email> <role>');
        console.log('Roles: user, provider, admin');
        console.log('Example: node manage-roles.js user@example.com provider');
        process.exit();
    }

    const [email, role] = args;
    const validRoles = ['user', 'provider', 'admin'];

    if (!validRoles.includes(role)) {
        console.error('\x1b[31m%s\x1b[0m', `Error: Invalid role "${role}". Valid roles are: ${validRoles.join(', ')}`);
        process.exit(1);
    }

    try {
        console.log('\x1b[36m%s\x1b[0m', `Connecting to database...`);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\x1b[32m%s\x1b[0m', `Connected successfully.`);

        const user = await User.findOne({ email });

        if (!user) {
            console.error('\x1b[31m%s\x1b[0m', `Error: User with email "${email}" not found.`);
            
            // Helpful: list existing users if not found
            const users = await User.find({}).select('email role').limit(10);
            if (users.length > 0) {
                console.log('\x1b[34m%s\x1b[0m', 'Recent users in system:');
                users.forEach(u => console.log(` - ${u.email} (${u.role})`));
            }
            process.exit(1);
        }

        console.log('\x1b[34m%s\x1b[0m', `Current Role: ${user.role}`);
        
        user.role = role;
        await user.save();

        console.log('\x1b[32m%s\x1b[0m', `Success! ${email} has been upgraded to: ${role.toUpperCase()}`);
        console.log('\x1b[33m%s\x1b[0m', `Note: User must log out and log back in for changes to take effect in the application.`);
        
        process.exit(0);
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Database Error: ${error.message}`);
        process.exit(1);
    }
};

manageRole();
