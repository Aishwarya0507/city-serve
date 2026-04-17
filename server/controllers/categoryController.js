const ServiceCategory = require("../models/Category");

// @desc Get all categories (Public / Unified)
const getCategories = async (req, res) => {
    try {
        // We fetch ALL categories because "isActive" is no longer tracked separately
        const categories = await ServiceCategory.find({}).sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all categories (Admin)
const getAllCategories = async (req, res) => {
    try {
        const categories = await ServiceCategory.find({}).sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Create a new category (admin)
const createCategory = async (req, res) => {
    const { name, image, description } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    try {
        const category = await ServiceCategory.create({
            name,
            image, 
            description,
            isActive: true
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const category = await ServiceCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update category (admin)
const updateCategory = async (req, res) => {
    try {
        const category = await ServiceCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete category (admin)
const deleteCategory = async (req, res) => {
    try {
        const category = await ServiceCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        await category.deleteOne();
        res.json({ message: "Category removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getCategories, 
    getAllCategories, 
    createCategory, 
    getCategoryById, 
    updateCategory, 
    deleteCategory 
};
