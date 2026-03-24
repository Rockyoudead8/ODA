const Group = require("../models/Group");
const Message = require("../models/messages");
const cloudinary = require("../config/cloudinary");

// POST /api/groups  — create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const createdBy = req.user._id;

    if (!name || !memberIds || memberIds.length < 1) {
      return res
        .status(400)
        .json({ error: "Group name and at least one member are required" });
    }

    // Always include the creator in members (dedup with Set)
    const allMembers = [
      ...new Set([...memberIds, createdBy.toString()]),
    ];

    const group = new Group({ name, members: allMembers, createdBy });
    await group.save();

    // ── Socket: add online members to the room & notify them ─────────────
    try {
      const { io, userSocketMap } = require("../config/socket");

      allMembers.forEach((memberId) => {
        const socketId = userSocketMap[memberId.toString()];
        if (socketId) {
          const memberSocket = io.sockets.sockets.get(socketId);
          if (memberSocket) memberSocket.join(group._id.toString());
          // Notify so their sidebar refreshes in real-time
          io.to(socketId).emit("new_group", group);
        }
      });
    } catch (_) {
      // Socket errors must never block the HTTP response
    }

    res.status(201).json(group);
  } catch (err) {
    console.error("createGroup error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/groups  — all groups the logged-in user belongs to
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id }).sort({
      updatedAt: -1,
    });
    res.json(groups);
  } catch (err) {
    console.error("getGroups error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/groups/:id/messages
exports.getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ error: "Forbidden" });

    const messages = await Message.find({ groupId: id })
      .populate("senderId", "name profilePhoto")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("getGroupMessages error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// POST /api/groups/:id/send
exports.sendGroupMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id } = req.params; // groupId
    const sender = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image required" });
    }

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const isMember = group.members.some(
      (m) => m.toString() === sender.toString()
    );
    if (!isMember) return res.status(403).json({ error: "Forbidden" });

    let imageUrl;
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const newMessage = new Message({
      senderId: sender,
      groupId: id,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Populate sender before broadcasting
    const populated = await Message.findById(newMessage._id).populate(
      "senderId",
      "name profilePhoto"
    );

    // ── Socket: broadcast to the whole group room ─────────────────────────
    try {
      const { io } = require("../config/socket");
      io.to(id).emit("receive_group_message", populated);
    } catch (_) {}

    res.json(populated);
  } catch (err) {
    console.error("sendGroupMessage error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// DELETE /api/groups/:id/leave  — logged-in user leaves a group
exports.leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const isMember = group.members.some(
      (m) => m.toString() === userId.toString()
    );
    if (!isMember) return res.status(403).json({ error: "Not a member of this group" });

    // Remove the user from the members array
    group.members = group.members.filter(
      (m) => m.toString() !== userId.toString()
    );
    await group.save();

    // ── Socket: notify remaining members & remove user from room ──────────
    try {
      const { io, userSocketMap } = require("../config/socket");

      // Broadcast to the room so other members update their member count
      io.to(id).emit("group_member_left", {
        groupId: id,
        userId: userId.toString(),
      });

      // Remove the leaving user's socket from the Socket.IO room
      const socketId = userSocketMap[userId.toString()];
      if (socketId) {
        const userSocket = io.sockets.sockets.get(socketId);
        if (userSocket) userSocket.leave(id);
      }
    } catch (_) {
      // Socket errors must never block the HTTP response
    }

    res.json({ message: "Left group successfully" });
  } catch (err) {
    console.error("leaveGroup error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};