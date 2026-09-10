import { Router } from "express";

import {
  requireAuth,
} from "../middleware/requireAuth.js";

import {
  getMySubscription,
  createCheckout,
} from "../controllers/subscriptionController.js";

const router = Router();

/*
 * Current subscription
 *
 * GET /api/subscription
 */
router.get(
  "/",
  requireAuth,
  getMySubscription
);

/*
 * Initialize Paystack checkout
 *
 * POST /api/subscription/checkout
 */
router.post(
  "/checkout",
  requireAuth,
  createCheckout
);

export default router;