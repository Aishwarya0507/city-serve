const Message = require('../models/Message');
const Booking = require('../models/Booking');

// @desc    Get chat messages for a booking
// @route   GET /api/chats/:bookingId
// @access  Private
const getChatMessages = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only participants can view chat
        if (booking.user.toString() !== req.user._id.toString() && 
            booking.provider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const messages = await Message.find({ booking: req.params.bookingId })
            .sort({ createdAt: 1 });
            
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getChatMessages
};
