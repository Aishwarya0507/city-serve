const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Message = require("./models/Message");
const Booking = require("./models/Booking");
const { createNotification } = require("./controllers/notificationController");

if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: path.join(__dirname, ".env") });
}

console.log("--- System Diagnostics ---");
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`MONGO_URI: ${process.env.MONGO_URI ? "DETECTED" : "MISSING"}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? "DETECTED" : "MISSING"}`);
console.log("--------------------------");

const initializeServer = async () => {
    await connectDB();

    try {
        const mongoose = require("mongoose");
        if (mongoose.connection.readyState === 1) {
            const adminExists = await User.findOne({ role: "admin" });
            if (!adminExists) {
                await User.create({
                    name: "System Admin",
                    email: "admin@cityserve.com",
                    password: "admin123",
                    role: "admin"
                });
                console.log("✅ Default admin created: admin@cityserve.com / admin123");
            }
        }
    } catch (err) {
        console.log("⚠️  Admin auto-creation skipped:", err.message);
    }
};

initializeServer();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"]
    }
});

app.use(express.json());

app.use(cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

app.use((req, res, next) => {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1 && req.path.startsWith("/api")) {
        return res.status(503).json({
            message: "Database connection not established. Please check your MongoDB Atlas IP Whitelist settings."
        });
    }
    next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/availability", require("./routes/availabilityRoutes"));
app.use("/api/provider", require("./routes/providerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/subservices", require("./routes/subServiceRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/locations", require("./routes/locationRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/faqs", require("./routes/faqRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));
    
    app.use((req, res, next) => {
        if (!req.path.startsWith("/api")) {
            return res.sendFile(path.resolve(__dirname, "../client", "dist", "index.html"));
        }
        next();
    });
}

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) return next(new Error("Authentication error"));
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (err) {
        next(new Error("Authentication error"));
    }
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user?.name} (${socket.id})`);

    socket.on("join_room", async (bookingId) => {
        try {
            const booking = await Booking.findById(bookingId);
            if (!booking) return;

            if (booking.user.toString() !== socket.user._id.toString() && 
                booking.provider.toString() !== socket.user._id.toString()) {
                return;
            }

            socket.join(bookingId);
            console.log(`User ${socket.user.name} joined room: ${bookingId}`);

            await Message.updateMany(
                { booking: bookingId, receiver: socket.user._id, isRead: false },
                { isRead: true }
            );
            
            io.to(bookingId).emit("messages_read", { bookingId, readerId: socket.user._id });

        } catch (err) {
            console.error("Socket join_room error:", err);
        }
    });

    socket.on("send_message", async (data) => {
        const { bookingId, message, messageType = "text" } = data;
        try {
            const booking = await Booking.findById(bookingId);
            if (!booking) return;

            const receiverId = booking.user.toString() === socket.user._id.toString() 
                ? booking.provider 
                : booking.user;

            const newMessage = await Message.create({
                booking: bookingId,
                sender: socket.user._id,
                receiver: receiverId,
                message,
                messageType,
                isRead: false
            });

            io.to(bookingId).emit("receive_message", newMessage);

            const room = io.sockets.adapter.rooms.get(bookingId);
            const clientsCount = room ? room.size : 0;
            
            if (clientsCount < 2) {
                await createNotification(
                    receiverId,
                    `New message from ${socket.user.name} for booking #${bookingId.slice(-6).toUpperCase()}`,
                    "chat_message",
                    `/customer/bookings` 
                );
            }
        } catch (err) {
            console.error("Socket send_message error:", err);
        }
    });

    socket.on("mark_as_read", async (data) => {
        const { bookingId } = data;
        try {
            await Message.updateMany(
                { booking: bookingId, receiver: socket.user._id, isRead: false },
                { isRead: true }
            );
            io.to(bookingId).emit("messages_read", { bookingId, readerId: socket.user._id });
        } catch (err) {
            console.error("Socket mark_as_read error:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

console.log(`Debug: PORT from env is ${process.env.PORT}`);
const PORT = process.env.PORT || 5000;
console.log(`Attempting to start server on port: ${PORT}`);

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
