import { Request, Response } from "express";

import {
  getRecoveryProfile,
  createRecoveryProfile,
  updateRecoveryProfile,
} from "../services/profileService.js";

/*
|--------------------------------------------------------------------------
| Get Recovery Profile
|--------------------------------------------------------------------------
*/

export async function getProfile(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId!;

    const profile = await getRecoveryProfile(userId);

    return res.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error("Profile error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load recovery profile.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Create Recovery Profile
|--------------------------------------------------------------------------
*/

export async function createProfile(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId!;

    const {
      goal,
      challenges,
      preferences,

      current_streak,

      biggest_triggers,

      emergency_plan,

      daily_habits,

      support_person,

      motivation,

      reminder_time,

      notes,
    } = req.body;

    const profile =
      await createRecoveryProfile({
        user_id: userId,

        goal,
        challenges,
        preferences,

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

        motivation:
          motivation ?? "",

        reminder_time:
          reminder_time ?? "",

        notes:
          notes ?? "",
      });

    return res.status(201).json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error(
      "Create profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create recovery profile.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Update Recovery Profile
|--------------------------------------------------------------------------
*/

export async function updateProfile(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId!;

    const {
      goal,
      challenges,
      preferences,

      current_streak,

      biggest_triggers,

      emergency_plan,

      daily_habits,

      support_person,

      motivation,

      reminder_time,

      notes,
    } = req.body;

    const profile =
      await updateRecoveryProfile(
        userId,
        {
          goal,
          challenges,
          preferences,

          current_streak,

          biggest_triggers,

          emergency_plan,

          daily_habits,

          support_person,

          motivation,

          reminder_time,

          notes,
        }
      );

    return res.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update recovery profile.",
    });
  }
}