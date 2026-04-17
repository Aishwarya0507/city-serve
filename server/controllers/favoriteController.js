const Favorite = require('../models/Favorite');

const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user._id })
            .populate({
                path: 'service',
                populate: { path: 'provider', select: 'name' }
            });
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleFavorite = async (req, res) => {
    const { serviceId } = req.body;
    try {
        const existing = await Favorite.findOne({ user: req.user._id, service: serviceId });
        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            res.json({ message: 'Removed from favorites', isFavorite: false });
        } else {
            const favorite = await Favorite.create({ user: req.user._id, service: serviceId });
            res.status(201).json({ message: 'Added to favorites', isFavorite: true, favorite });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.findById(req.params.id);
        if (favorite) {
            if (favorite.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await Favorite.findByIdAndDelete(req.params.id);
            res.json({ message: 'Removed from favorites' });
        } else {
            res.status(404).json({ message: 'Favorite not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFavorites,
    toggleFavorite,
    removeFavorite,
};
