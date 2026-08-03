import { Router } from "express";

import { requireAuth } from "../middleware/requireAuth";

import {
  getBlockerSettings,
} from "../controllers/blockerController";

const router = Router();

router.get(
  "/settings",
  requireAuth,
  getBlockerSettings
);

export default router;