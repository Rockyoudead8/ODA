// const Server = require("socket.io").Server;
// const passport = require("passport");
// const express = require("express");
// const http = require("http");



// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     // origin: [ENV.CLIENT_URL],
//     origin: 'http://localhost:3000', // React's port
//     credentials: true
//   },
// });

// // we will use this function to check if the user is online or not
// const getReceiverSocketId = function (userId) {
//   return userSocketMap[userId];
// }

// // this is for storig online users
// const userSocketMap = {}; // {userId:socketId}

// function onlyForHandshake(middleware) {
//   return (req, res, next) => {
//     if (!req._query.sid) {
//       middleware(req, res, next);
//     } else {
//       next();
//     }
//   };
// }

// io.engine.use(
//   onlyForHandshake((req, res, next) => {
//     passport.authenticate("jwt", { session: false }, (err, user) => {
//       if (err || !user) {
//         res.writeHead(401);
//         return res.end();
//       }

//       req.user = user;
//       next();
//     })(req, res, next);
//   })
// );

// io.on("connection", (socket) => {
//   const user = socket.request.user;
//   const userId = user._id.toString();

//   console.log("A user connected", user.fullName);

//   userSocketMap[userId] = socket.id;

//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("send_message", (message) => {
//     const receiverSocketId = userSocketMap[message.receiverId.toString()];

//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("receive_message", message);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected", user.fullName);

//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// module.exports = {
//   app,
//   server,
//   getReceiverSocketId,
// };

const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

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

// ✅ SOCKET AUTH (READ COOKIE JWT)
io.use((socket, next) => {
  const cookies = socket.handshake.headers.cookie;

  if (!cookies) return next(new Error("No cookies"));

  const parsed = cookie.parse(cookies);
  const token = parsed.jwt;

  if (!token) return next(new Error("No token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // contains { id: ... }
    next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user.id.toString(); // ⚠️ payload.id

  console.log("User connected:", userId);

  userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("send_message", (message) => {
    const receiverSocketId = userSocketMap[message.receiverId.toString()];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", message);
    }
  });

  socket.on("typing", ({ to, from }) => {
    io.to(to).emit("typing", { from });
  });

  socket.on("disconnect",async () => {
    console.log("User disconnected:", userId);

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    await User.findByIdAndUpdate(socket.userId, {
      lastSeen: new Date(),
    });
  });

  
});

module.exports = {
  app,
  server,
  getReceiverSocketId,
};