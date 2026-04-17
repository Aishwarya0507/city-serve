const SubService = require("../models/SubService");

// @desc Get subservices for a specific category
const getSubServicesByCategory = async (req, res) => {
    try {
        const subServices = await SubService.find({ categoryId: req.params.categoryId, isActive: true });
        res.json(subServices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all subservices (public list for providers)
const getAllSubServices = async (req, res) => {
    try {
        const subServices = await SubService.find({ isActive: true });
        res.json(subServices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Add a subservice (admin)
const addSubService = async (req, res) => {
    const { categoryId, name, description } = req.body;
    if (!categoryId || !name) return res.status(400).json({ message: "Category ID and Name are required" });
    try {
        const subService = await SubService.create({
            categoryId,
            name,
            description,
            isActive: true
        });
        res.status(201).json(subService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update a subservice (admin)
const updateSubService = async (req, res) => {
    try {
        const subService = await SubService.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!subService) return res.status(404).json({ message: "SubService not found" });
        res.json(subService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete a subservice (admin)
const deleteSubService = async (req, res) => {
    try {
        const subService = await SubService.findByIdAndDelete(req.params.id);
        if (!subService) return res.status(404).json({ message: "SubService not found" });
        res.json({ message: "SubService removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSubServicesByCategory,
    getAllSubServices,
    addSubService,
    updateSubService,
    deleteSubService
};
