const express = require('express');
const router = express.Router();
const { 
    getFaqs, 
    updateFaqFeedback, 
    getHelpConfig,
    createFaq,
    updateFaq,
    deleteFaq,
    updateHelpConfig
} = require('../controllers/faqController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getFaqs);
router.get('/config', getHelpConfig);
router.post('/:id/feedback', updateFaqFeedback);

// Admin routes
router.post('/admin', protect, admin, createFaq);
router.put('/admin/config', protect, admin, updateHelpConfig);
router.route('/admin/:id')
    .put(protect, admin, updateFaq)
    .delete(protect, admin, deleteFaq);

module.exports = router;
