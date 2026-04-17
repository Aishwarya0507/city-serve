const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ["country", "state", "district", "village"] 
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Location", 
    default: null 
  },
  status: { type: String, enum: ["approved", "pending"], default: "approved" },
}, { timestamps: true });

// Remove the unique index on city_name if it persists
locationSchema.index({ city_name: 1 }, { unique: false, sparse: true });

module.exports = mongoose.model("Location", locationSchema);
