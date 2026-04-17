const mongoose = require('mongoose');

const verificationRequirementSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    isRequired: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const VerificationRequirement = mongoose.model('VerificationRequirement', verificationRequirementSchema);
module.exports = VerificationRequirement;
