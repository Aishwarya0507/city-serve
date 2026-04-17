const mongoose = require("mongoose");

const subServiceSchema = mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const SubService = mongoose.model("SubService", subServiceSchema);
module.exports = SubService;
