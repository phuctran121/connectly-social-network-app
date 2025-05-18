import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === userId) {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself" });
    }

    if (req.user.connections.includes(userId)) {
      return res.status(400).json({ message: "You are already connected" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      sender: senderId,
      recipient: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A connection request already exists" });
    }

    const newRequest = new ConnectionRequest({
      sender: senderId,
      recipient: userId,
    });

    await newRequest.save();

    const receiverSocketId = getReceiverSocketId(userId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newConnectionRequest");
    }

    res.status(201).json({ message: "Connection request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ConnectionRequest.findById(requestId)
      .populate("sender", "name email username")
      .populate("recipient", "name username");

    if (!request) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    // check if the req is for the current user
    if (request.recipient._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    request.status = "accepted";
    await request.save();

    // if im your friend then ur also my friend ;)
    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { connections: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { connections: request.sender._id },
    });

    const notification = new Notification({
      recipient: request.sender._id,
      type: "connectionAccepted",
      relatedUser: userId,
    });

    await notification.save();

    const receiverSocketId = getReceiverSocketId(request.sender._id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newAcceptedConnectionRequest");
    }

    res.json({ message: "Connection accepted successfully" });
  } catch (error) {
    console.error("Error in acceptConnectionRequest controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ConnectionRequest.findById(requestId);

    if (request.recipient.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "Connection request rejected" });
  } catch (error) {
    console.error("Error in rejectConnectionRequest controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      recipient: userId,
      status: "pending",
    }).populate("sender", "name username profilePicture headline connections");

    res.json(requests);
  } catch (error) {
    console.error("Error in getConnectionRequests controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections"
    );

    res.json(user.connections);
  } catch (error) {
    console.error("Error in getUserConnections controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getConnectionsWithLastMessage = async (req, res) => {
  // const userId = req.user.id; // Giả sử bạn có middleware để lấy userId từ token
  const userId = "67d14b72906c57e3b3118771";
  try {
    const user = await User.findById(userId).populate("connections");
    const connections = user.connections;
    // Lấy tin nhắn gần nhất cho mỗi connection
    const connectionsWithLastMessage = await Promise.all(
      connections.map(async (connection) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: connection._id },
            { senderId: connection._id, receiverId: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .select("createdAt");

        return {
          ...connection.toObject(),
          lastMessageTime: lastMessage ? lastMessage.createdAt : null,
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
    res.status(500).json({ message: "Server error" });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    await User.findByIdAndUpdate(myId, { $pull: { connections: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { connections: myId } });

    res.json({ message: "Connection removed successfully" });
  } catch (error) {
    console.error("Error in removeConnection controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const currentUser = req.user;
    if (currentUser.connections.includes(targetUserId)) {
      return res.json({ status: "connected" });
    }

    const pendingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        return res.json({ status: "pending", requestId: pendingRequest._id });
      } else {
        return res.json({ status: "received", requestId: pendingRequest._id });
      }
    }

    // if no connection or pending req found
    res.json({ status: "not_connected" });
  } catch (error) {
    console.error("Error in getConnectionStatus controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (request.sender.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    await ConnectionRequest.deleteOne({ _id: requestId });

    const receiverSocketId = getReceiverSocketId(request.recipient.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("connectionRequestCanceled", { requestId });
    }

    res.json({ message: "Connection request canceled successfully" });
  } catch (error) {
    console.error("Error in cancelConnectionRequest controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
