import type { Request, Response } from "express";

import {
  ensureSubscription,
} from "../services/subscriptionService.js";

import {
  initializePaystackTransaction,
  initializeMpesaCharge,
} from "../services/paystackService.js";

type CheckoutPlan =
  | "monthly"
  | "yearly";

type MpesaPlan =
  | "monthly"
  | "yearly";

/*
|--------------------------------------------------------------------------
| GET CURRENT SUBSCRIPTION
|--------------------------------------------------------------------------
|
| GET /api/subscription
|
| Returns the authenticated user's current
| Resolve subscription.
|
|--------------------------------------------------------------------------
*/

export async function getMySubscription(
  req: Request,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const subscription =
      await ensureSubscription(
        req.userId
      );

    return res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error: any) {
    console.error(
      "❌ Failed to load subscription:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load subscription.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| CARD CHECKOUT
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
| or
|
| {
|   "plan": "yearly"
| }
|
| This is the existing Paystack recurring
| card subscription flow.
|
|--------------------------------------------------------------------------
*/

export async function createCheckout(
  req: Request,
  res: Response
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | User email
    |--------------------------------------------------------------------------
    */

    const email =
      req.userEmail;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Authenticated user does not have an email address.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate plan
    |--------------------------------------------------------------------------
    */

    const plan =
      req.body?.plan as CheckoutPlan;

    if (
      plan !== "monthly" &&
      plan !== "yearly"
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid plan. Choose "monthly" or "yearly".',
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Get or create Resolve subscription
    |--------------------------------------------------------------------------
    */

    const subscription =
      await ensureSubscription(
        req.userId
      );

    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate Premium checkout
    |--------------------------------------------------------------------------
    */

    const premiumStatuses = [
      "active",
      "trialing",
    ];

    const isCurrentlyPremium =
      subscription.plan ===
        "premium" &&
      premiumStatuses.includes(
        subscription.status
      );

    if (isCurrentlyPremium) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active Resolve Premium subscription.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Initialize Paystack recurring card checkout
    |--------------------------------------------------------------------------
    */

    const checkout =
      await initializePaystackTransaction(
        email,
        plan,
        req.userId
      );

    console.log(
      "💳 Resolve Paystack card checkout initialized:",
      {
        userId:
          req.userId,

        plan,

        reference:
          checkout.reference,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Return checkout information
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      plan,

      payment_method:
        "card",

      authorization_url:
        checkout.authorization_url,

      access_code:
        checkout.access_code,

      reference:
        checkout.reference,
    });
  } catch (error: any) {
    console.error(
      "❌ Failed to initialize Paystack card checkout:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to initialize Premium checkout.",
    });
  }
}

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
| or
|
| {
|   "plan": "yearly",
|   "phone": "+254712345678"
| }
|
| M-PESA is implemented as a one-time
| payment rather than a recurring Paystack
| subscription.
|
|--------------------------------------------------------------------------
*/

export async function createMpesaCheckout(
  req: Request,
  res: Response
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | User email
    |--------------------------------------------------------------------------
    */

    const email =
      req.userEmail;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Authenticated user does not have an email address.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate plan
    |--------------------------------------------------------------------------
    */

    const plan =
      req.body?.plan as MpesaPlan;

    if (
      plan !== "monthly" &&
      plan !== "yearly"
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid plan. Choose "monthly" or "yearly".',
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate phone
    |--------------------------------------------------------------------------
    */

    const phone =
      req.body?.phone;

    if (
      !phone ||
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "M-PESA phone number is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Get or create Resolve subscription
    |--------------------------------------------------------------------------
    */

    const subscription =
      await ensureSubscription(
        req.userId
      );

    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate Premium payment
    |--------------------------------------------------------------------------
    */

    const premiumStatuses = [
      "active",
      "trialing",
    ];

    const isCurrentlyPremium =
      subscription.plan ===
        "premium" &&
      premiumStatuses.includes(
        subscription.status
      );

    if (isCurrentlyPremium) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active Resolve Premium subscription.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Initialize M-PESA payment
    |--------------------------------------------------------------------------
    */

    const charge =
      await initializeMpesaCharge(
        email,
        phone,
        plan,
        req.userId
      );

    console.log(
      "📱 Resolve M-PESA payment initialized:",
      {
        userId:
          req.userId,

        plan,

        reference:
          charge.reference,

        status:
          charge.status,

        amount:
          charge.amount,

        currency:
          charge.currency,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Return M-PESA payment information
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      plan,

      payment_method:
        "mpesa",

      reference:
        charge.reference,

      status:
        charge.status,

      display_text:
        charge.display_text ??
        "Please check your phone and complete the M-PESA payment.",
    });
  } catch (error: any) {
    console.error(
      "❌ Failed to initialize M-PESA payment:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ??
        "Unable to initialize M-PESA payment.",
    });
  }
}