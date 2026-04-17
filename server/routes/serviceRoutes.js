const express = require('express');
const router = express.Router();
const {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
    getProviderServices,
    getRecommendedServices,
} = require('../controllers/serviceController');
const { protect, provider } = require('../middleware/authMiddleware');

router.route('/')
    .get(getServices)
    .post(protect, provider, createService);

router.get('/recommended', getRecommendedServices);
router.get('/provider', protect, provider, getProviderServices);
router.get('/my-services', protect, provider, getProviderServices);

router.route('/:id')
    .get(getServiceById)
    .put(protect, provider, updateService)
    .delete(protect, provider, deleteService);

module.exports = router;
