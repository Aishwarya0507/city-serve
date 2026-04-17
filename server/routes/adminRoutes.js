const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { adminUpdateBookingStatus } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getDashboardStats);

router.get('/pending-locations', protect, admin, getPendingLocations);
router.put('/approve-location/:id', protect, admin, approveLocation);

router.get('/pending-categories', protect, admin, getPendingCategories);
router.put('/approve-category/:id', protect, admin, approveCategory);

router.get('/pending-providers', protect, admin, getPendingProviders);
router.put('/approve-provider/:id', protect, admin, approveProvider);

router.get('/bookings', protect, admin, getAllBookings);
router.put('/bookings/:id/status', protect, admin, adminUpdateBookingStatus);

// Service approval routes
router.get('/pending-services', protect, admin, getPendingServices);
router.put('/approve-service/:id', protect, admin, approveService);
router.put('/reject-service/:id', protect, admin, rejectService);

module.exports = router;
