const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const VerificationRequirement = require('../models/VerificationRequirement');
const mongoose = require('mongoose');

const getAnalytics = async (req, res) => {
    try {
        const providerId = new mongoose.Types.ObjectId(req.user._id);
        const statsPipeline = [
            { $match: { provider: providerId } },
            {
                $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'serviceData' }
            },
            { $unwind: '$serviceData' },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    completedBookings: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
                    totalEarnings: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, '$serviceData.price', 0] } },
                    averageRating: { $avg: '$rating' }
                }
            }
        ];
        const statsResult = await Booking.aggregate(statsPipeline);
        const stats = statsResult[0] || { totalBookings: 0, completedBookings: 0, totalEarnings: 0, averageRating: 0 };
        const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyEarnings = await Booking.aggregate([
            { $match: { provider: providerId, status: 'Completed', createdAt: { $gte: sixMonthsAgo } } },
            { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'serviceData' } },
            { $unwind: '$serviceData' },
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, earnings: { $sum: '$serviceData.price' }, count: { $sum: 1 } } },
            { $sort: { "_id": 1 } }
        ]);
        const statusDist = await Booking.aggregate([{ $match: { provider: providerId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
        res.json({ totalEarnings: stats.totalEarnings, totalBookings: stats.totalBookings, completedBookings: stats.completedBookings, completionRate: (stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings) * 100 : 0).toFixed(1), averageRating: (stats.averageRating || 0).toFixed(1), monthlyEarnings, statusDist });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAnalytics };
