import { Router } from "express";

import { requireAuth } from "../middleware/requireAuth.js";
import { requirePremium } from "../middleware/requirePremium.js";

import {
  chat,
  getHistory,
  deleteHistory,
} from "../controllers/chatController.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| AI Chat
|--------------------------------------------------------------------------
| Resolve AI Coach is a Premium feature.
|
| Authentication:
|   requireAuth
|
| Premium entitlement:
|   requirePremium
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  requireAuth,
  requirePremium,
  chat
);

/*
|--------------------------------------------------------------------------
| Chat History
|--------------------------------------------------------------------------
| Chat history belongs to the AI Coach feature,
| so it is also Premium-protected.
|--------------------------------------------------------------------------
*/

router.get(
  "/history",
  requireAuth,
  requirePremium,
  getHistory
);

router.delete(
  "/history",
  requireAuth,
  requirePremium,
  deleteHistory
);

export default router;