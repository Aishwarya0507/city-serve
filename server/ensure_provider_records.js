const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Provider = require('./models/Provider');

const ensureProviderRecords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Database connected');

        const providers = await User.find({ role: 'provider' });
        console.log(`🔍 Found ${providers.length} provider users`);

        for (const user of providers) {
            const existingRecord = await Provider.findOne({ user: user._id });
            if (!existingRecord) {
                console.log(`🔨 Creating Provider record for: ${user.name} (${user.email})`);
                await Provider.create({
                    user: user._id,
                    businessName: `${user.name} Services`,
                    description: 'Professional service provider on CityServe.',
                    isVerified: true // Auto-verify legacy providers
                });
            } else {
                console.log(`✅ Provider record already exists for: ${user.name}`);
            }
        }

        console.log('✨ All provider records synchronized.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

ensureProviderRecords();
