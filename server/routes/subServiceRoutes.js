const express = require("express");
const router = express.Router();
const {
    getSubServicesByCategory,
    getAllSubServices,
    addSubService,
    updateSubService,
    deleteSubService,
} = require("../controllers/subServiceController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/")
    .get(getAllSubServices)
    .post(protect, admin, addSubService);

router.get("/category/:categoryId", getSubServicesByCategory);

router.route("/:id")
    .put(protect, admin, updateSubService)
    .delete(protect, admin, deleteSubService);

module.exports = router;
