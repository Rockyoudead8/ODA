const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Group = require("../models/Group"); // ← NEW

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

const userSocketMap = {};

const getReceiverSocketId = (userId) => userSocketMap[userId];

// ── SOCKET AUTH (read cookie JWT) ─────────────────────────────────────────────
io.use((socket, next) => {
  const cookies = socket.handshake.headers.cookie;
  if (!cookies) return next(new Error("No cookies"));

  const parsed = cookie.parse(cookies);
  const token = parsed.jwt;
  if (!token) return next(new Error("No token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { id: ... }
    next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", async (socket) => {
  const userId = socket.user.id.toString();

  console.log("User connected:", userId);

  userSocketMap[userId] = socket.id;

  // ── Join all existing group rooms for this user ───────────────────────
  try {
    const groups = await Group.find({ members: userId }).select("_id");
    groups.forEach((g) => socket.join(g._id.toString()));
  } catch (err) {
    console.error("Error joining group rooms:", err.message);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ── Direct message (client-side relay, already saved via REST) ────────
  socket.on("send_message", (message) => {
    const receiverSocketId = userSocketMap[message.receiverId?.toString()];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", message);
    }
  });

  // ── Typing indicator (direct chats only) ─────────────────────────────
  socket.on("typing", ({ to, from }) => {
    const receiverSocketId = userSocketMap[to?.toString()];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from });
    }
  });

  // ── Disconnect ────────────────────────────────────────────────────────
  socket.on("disconnect", async () => {
    console.log("User disconnected:", userId);

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    try {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    } catch (_) {}
  });
});

module.exports = {
  app,
  server,
  io,            // ← exported so controllers can emit from REST handlers
  userSocketMap, // ← exported so group controller can add sockets to rooms
  getReceiverSocketId,
};