import { Router } from "express";

import { requireAuth } from "../middleware/requireAuth.js";

import {
  getMySubscription,
} from "../controllers/subscriptionController.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  getMySubscription
);

export default router;