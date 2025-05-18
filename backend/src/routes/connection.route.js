import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptConnectionRequest,
  getConnectionRequests,
  getConnectionStatus,
  getUserConnections,
  getConnectionsWithLastMessage,
  rejectConnectionRequest,
  removeConnection,
  sendConnectionRequest,
  cancelConnectionRequest,
} from "../controllers/connection.controller.js";

const router = express.Router();

router.post("/request/:userId", protectRoute, sendConnectionRequest);
router.put("/accept/:requestId", protectRoute, acceptConnectionRequest);
router.put("/reject/:requestId", protectRoute, rejectConnectionRequest);
// Get all connection requests for the current user
router.get("/requests", protectRoute, getConnectionRequests);
// Get all connections for a user
router.get("/", protectRoute, getUserConnections);
router.get("/users/lastMessage", getConnectionsWithLastMessage);

router.delete("/:userId", protectRoute, removeConnection);
router.get("/status/:userId", protectRoute, getConnectionStatus);
router.delete("/cancel/:requestId", protectRoute, cancelConnectionRequest);
export default router;
