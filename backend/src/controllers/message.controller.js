import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      io.to(receiverSocketId).emit("newMessageLocal", newMessage);
      io.to(receiverSocketId).emit("newMessageNotification", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getConnectionsWithLastMessage = async (req, res) => {
  try {
    const userId = req.user._id;

    // Lấy user với các connections đã được populate
    const user = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections"
    );

    // Lấy tin nhắn gần nhất cho mỗi connection
    const connectionsWithLastMessage = await Promise.all(
      user.connections.map(async (connection) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: connection._id },
            { senderId: connection._id, receiverId: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .select("createdAt isRead senderId receiverId text");

        return {
          ...connection.toObject(),
          lastMessageTime: lastMessage ? lastMessage.createdAt : null,
          isRead: lastMessage ? lastMessage.isRead : null,
          lastMessageSenderId: lastMessage ? lastMessage.senderId : null,
          lastMessageReceiverId: lastMessage ? lastMessage.receiverId : null,
          text: lastMessage ? lastMessage.text : null,
        };
      })
    );

    // Sắp xếp connections theo thời gian tin nhắn gần nhất
    connectionsWithLastMessage.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.json(connectionsWithLastMessage);
  } catch (error) {
    console.error(
      "Error in getUserConnectionsWithLastMessage controller:",
      error
    );
    res.status(500).json({ message: "Server error" });
  }
};

export const getStatusOfUserMessage = async (req, res) => {
  try {
    const { selectedId } = req.params;
    const myId = req.user._id;

    const message = await Message.findOne({
      senderId: selectedId,
      receiverId: myId,
      isRead: false,
    }).sort({ createdAt: -1 });

    if (message) {
      res.status(200).json({ isRead: false });
    } else {
      res.status(200).json({ isRead: true });
    }
  } catch (error) {
    console.log("Error in getStatusOfMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { selectedId } = req.params;
    const myId = req.user._id;

    const updatedMessages = await Message.updateMany(
      {
        senderId: selectedId,
        receiverId: myId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );
    if (updatedMessages.modifiedCount === 0) {
      return res.status(200).json({ message: "No messages to mark as read" });
    }
    // Lấy socketId của selectedId để thông báo qua WebSocket (nếu cần)
    const senderSocketId = getReceiverSocketId(selectedId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        userId: myId,
        messageId: selectedId,
      });
    }

    res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: updatedMessages.modifiedCount,
    });
  } catch (error) {
    console.error("Error in markMessagesAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUnreadMessagesCount = async (req, res) => {
  try {
    const myId = req.user._id;

    const unreadCount = await Message.aggregate([
      {
        $match: {
          receiverId: myId,
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$senderId", // Nhóm theo senderId
        },
      },
      {
        $count: "totalSenders", // Đếm số lượng senderId duy nhất
      },
    ]);

    const count = unreadCount.length > 0 ? unreadCount[0].totalSenders : 0;

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error(
      "Error in getUnreadMessagesCount controller: ",
      error.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};
