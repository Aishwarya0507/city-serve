const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "provider", "admin"], default: "user" },
    avatar: { type: String },
    phone: { type: String },
    
    // Geographical Hierarchy Structure
    country: { type: String },
    state: { type: String },
    district: { type: String },
    village: { type: String },
    
    address: {
        full_address: { type: String },
        landmark: { type: String },
        area: { type: String },
        city: { type: String },
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual("providerDetails", {
    ref: "Provider",
    localField: "_id",
    foreignField: "user",
    justOne: true
});

userSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
