import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  isPremium,
} from "../services/subscriptionService.js";

/*
|--------------------------------------------------------------------------
| REQUIRE PREMIUM
|--------------------------------------------------------------------------
|
| This middleware protects Premium-only API endpoints.
|
| IMPORTANT:
|
| requireAuth MUST execute before requirePremium.
|
| Example:
|
| router.get(
|   "/analytics/advanced",
|   requireAuth,
|   requirePremium,
|   controller
| );
|
|--------------------------------------------------------------------------
*/

export async function requirePremium(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authentication check
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
    | Premium entitlement check
    |--------------------------------------------------------------------------
    */

    const premium =
      await isPremium(
        req.userId
      );

    /*
    |--------------------------------------------------------------------------
    | Free users
    |--------------------------------------------------------------------------
    */

    if (!premium) {
      return res.status(403).json({
        success: false,
        code: "PREMIUM_REQUIRED",
        message:
          "Resolve Premium is required to access this feature.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Premium user
    |--------------------------------------------------------------------------
    */

    return next();
  } catch (error: unknown) {
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