const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    location: { type: String },
    village: { type: String },
    district: { type: String },
    state: { type: String },
    country: { type: String },
    experience: { type: Number },
    image: { type: String },
    duration: { type: Number, default: 60 },
    bufferTime: { type: Number, default: 15 },
    status: { type: String, default: 'approved' },
    averageRating: { type: Number, default: 4.8 },
    numReviews: { type: Number, default: 120 },
    covered_areas: { type: String },
    landmark: { type: String },
    distance_from_landmark: { type: String },
    estimated_time: { type: String },
    map_link: { type: String }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
