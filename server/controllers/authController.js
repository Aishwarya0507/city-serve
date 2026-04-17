const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
const registerUser = async (req, res) => {
    const { name, email, password, role, country, state, district, village } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide name, email, and password." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase();
    try {
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ 
            name, 
            email: normalizedEmail, 
            password, 
            role,
            country,
            state,
            district,
            village
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                country: user.country,
                state: user.state,
                district: user.district,
                village: user.village,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
const authUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password." });
    }

    const normalizedEmail = email.toLowerCase();
    try {
        const user = await User.findOne({ email: normalizedEmail });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                country: user.country,
                state: user.state,
                district: user.district,
                village: user.village,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
                country: user.country,
                state: user.state,
                district: user.district,
                village: user.village
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.country = req.body.country || user.country;
            user.state = req.body.state || user.state;
            user.district = req.body.district || user.district;
            user.village = req.body.village || user.village;

            if (req.body.password) {
                user.password = req.body.password;
            }

            if (req.body.address) {
                user.address = {
                    ...user.address?.toObject?.() || {},
                    ...req.body.address
                };
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                address: updatedUser.address,
                country: updatedUser.country,
                state: updatedUser.state,
                district: updatedUser.district,
                village: updatedUser.village,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, authUser, getUserProfile, updateUserProfile };
