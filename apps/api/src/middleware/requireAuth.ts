import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { supabase } from "../lib/supabase.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Missing authorization token.",
      });
    }

    /*
     * Extract the Supabase access token.
     */
    const token = authHeader
      .slice(7)
      .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Missing authorization token.",
      });
    }

    /*
     * Ask Supabase to validate the token.
     *
     * Do NOT manually decode the JWT.
     */
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      console.error(
        "❌ Supabase authentication failed:",
        {
          message: error.message,
          status: error.status,
          name: error.name,
        }
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    if (!user) {
      console.error(
        "❌ Supabase returned no user."
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    /*
     * Store the authenticated Supabase
     * user's UUID on the Express request.
     */
    req.userId = user.id;

    console.log(
      "✅ Authenticated user:",
      user.id
    );

    return next();
  } catch (error: any) {
    console.error(
      "❌ Authentication middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Authentication service error.",
    });
  }
}