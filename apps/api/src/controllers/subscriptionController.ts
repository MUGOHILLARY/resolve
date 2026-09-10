import type { Request, Response } from "express";

import {
  ensureSubscription,
} from "../services/subscriptionService.js";

import {
  initializePaystackTransaction,
} from "../services/paystackService.js";

type CheckoutPlan = "monthly" | "yearly";

export async function getMySubscription(
  req: Request,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const subscription =
      await ensureSubscription(req.userId);

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
      message: "Failed to load subscription.",
    });
  }
}

/**
 * Initialize Paystack checkout.
 *
 * POST /api/subscription/checkout
 *
 * Body:
 * {
 *   "plan": "monthly"
 * }
 *
 * or:
 *
 * {
 *   "plan": "yearly"
 * }
 */
export async function createCheckout(
  req: Request,
  res: Response
) {
  try {
    /*
     * ---------------------------------------------------------------
     * Authentication
     * ---------------------------------------------------------------
     */

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /*
     * ---------------------------------------------------------------
     * User email
     * ---------------------------------------------------------------
     */

    const email = req.userEmail;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Authenticated user does not have an email address.",
      });
    }

    /*
     * ---------------------------------------------------------------
     * Validate plan
     * ---------------------------------------------------------------
     */

    const plan = req.body?.plan as CheckoutPlan;

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
     * ---------------------------------------------------------------
     * Prevent duplicate checkout for active Premium users
     * ---------------------------------------------------------------
     */

    const subscription =
      await ensureSubscription(req.userId);

    const premiumStatuses = [
      "active",
      "trialing",
    ];

    const isCurrentlyPremium =
      subscription.plan === "premium" &&
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
     * ---------------------------------------------------------------
     * Initialize Paystack transaction
     * ---------------------------------------------------------------
     */

    const checkout =
      await initializePaystackTransaction(
        email,
        plan,
        req.userId
      );

    console.log(
      "💳 Resolve Paystack checkout initialized:",
      {
        userId: req.userId,
        plan,
        reference: checkout.reference,
      }
    );

    /*
     * ---------------------------------------------------------------
     * Return checkout information to frontend
     * ---------------------------------------------------------------
     */

    return res.status(200).json({
      success: true,
      plan,
      authorization_url:
        checkout.authorization_url,
      access_code:
        checkout.access_code,
      reference:
        checkout.reference,
    });
  } catch (error: any) {
    console.error(
      "❌ Failed to initialize Paystack checkout:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to initialize Premium checkout.",
    });
  }
}