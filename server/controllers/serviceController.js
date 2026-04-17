const Service = require('../models/Service');
const Category = require('../models/Category');

const createService = async (req, res) => {
    const { 
        title, description, price, category, subCategory, 
        country, state, district, village, experience, image,
        duration, bufferTime, covered_areas, landmark, 
        distance_from_landmark, estimated_time, map_link 
    } = req.body;
    
    try {
        const service = await Service.create({
            provider: req.user._id,
            title,
            description,
            price,
            category,
            subCategory,
            country,
            state,
            district,
            village,
            location: village || district || state || "Remote",
            experience,
            image,
            duration: duration || 60,
            bufferTime: bufferTime || 15,
            status: "approved",
            covered_areas,
            landmark,
            distance_from_landmark,
            estimated_time,
            map_link
        });
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getServices = async (req, res) => {
    try {
        const { category, subCategory, country, state, district, village, location } = req.query;
        let query = { status: "approved" };
        
        if (category) query.category = category;
        if (subCategory) query.subCategory = subCategory;

        const locationFilters = [];
        if (village) locationFilters.push({ village });
        if (district) locationFilters.push({ district });
        if (state) locationFilters.push({ state });
        
        if (locationFilters.length > 0) {
            query.$or = [
               ...locationFilters,
               { village: { $exists: false } },
               { district: { $exists: false } }
            ];
        }

        const services = await Service.find(query).populate("provider", "name");
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProviderServices = async (req, res) => {
    try {
        const services = await Service.find({ provider: req.user._id });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate("provider", "name");
        if (!service) return res.status(404).json({ message: "Service not found" });
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: "Service not found" });
        
        if (service.provider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const updatedService = await Service.findByIdAndUpdate(req.params.id, {
            ...req.body,
            location: req.body.village || req.body.district || req.body.state || service.location,
            status: "approved"
        }, { new: true });
        
        res.json(updatedService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: "Service not found" });
        if (service.provider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized access" });
        }
        await service.deleteOne();
        res.json({ message: "Service removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRecommendedServices = async (req, res) => {
    try {
        const services = await Service.find({ status: "approved" }).limit(6).populate("provider", "name");
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createService, 
    getServices, 
    getServiceById, 
    updateService, 
    deleteService, 
    getProviderServices, 
    getRecommendedServices 
};
