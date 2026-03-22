const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // null for group messages
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // null for direct messages
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ensure every message targets either a user OR a group, not neither
messageSchema.pre("save", function (next) {
  if (!this.receiverId && !this.groupId) {
    return next(new Error("Message must have either receiverId or groupId"));
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;