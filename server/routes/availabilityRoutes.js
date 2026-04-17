const express = require('express');
const router = express.Router();
const ProviderAvailability = require('../models/ProviderAvailability');
const {
    getAvailableSlots,
    getMonthAvailability,
    getProviderSchedule,
    updateProviderSchedule,
    blockAvailability
} = require('../controllers/availabilityController');
const { protect, provider } = require('../middleware/authMiddleware');

router.get('/schedule/me', protect, provider, getProviderSchedule);
router.put('/schedule/me', protect, provider, updateProviderSchedule);
router.post('/block', protect, provider, blockAvailability);

router.delete('/block', protect, provider, async (req, res) => {
    const { specificDate, serviceId } = req.body;
    if (!serviceId) return res.status(400).json({ message: 'serviceId is mandatory' });
    try {
        await ProviderAvailability.deleteOne({ 
            provider: req.user._id, 
            service: serviceId, 
            specificDate: new Date(specificDate),
            isDefaultSchedule: false
        });
        res.json({ message: 'Exception removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Changed routes to include serviceId as a URL parameter for clarity and strictness
router.get('/:providerId/:serviceId/:date', getAvailableSlots);
router.get('/month/:providerId/:serviceId/:month', getMonthAvailability);

module.exports = router;
