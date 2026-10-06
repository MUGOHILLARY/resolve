import type { Request, Response } from "express";

import { supabase } from "../lib/supabase.js";
import {
  addCustomSite,
  getBlockerSettings as getSettings,
  removeCustomSite,
  updateBlockerSettings as updateSettings,
} from "../services/blockerService.js";

/**
 * GET /api/blocker
 *
 * Returns the authenticated user's blocker settings.
 */
export async function getBlockerSettings(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /**
     * Block browser/proxy caching for authenticated blocker settings.
     *
     * This prevents the browser/Render/Cloudflare from returning
     * 304 Not Modified without a JSON response body.
     */
    res.setHeader("Cache-Control", "no-store");

    const settings = await getSettings(userId);

    return res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("❌ Failed to load blocker settings:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load blocker settings.",
    });
  }
}

/**
 * PATCH /api/blocker
 *
 * Updates basic blocker/recovery settings.
 *
 * IMPORTANT:
 * custom_sites is deliberately excluded here.
 * Custom websites are handled by dedicated Premium-only endpoints.
 */
export async function updateBlockerSettings(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid blocker settings.",
      });
    }

    /**
     * Only these fields can be updated through the general endpoint.
     *
     * custom_sites is intentionally excluded because custom-site
     * modification requires Premium entitlement.
     */
    const allowedFields = [
      "adult_content",
      "gambling",
      "social_media",
      "gaming",
      "focus_mode",
      "focus_until",
      "emergency_lock",
      "daily_limit",

      // Recovery Lock fields
      "recovery_lock_enabled",
      "recovery_lock_level",
      "recovery_lock_until",
      "recovery_lock_reason",
    ] as const;

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid blocker settings were provided.",
      });
    }

    /**
     * Basic boolean validation.
     */
    const booleanFields = [
      "adult_content",
      "gambling",
      "social_media",
      "gaming",
      "focus_mode",
      "emergency_lock",
      "recovery_lock_enabled",
    ];

    for (const field of booleanFields) {
      if (
        field in updates &&
        typeof updates[field] !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a boolean.`,
        });
      }
    }

    /**
     * daily_limit must be a non-negative number.
     */
    if ("daily_limit" in updates) {
      const dailyLimit = updates.daily_limit;

      if (
        typeof dailyLimit !== "number" ||
        !Number.isFinite(dailyLimit) ||
        dailyLimit < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "daily_limit must be a non-negative number.",
        });
      }
    }

    /**
     * String/null validation for optional recovery fields.
     */
    const nullableStringFields = [
      "focus_until",
      "recovery_lock_level",
      "recovery_lock_until",
      "recovery_lock_reason",
    ];

    for (const field of nullableStringFields) {
      if (
        field in updates &&
        updates[field] !== null &&
        typeof updates[field] !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a string or null.`,
        });
      }
    }

    const settings = await updateSettings(
      userId,
      updates as Parameters<typeof updateSettings>[1]
    );

    return res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("❌ Failed to update blocker settings:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update blocker settings.",
    });
  }
}

/**
 * POST /api/blocker/custom-site
 *
 * Adds a custom website.
 *
 * Premium enforcement happens at the route level through requirePremium.
 */
export async function addCustomWebsite(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const website = req.body?.website;

    if (
      typeof website !== "string" ||
      website.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Website is required.",
      });
    }

    const normalizedWebsite = website
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/+$/, "");

    if (!normalizedWebsite) {
      return res.status(400).json({
        success: false,
        message: "Invalid website.",
      });
    }

    const settings = await addCustomSite(
      userId,
      normalizedWebsite
    );

    return res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("❌ Failed to add custom website:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add custom website.",
    });
  }
}

/**
 * DELETE /api/blocker/custom-site
 *
 * Removes a custom website.
 *
 * Premium enforcement happens at the route level through requirePremium.
 */
export async function removeCustomWebsite(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const website = req.body?.website;

    if (
      typeof website !== "string" ||
      website.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Website is required.",
      });
    }

    const normalizedWebsite = website
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/+$/, "");

    if (!normalizedWebsite) {
      return res.status(400).json({
        success: false,
        message: "Invalid website.",
      });
    }

    const settings = await removeCustomSite(
      userId,
      normalizedWebsite
    );

    return res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("❌ Failed to remove custom website:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove custom website.",
    });
  }
}