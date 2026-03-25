// const Message = require("../models/messages");
// const User = require("../models/users");
// const cloudinary = require("../config/cloudinary");

// exports.getMessagesByUserId = async (req, res) => {
//     try {
//         console.log("getMessagesByUserId called with user ID: ", req.params.id);
//         const myId = req.user._id;
//         const id = req.params.id;

//         const messages = await Message.find({
//             $or: [
//                 { senderId: myId, receiverId: id },
//                 { senderId: id, receiverId: myId }
//             ]
//         }).sort({ createdAt: 1 });

//         res.status(200).json(messages);
//     }
//     catch (err) {
//         console.error("Error in getMessagesByUserId: ");
//         // console.error(err.message);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }

// exports.sendMessage = async (req, res) => {
//     try {
//         const { text, image } = req.body;
//         const sender = req.user._id;
//         const receiver = req.params.id;

//         if (!text && !image) {
//             return res.status(400).json({ message: "Text or image is required." });
//         }

//         if (sender.equals(receiver)) {
//             return res.status(400).json({ message: "Cannot send messages to yourself." });
//         }

//         let imageUrl;

//         if (image) {
//             // upload base64 image to cloudinary
//             const uploadResponse = await cloudinary.uploader.upload(image);
//             imageUrl = uploadResponse.secure_url;
//         }

//         // const newMessage = new Message({
//         //     senderId,
//         //     receiverId,
//         //     text,
//         //     image: imageUrl,
//         // });

//         const newMessage = new Message({
//             senderId: sender,
//             receiverId: receiver,
//             text,
//             image: imageUrl,
//         });

//         await newMessage.save();
//         res.status(200).json(newMessage);

//     }
//     catch (err) {
//         console.error(err.message);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }

// exports.getChatPartners = async (req, res) => {
//     console.log("getChatPartners called");
//     try {
//         const loggedInUserId = req.user._id;

//         console.log("Logged in user ID: ", loggedInUserId);

//         // find all the messages where the logged-in user is either sender or receiver
//         const messages = await Message.find({
//             $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
//         });

//         const chatPartnerIds = [
//             ...new Set(
//                 messages.map((msg) =>
//                     msg.senderId.toString() === loggedInUserId.toString()
//                         ? msg.receiverId.toString()
//                         : msg.senderId.toString()
//                 )
//             ),
//         ];

//         const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-hash -salt ");

//         res.status(200).json(chatPartners);
//     }
//     catch (err) {
//         console.error("Error in getChatPartners: ", err.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// }

const Message = require("../models/messages");
const User = require("../models/users");
const cloudinary = require("../config/cloudinary");

exports.getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const id = req.params.id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: id },
        { senderId: id, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const sender = req.user._id;
    const receiver = req.params.id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image required" });
    }

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: sender,
      receiverId: receiver,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    res.status(200).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getChatPartners = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId },
        { receiverId: loggedInUserId },
      ],
    }).sort({ createdAt: -1 });

    const partnerMap = new Map();

    for (let msg of messages) {
      if (!msg.senderId || !msg.receiverId || !msg.createdAt) continue;

      const partnerId =
        msg.senderId.toString() === loggedInUserId.toString()
          ? msg.receiverId.toString()
          : msg.senderId.toString();

      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, msg.createdAt);
      }
    }

    const sortedPartnerIds = Array.from(partnerMap.entries())
      .sort((a, b) => new Date(b[1]) - new Date(a[1]))
      .map(([id]) => id);

    const chatPartners = await User.find({
      _id: { $in: sortedPartnerIds },
    }).select("-hash -salt");

    const sortedUsers = sortedPartnerIds.map((id) =>
      chatPartners.find((u) => u._id.toString() === id)
    ).filter(Boolean); // remove any undefined

    res.status(200).json(sortedUsers);
  } catch (err) {
    console.error(err); // 🔥 log error
    res.status(500).json({ error: "Internal server error" });
  }
};