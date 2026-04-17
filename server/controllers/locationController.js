const Location = require("../models/Location");

// @desc Get locations by parent (public)
const getLocations = async (req, res) => {
    try {
        const { parentId, type } = req.query;
        let query = { status: "approved" };
        if (parentId) query.parentId = parentId;
        else if (type) query.type = type; // e.g. get all countries
        
        const locations = await Location.find(query);
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Add a location (admin)
const addLocation = async (req, res) => {
    const { name, type, parentId } = req.body;
    try {
        const location = await Location.create({
            name,
            type,
            parentId: parentId || null,
            status: "approved"
        });
        res.status(201).json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update a location (admin)
const updateLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete a location (admin)
const deleteLocation = async (req, res) => {
    try {
        await Location.findByIdAndDelete(req.params.id);
        res.json({ message: "Location removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLocations, addLocation, updateLocation, deleteLocation };
