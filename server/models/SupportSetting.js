const mongoose = require('mongoose');

const supportSettingSchema = mongoose.Schema({
    contact_email: { type: String, default: 'support@cityserve.com' },
    contact_phone: { type: String, default: '+1 (555) 000-0000' },
    support_request_link: { type: String, default: '#' },
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

const SupportSetting = mongoose.model('SupportSetting', supportSettingSchema);
module.exports = SupportSetting;
