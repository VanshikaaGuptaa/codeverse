import express from "express";
import {
  sendMessage,
  getMessages,
  approveChat,
} from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/send", protectRoute, sendMessage);
router.get("/", protectRoute, getMessages);
router.post("/approve/:id", protectRoute, approveChat);

export default router;
