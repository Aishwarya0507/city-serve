const express = require("express");
const router = express.Router();
const { getLocations, addLocation, updateLocation, deleteLocation } = require("../controllers/locationController");
const { protect, admin } = require("../middleware/authMiddleware");

// @desc Get locations by parent or type (public)
router.get("/", getLocations);

// @desc Add a location (admin only)
router.post("/", protect, admin, addLocation);

// @desc Update/Delete location (admin only)
router.route("/:id")
    .put(protect, admin, updateLocation)
    .delete(protect, admin, deleteLocation);

module.exports = router;
