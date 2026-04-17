const User = require('../models/User');
const Booking = require('../models/Booking');
const Location = require('../models/Location');
const Category = require('../models/Category');
const Service = require('../models/Service');
const VerificationRequirement = require('../models/VerificationRequirement');
const Provider = require('../models/Provider');
const { createNotification } = require('./notificationController');

const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Current Month Stats
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalProviders = await User.countDocuments({ role: 'provider' });
        const totalBookings = await Booking.countDocuments();
        const completedBookings = await Booking.countDocuments({ status: 'Completed' });

        // Total Gross Revenue
        const revenueAggregation = await Booking.aggregate([
            { $match: { status: 'Completed' } },
            { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'serviceInfo' } },
            { $unwind: '$serviceInfo' },
            { $group: { _id: null, total: { $sum: '$serviceInfo.price' } } }
        ]);
        const totalRevenue = revenueAggregation[0]?.total || 0;

        // Top Service (Most Booked)
        const topServiceAggregation = await Booking.aggregate([
            { $group: { _id: '$service', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
            { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'details' } },
            { $unwind: '$details' }
        ]);

        // Top Provider (Most Completed)
        const topProviderAggregation = await Booking.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: '$provider', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'details' } },
            { $unwind: '$details' }
        ]);

        // Previous Month Stats (for growth calculation)
        const prevUsers = await User.countDocuments({ role: 'user', createdAt: { $lt: firstDayOfMonth, $gte: firstDayOfPrevMonth } });
        const prevProviders = await User.countDocuments({ role: 'provider', createdAt: { $lt: firstDayOfMonth, $gte: firstDayOfPrevMonth } });
        const prevBookings = await Booking.countDocuments({ createdAt: { $lt: firstDayOfMonth, $gte: firstDayOfPrevMonth } });
        const prevCompleted = await Booking.countDocuments({ status: 'Completed', updatedAt: { $lt: firstDayOfMonth, $gte: firstDayOfPrevMonth } });

        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? '+100%' : '0%';
            const growth = ((current - previous) / previous) * 100;
            return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        };

        // Monthly Bookings & Revenue Chart Data (Last 6 months)
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            
            const bookingsCount = await Booking.countDocuments({ createdAt: { $gte: start, $lte: end } });
            
            // Revenue for this month
            const monthRevAgg = await Booking.aggregate([
                { $match: { status: 'Completed', updatedAt: { $gte: start, $lte: end } } },
                { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 's' } },
                { $unwind: '$s' },
                { $group: { _id: null, total: { $sum: '$s.price' } } }
            ]);
            
            chartData.push({ 
                month: monthName, 
                bookings: bookingsCount,
                revenue: monthRevAgg[0]?.total || 0 
            });
        }

        // Category Distribution
        const categories = await Service.aggregate([
            { $group: { _id: "$category", value: { $sum: 1 } } },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        res.json({
            stats: {
                totalUsers: { value: totalUsers, change: calculateGrowth(totalUsers - prevUsers, prevUsers) },
                totalProviders: { value: totalProviders, change: calculateGrowth(totalProviders - prevProviders, prevProviders) },
                totalBookings: { value: totalBookings, change: calculateGrowth(totalBookings - prevBookings, prevBookings) },
                totalRevenue: { value: totalRevenue, change: '+14.2%' }, // Mock growth for revenue for now
                topService: topServiceAggregation[0]?.details?.title || 'None',
                topProvider: topProviderAggregation[0]?.details?.name || 'None'
            },
            chartData,
            categoryData: categories.length > 0 ? categories : [{ name: 'None', value: 1 }]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingLocations = async (req, res) => {
    try {
        const locations = await Location.find({ status: 'pending' });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveLocation = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);
        if (location) {
            location.status = 'approved';
            await location.save();
            res.json(location);
        } else {
            res.status(404).json({ message: 'Location not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingCategories = async (req, res) => {
    try {
        const categories = await Category.find({ status: 'pending' });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            category.status = 'approved';
            await category.save();
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingProviders = async (req, res) => {
    try {
        const providers = await User.find({ role: 'provider', status: 'pending' });
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveProvider = async (req, res) => {
    try {
        const provider = await User.findById(req.params.id);
        if (provider) {
            provider.status = req.body.status || 'approved';
            await provider.save();
            res.json(provider);
        } else {
            res.status(404).json({ message: 'Provider not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('provider', 'name email')
            .populate('service', 'title price');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---- Service Approval ----
const getPendingServices = async (req, res) => {
    try {
        const services = await Service.find({ status: 'pending' })
            .populate('provider', 'name email')
            .sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (service) {
            service.status = 'approved';
            await service.save();

            // Create Notification for Provider
            await createNotification(
                service.provider,
                `Great news! Your service "${service.title}" has been approved and is now live.`,
                'service_approved',
                '/provider/services'
            );

            res.json(service);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rejectService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (service) {
            service.status = 'rejected';
            await service.save();
            res.json(service);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getPendingLocations,
    approveLocation,
    getPendingCategories,
    approveCategory,
    getPendingProviders,
    approveProvider,
    getAllBookings,
    getPendingServices,
    approveService,
    rejectService,
};

