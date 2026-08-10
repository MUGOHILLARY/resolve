import type { Request, Response } from "express";
import {
  createProfile as createProfileService,
  getProfile as getProfileService,
  updateProfile as updateProfileService,
} from "../services/profileService.js";

/*
|--------------------------------------------------------------------------
| Normalize reminder time
|--------------------------------------------------------------------------
|
| PostgreSQL TIME accepts:
|
|   "08:30"
|   "18:45"
|   null
|
| It does NOT accept:
|
|   ""
|
*/

function normalizeReminderTime(
  value: unknown
): string | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

/*
|--------------------------------------------------------------------------
| GET PROFILE
|--------------------------------------------------------------------------
*/

export async function getProfile(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const profile =
      await getProfileService(userId);

    return res.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error(
      "❌ Get profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ??
        "Failed to load profile.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| CREATE PROFILE
|--------------------------------------------------------------------------
*/

export async function createProfile(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const {
      goal,
      motivation,
      challenges,
      preferences,
      current_streak,
      biggest_triggers,
      emergency_plan,
      daily_habits,
      support_person,
      reminder_time,
      notes,
    } = req.body;

    const profile = {
      user_id: userId,

      goal: goal ?? "",

      motivation: motivation ?? "",

      challenges: challenges ?? "",

      preferences: preferences ?? "",

      current_streak:
        current_streak ?? 0,

      biggest_triggers:
        biggest_triggers ?? "",

      emergency_plan:
        emergency_plan ?? "",

      daily_habits:
        daily_habits ?? "",

      support_person:
        support_person ?? "",

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      */

      reminder_time:
        normalizeReminderTime(
          reminder_time
        ),

      notes: notes ?? "",
    };

    console.log(
      "Creating recovery profile:",
      {
        ...profile,
        reminder_time:
          profile.reminder_time,
      }
    );

    const created =
      await createProfileService(
        profile
      );

    return res.status(201).json({
      success: true,
      profile: created,
    });
  } catch (error: any) {
    console.error(
      "❌ Create profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ??
        "Failed to create profile.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE PROFILE
|--------------------------------------------------------------------------
*/

export async function updateProfile(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const updates = {
      ...req.body,
    };

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT REMINDER TIME FIX
    |--------------------------------------------------------------------------
    */

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "reminder_time"
      )
    ) {
      updates.reminder_time =
        normalizeReminderTime(
          updates.reminder_time
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Never allow an empty string to reach PostgreSQL
    |--------------------------------------------------------------------------
    */

    console.log(
      "Updating recovery profile:",
      {
        ...updates,
        reminder_time:
          updates.reminder_time,
      }
    );

    const updated =
      await updateProfileService(
        userId,
        updates
      );

    return res.json({
      success: true,
      profile: updated,
    });
  } catch (error: any) {
    console.error(
      "❌ Update profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ??
        "Failed to update profile.",
    });
  }
}