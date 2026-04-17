const FAQ = require('../models/FAQ');
const SupportSetting = require('../models/SupportSetting');

// @desc    Get all FAQs with filters
// @route   GET /api/faqs
const getFaqs = async (req, res) => {
    const { role, category, search } = req.query;
    let query = {};

    if (role && role !== 'all') {
        query.role = role;
    }

    if (category) {
        query.category = category;
    }

    if (search) {
        query.$or = [
            { question: { $regex: search, $options: 'i' } },
            { answer: { $regex: search, $options: 'i' } }
        ];
    }

    try {
        const faqs = await FAQ.find(query).sort({ is_highlighted: -1, createdAt: -1 });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update FAQ feedback
// @route   POST /api/faqs/:id/feedback
const updateFaqFeedback = async (req, res) => {
    const { type } = req.body; // 'yes' or 'no'

    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        if (type === 'yes') {
            faq.feedback.yes += 1;
        } else if (type === 'no') {
            faq.feedback.no += 1;
        }

        await faq.save();
        res.json({ message: 'Feedback updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Help Center Config
// @route   GET /api/faqs/config
const getHelpConfig = async (req, res) => {
    try {
        let config = await SupportSetting.findOne({ is_active: true });
        if (!config) {
            config = await SupportSetting.create({}); 
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin Functions
const createFaq = async (req, res) => {
    try {
        const faq = await FAQ.create(req.body);
        res.status(201).json(faq);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateFaq = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(faq);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteFaq = async (req, res) => {
    try {
        await FAQ.findByIdAndDelete(req.params.id);
        res.json({ message: 'FAQ removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateHelpConfig = async (req, res) => {
    try {
        let config = await SupportSetting.findOne({ is_active: true });
        if (config) {
            config = await SupportSetting.findByIdAndUpdate(config._id, req.body, { new: true });
        } else {
            config = await SupportSetting.create(req.body);
        }
        res.json(config);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getFaqs,
    updateFaqFeedback,
    getHelpConfig,
    createFaq,
    updateFaq,
    deleteFaq,
    updateHelpConfig
};
