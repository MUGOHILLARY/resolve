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
| CURRENT SUBSCRIPTION + ENTITLEMENTS
|--------------------------------------------------------------------------
|
| GET /api/subscription
|
| Returns:
|
| {
|   subscription,
|   premium,
|   entitlements
| }
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
| Body:
|
| {
|   "plan": "monthly"
| }
|
| or:
|
| {
|   "plan": "yearly"
| }
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