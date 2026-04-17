const express = require("express");
const router = express.Router();
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getAllCategories,
} = require("../controllers/categoryController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/")
    .get(getCategories)
    .post(protect, admin, createCategory);

router.get("/all", getAllCategories);

router.route("/:id")
    .get(getCategoryById)
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

module.exports = router;
