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

/**
 * Extract non-sensitive information from a JWT.
 *
 * This is ONLY for server-side diagnostics.
 * We never log the actual token.
 */
function getTokenDiagnostics(token: string) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return {
        validStructure: false,
      };
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    );

    return {
      validStructure: true,
      issuer: payload.iss ?? null,
      audience: payload.aud ?? null,
      subject: payload.sub ?? null,
      expiresAt: payload.exp
        ? new Date(payload.exp * 1000).toISOString()
        : null,
      issuedAt: payload.iat
        ? new Date(payload.iat * 1000).toISOString()
        : null,
      isExpired:
        typeof payload.exp === "number"
          ? payload.exp * 1000 <= Date.now()
          : null,
    };
  } catch {
    return {
      validStructure: false,
    };
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    /*
     * ---------------------------------------------------------------
     * Authorization header check
     * ---------------------------------------------------------------
     */

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      console.error(
        "❌ Authentication failed: missing Bearer token."
      );

      return res.status(401).json({
        success: false,
        message: "Missing authorization token.",
      });
    }

    const token = authHeader
      .slice(7)
      .trim();

    if (!token) {
      console.error(
        "❌ Authentication failed: empty Bearer token."
      );

      return res.status(401).json({
        success: false,
        message: "Missing authorization token.",
      });
    }

    /*
     * ---------------------------------------------------------------
     * SAFE TOKEN DIAGNOSTICS
     *
     * IMPORTANT:
     * We DO NOT log the actual JWT.
     * ---------------------------------------------------------------
     */

    const diagnostics =
      getTokenDiagnostics(token);

    console.log(
      "🔐 Resolve authentication attempt:",
      diagnostics
    );

    /*
     * ---------------------------------------------------------------
     * Supabase authentication
     * ---------------------------------------------------------------
     */

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      console.error(
        "❌ Supabase rejected access token:",
        {
          message: error.message,
          status: error.status,
          name: error.name,
          diagnostics,
        }
      );

      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    if (!user) {
      console.error(
        "❌ Supabase returned no authenticated user.",
        diagnostics
      );

      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    /*
     * ---------------------------------------------------------------
     * SUCCESS
     * ---------------------------------------------------------------
     */

    req.userId = user.id;

    console.log(
      "✅ Authenticated Resolve user:",
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
      message: "Authentication service error.",
    });
  }
}