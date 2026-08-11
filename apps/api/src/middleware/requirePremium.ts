import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { isPremium } from "../services/subscriptionService.js";

export async function requirePremium(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    /*
     * requireAuth must run before requirePremium.
     */
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const premium = await isPremium(
      req.userId
    );

    if (!premium) {
      return res.status(403).json({
        success: false,
        code: "PREMIUM_REQUIRED",
        message:
          "Resolve Premium is required to access this feature.",
      });
    }

    next();
  } catch (error: any) {
    console.error(
      "❌ Premium entitlement check failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify Premium access.",
    });
  }
}