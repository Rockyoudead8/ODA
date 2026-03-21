const Server = require("socket.io").Server;
const passport = require("passport");
const express = require("express");
const http = require("http");



const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: [ENV.CLIENT_URL],
    origin: 'http://localhost:3000', // React's port
    credentials: true
  },
});

// we will use this function to check if the user is online or not
const getReceiverSocketId = function(userId) {
  return userSocketMap[userId];
}

// this is for storig online users
const userSocketMap = {}; // {userId:socketId}

function onlyForHandshake(middleware) {
  return (req, res, next) => {
    if (!req._query.sid) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
}

io.engine.use(
  onlyForHandshake((req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err || !user) {
        res.writeHead(401);
        return res.end();
      }

      req.user = user;
      next();
    })(req, res, next);
  })
);

io.on("connection", (socket) => {
  console.log("A user connected", socket.request.user.fullName);
  const user = socket.request.user;
  const userId = socket.request.user.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.request.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

});

module.exports = {
  app,
  server,
  getReceiverSocketId,
};