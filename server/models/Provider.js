const mongoose = require('mongoose');

const providerSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: { type: String, required: true },
    description: { type: String },
    profileAvatar: { type: String },
    isVerified: { type: Boolean, default: false },
    completedBookingsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    // Simplified working hours
    defaultWorkingHours: {
        startHour: { type: Number, default: 9 }, // 24hr
        endHour: { type: Number, default: 18 },  // 24hr
        workingDays: { type: [Number], default: [1, 2, 3, 4, 5, 6] } // Mon-Sat
    }
}, { timestamps: true });

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
