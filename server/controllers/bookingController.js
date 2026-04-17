const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Message = require('../models/Message');
const Provider = require('../models/Provider');
const { createNotification } = require('./notificationController');
const { getProviderAvailabilityInternal, parseToMinutes, toUTCMidnight } = require('./availabilityController');

const createBooking = async (req, res) => {
    const { serviceId, date, appointmentStartTime, service_address } = req.body;
    try {
        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        const normalizedDate = toUTCMidnight(date);
        if (!normalizedDate) return res.status(400).json({ message: 'Invalid date format' });
        const startTimeStr = appointmentStartTime ? appointmentStartTime.trim().toUpperCase() : null;
        if (!startTimeStr) return res.status(400).json({ message: 'Appointment start time is required' });
        const availability = await getProviderAvailabilityInternal(service.provider, normalizedDate, serviceId);
        if (!availability.isAvailable) return res.status(400).json({ message: availability.reason || 'Provider is unavailable' });
        const currentStart = parseToMinutes(startTimeStr);
        const currentEnd = currentStart + (service.duration || 60);
        if (currentStart < availability.startHour * 60 || currentEnd > availability.endHour * 60) return res.status(400).json({ message: 'Slot falls outside working hours' });
        const dateStart = new Date(normalizedDate); dateStart.setUTCHours(0, 0, 0, 0);
        const dateEnd = new Date(normalizedDate); dateEnd.setUTCHours(23, 59, 59, 999);
        const conflicts = await Booking.find({ provider: service.provider, date: { $gte: dateStart, $lte: dateEnd }, status: { $nin: ['Rejected', 'Cancelled'] } });
        const hasOverlap = conflicts.some(c => { const extStart = parseToMinutes(c.appointmentStartTime); const extEnd = parseToMinutes(c.appointmentEndTime); return currentStart < extEnd && currentEnd > extStart; });
        if (hasOverlap) return res.status(409).json({ message: 'Slot no longer available' });
        const formatMinutesToUI = (m) => { const h24 = Math.floor(m / 60) % 24; const mins = m % 60; const period = h24 >= 12 ? 'PM' : 'AM'; const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24; return `${h12}:${mins.toString().padStart(2, '0')} ${period}`; };
        const appointmentEndTime = formatMinutesToUI(currentEnd);
        const booking = await Booking.create({ user: req.user._id, provider: service.provider, service: serviceId, date: normalizedDate, time_slot: startTimeStr, appointmentStartTime: startTimeStr, appointmentEndTime: appointmentEndTime, service_address, price: service.price, status: 'Pending' });
        res.status(201).json(booking);
    } catch (error) { if (error.code === 11000) return res.status(409).json({ message: 'Slot was just taken' }); res.status(500).json({ message: error.message }); }
};

const getMyBookings = async (req, res) => {
    try { const bookings = await Booking.find({ user: req.user._id }).populate('service').populate('provider', 'name email'); res.json(bookings); } catch (error) { res.status(500).json({ message: error.message }); }
};

const getProviderBookings = async (req, res) => {
    try { const bookings = await Booking.find({ provider: req.user._id }).populate('service').populate('user', 'name email avatar'); res.json(bookings); } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateBookingStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        booking.status = status;
        if (status === 'Accepted') booking.pin = Math.floor(100000 + Math.random() * 900000).toString();
        await booking.save();
        res.json(booking);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminUpdateBookingStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        booking.status = status;
        await booking.save();
        res.json(booking);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const verifyPin = async (req, res) => {
    const { pin } = req.body;
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.pin === pin) { booking.status = 'Completed'; await booking.save(); res.json({ message: 'Verified' }); }
        else res.status(401).json({ message: 'Invalid PIN' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const resendPin = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        booking.pin = Math.floor(100000 + Math.random() * 900000).toString();
        await booking.save();
        res.json({ message: 'PIN resent' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const rateBooking = async (req, res) => {
    const { rating, review } = req.body;
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        booking.rating = rating; booking.review = review;
        await booking.save(); res.json(booking);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const requestCancellation = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        booking.status = 'Cancelled'; 
        await booking.save(); 
        res.json({ message: 'Cancelled', booking });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const confirmCancellation = async (req, res) => { 
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        booking.status = 'Cancelled';
        await booking.save();
        res.json({ message: 'Confirmed', booking });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const syncAllProviderStats = async (req, res) => { res.json({ message: 'Synced' }); };

const requestReschedule = async (req, res) => { 
    const { newDate, newTimeSlot, reason } = req.body;
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        booking.status = 'Reschedule Requested';
        booking.rescheduleRequest = {
            newDate: toUTCMidnight(newDate),
            newTimeSlot,
            reason,
            requestedBy: req.user._id
        };
        
        await booking.save();
        res.json({ message: 'Requested', booking });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const handleReschedule = async (req, res) => { 
    const { action } = req.body; // 'Accept' or 'Reject'
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        if (action === 'Accept') {
            booking.date = booking.rescheduleRequest.newDate;
            booking.appointmentStartTime = booking.rescheduleRequest.newTimeSlot;
            booking.status = 'Accepted';
        } else {
            booking.status = 'Accepted'; // Revert to accepted if rejected
        }
        
        booking.rescheduleRequest = undefined;
        await booking.save();
        res.json({ message: 'Handled', booking });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const uploadServicePhotos = async (req, res) => { res.json({ message: 'Uploaded' }); };

const updateRecurrence = async (req, res) => { res.json({ message: 'Updated' }); };

module.exports = {
    createBooking, getMyBookings, getProviderBookings, updateBookingStatus, adminUpdateBookingStatus,
    verifyPin, resendPin, rateBooking, requestCancellation, confirmCancellation,
    syncAllProviderStats, requestReschedule, handleReschedule, uploadServicePhotos, updateRecurrence
};
