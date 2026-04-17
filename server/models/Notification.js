const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['booking_accepted', 'booking_completed', 'service_approved', 'system'],
        default: 'system' 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    link: { 
        type: String 
    },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
