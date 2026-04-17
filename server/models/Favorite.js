const mongoose = require('mongoose');

const favoriteSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
}, { timestamps: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
