import { protectRoute } from "../middlewares/auth.middleware.js";
import express from "express";
import {
  getMessages,
  getUserForSidebar,
  sendMessages,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/user", protectRoute, getUserForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessages);

export default router;
