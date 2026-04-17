const Provider = require('../models/Provider');

const syncProviderProfile = async (req, res, next) => {
    try {
        if (req.user && req.user.role === 'provider') {
            let provider = await Provider.findOne({ user: req.user._id });
            if (!provider) {
                await Provider.create({
                    user: req.user._id,
                    businessName: req.user.name || "My Business",
                    defaultWorkingHours: {
                        startHour: 9,
                        endHour: 18,
                        workingDays: [1, 2, 3, 4, 5, 6]
                    }
                });
                console.log(`✅ Auto-synced provider profile for: ${req.user.name}`);
            }
        }
        next();
    } catch (error) {
        console.error("❌ Error sync provider profile:", error.message);
        next();
    }
};

module.exports = { syncProviderProfile };
