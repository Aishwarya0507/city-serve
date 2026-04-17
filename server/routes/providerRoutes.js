const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/providerController');
const { protect, provider } = require('../middleware/authMiddleware');

router.get('/analytics', protect, provider, getAnalytics);

module.exports = router;
