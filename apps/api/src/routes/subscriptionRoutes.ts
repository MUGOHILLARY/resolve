import { Router } from "express";

import {
  requireAuth,
} from "../middleware/requireAuth.js";

import {
  getMySubscription,
  createCheckout,
  createMpesaCheckout,
} from "../controllers/subscriptionController.js";

const router =
  Router();

/*
|--------------------------------------------------------------------------
| CURRENT SUBSCRIPTION
|--------------------------------------------------------------------------
|
| GET /api/subscription
|
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  requireAuth,
  getMySubscription
);

/*
|--------------------------------------------------------------------------
| PAYSTACK CARD CHECKOUT
|--------------------------------------------------------------------------
|
| POST /api/subscription/checkout
|
| Existing recurring card subscription flow.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/checkout",
  requireAuth,
  createCheckout
);

/*
|--------------------------------------------------------------------------
| M-PESA CHECKOUT
|--------------------------------------------------------------------------
|
| POST /api/subscription/mpesa
|
| Body:
|
| {
|   "plan": "monthly",
|   "phone": "0712345678"
| }
|
|--------------------------------------------------------------------------
*/

router.post(
  "/mpesa",
  requireAuth,
  createMpesaCheckout
);

export default router;