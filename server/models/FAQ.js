const mongoose = require('mongoose');

const faqSchema = mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['user', 'provider', 'general'], 
        default: 'general' 
    },
    category: { type: String, required: true },
    is_highlighted: { type: Boolean, default: false },
    feedback: {
        yes: { type: Number, default: 0 },
        no: { type: Number, default: 0 }
    }
}, { timestamps: true });

const FAQ = mongoose.model('FAQ', faqSchema);
module.exports = FAQ;
