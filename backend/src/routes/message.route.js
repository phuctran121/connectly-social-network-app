import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  markMessagesAsRead,
  getStatusOfUserMessage,
  getConnectionsWithLastMessage,
  getUnreadMessagesCount,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/users/lastMessages", protectRoute, getConnectionsWithLastMessage);
router.get("/unreadMessagesCount", protectRoute, getUnreadMessagesCount);

router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.put("/read/:selectedId", protectRoute, markMessagesAsRead);

router.get("/status/:selectedId", protectRoute, getStatusOfUserMessage);

export default router;
