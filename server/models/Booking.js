const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: Date, required: true },
    time_slot: { type: String, required: true },
    // Exact appointment time (new - for appointment system)
    appointmentStartTime: { type: String }, // e.g. "10:30 AM"
    appointmentEndTime: { type: String },   // computed from service.duration
    service_address: {
        full_address: { type: String, required: true },
        landmark: { type: String },
        area: { type: String },
        city: { type: String, required: true },
    },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
    price: { type: Number },
    pin: { type: String },
    cancellationCode: { type: String },
    cancelRequested: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    // Recurring Fields
    isRecurring: { type: Boolean, default: false },
    recurrenceType: { type: String, enum: ['weekly', 'monthly', 'custom'] },
    recurrenceInterval: { type: Number }, // in days
    nextServiceDate: { type: Date },
    // Reschedule Request
    rescheduleRequest: {
        newDate: { type: Date },
        newTimeSlot: { type: String },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: null },
        requestedBy: { type: String, enum: ['customer', 'provider'] },
        reason: { type: String }
    },
    // Proof of Work Photos
    beforePhoto: { type: String },
    afterPhoto: { type: String }
}, { timestamps: true });

// PRODUCTION GATE: Prevent double-booking for the same provider, date, and startTime.
// This handles race conditions where two users book simultaneously.
bookingSchema.index(
    { provider: 1, date: 1, appointmentStartTime: 1 },
    { 
        unique: true, 
        // Partial index ensures we don't block slots if a previous booking was Cancelled or Rejected
        partialFilterExpression: { status: { $nin: ['Cancelled', 'Rejected'] } } 
    }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
