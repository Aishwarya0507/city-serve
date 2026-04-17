const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String }, // For category display imagery
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
