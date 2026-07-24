import { Router } from "express";

import { requireAuth } from "../middleware/requireAuth.js";
import {
  chat,
  getHistory,
  deleteHistory,
} from "../controllers/chatController.js";

const router = Router();

router.post("/", requireAuth, chat);

router.get("/history", requireAuth, getHistory);

router.delete("/history", requireAuth, deleteHistory);

export default router;