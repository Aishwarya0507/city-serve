const mongoose = require('mongoose');

const providerAvailabilitySchema = mongoose.Schema({
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    workingDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    specificDate: { type: Date },
    isAvailable: { type: Boolean, default: true },
    startHour: { type: Number, default: 9 },
    endHour: { type: Number, default: 18 },
    isDefaultSchedule: { type: Boolean, default: false }
}, { timestamps: true });

// New clean index strategy
providerAvailabilitySchema.index({ provider: 1, service: 1, isDefaultSchedule: 1 }, { unique: true });
providerAvailabilitySchema.index({ provider: 1, service: 1, specificDate: 1 }, { unique: true, sparse: true });

const ProviderAvailability = mongoose.model('ProviderAvailability', providerAvailabilitySchema);
module.exports = ProviderAvailability;
