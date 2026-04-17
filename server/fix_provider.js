const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://aishwarya57:admin0507@cluster0.rpfz5yt.mongodb.net/?appName=Cluster0').then(async () => {
    const User = require('./models/User');
    
    // Fix provider 
    const provider = await User.findOne({ email: 'provider@cityserve.com' });
    if (provider) {
        provider.password = 'provider123';
        // The pre('save') hook in the User model will hash this plaintext password.
        await provider.save();
        console.log('Fixed provider@cityserve.com password hashes');
    }
    
    // Test auth for provider
    const p2 = await User.findOne({ email: 'provider@cityserve.com' });
    if(p2) {
        const isMatch = await p2.matchPassword("provider123");
        console.log("provider123 works now: " + isMatch);
    }
    
    // Test auth for admin
    const admin = await User.findOne({ email: 'admin@cityserve.com' });
    if (admin) {
        const adminMatch = await admin.matchPassword("admin123");
        console.log("admin123 works now: " + adminMatch);
    }

    mongoose.disconnect();
}).catch(console.error);
