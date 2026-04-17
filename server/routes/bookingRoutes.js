const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getProviderBookings,
    updateBookingStatus,
    verifyPin,
    resendPin,
    rateBooking,
    requestCancellation,
    confirmCancellation,
    syncAllProviderStats,
    requestReschedule,
    handleReschedule,
    uploadServicePhotos,
    updateRecurrence,
} = require('../controllers/bookingController');
const { protect, provider } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createBooking)
    .get(protect, getMyBookings);

router.get('/provider', protect, provider, getProviderBookings);

router.put('/:id/status', protect, provider, updateBookingStatus);
router.post('/:id/verify-pin', protect, provider, verifyPin);
router.post('/:id/resend-pin', protect, provider, resendPin);
router.post('/:id/rate', protect, rateBooking);
router.post('/:id/request-cancel', protect, requestCancellation);
router.post('/:id/confirm-cancel', protect, confirmCancellation);
router.post('/:id/reschedule', protect, requestReschedule);
router.put('/:id/reschedule', protect, provider, handleReschedule);
router.put('/:id/recurrence', protect, updateRecurrence);
router.post('/sync-all-stats', protect, syncAllProviderStats);

module.exports = router;
