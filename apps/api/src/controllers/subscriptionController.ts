import type { Request, Response } from "express";

import {
  ensureSubscription,
} from "../services/subscriptionService.js";

/*
|--------------------------------------------------------------------------
| GET /api/subscription
|--------------------------------------------------------------------------
|
| Returns the authenticated user's subscription.
|
| If the user does not yet have a subscription,
| automatically creates a free subscription.
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
        message: "Authentication required.",
      });
    }

    const subscription = await ensureSubscription(
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
      message: "Failed to load subscription.",
    });
  }
}