import { randomUUID } from "crypto";
import { supabase } from "../lib/supabase.js";

/*
|--------------------------------------------------------------------------
| Normalize Reminder Time
|--------------------------------------------------------------------------
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
| GET RECOVERY PROFILE
|--------------------------------------------------------------------------
*/

export async function getProfile(
  userId: string
) {
  const { data, error } = await supabase
    .from("recovery_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "❌ Failed to get recovery profile:",
      error
    );

    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| CREATE RECOVERY PROFILE
|--------------------------------------------------------------------------
*/

export async function createProfile(
  profile: any
) {
  /*
  |--------------------------------------------------------------------------
  | Generate ID if one was not supplied
  |--------------------------------------------------------------------------
  |
  | The database currently requires recovery_profiles.id
  | to be NOT NULL.
  |
  */

  const payload = {
    ...profile,

    id:
      profile.id ??
      randomUUID(),

    reminder_time:
      normalizeReminderTime(
        profile.reminder_time
      ),
  };

  console.log(
    "📝 Creating recovery profile:",
    {
      id: payload.id,
      user_id: payload.user_id,
      reminder_time:
        payload.reminder_time,
    }
  );

  const { data, error } = await supabase
    .from("recovery_profiles")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(
      "❌ Failed to create recovery profile:",
      error
    );

    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| UPDATE RECOVERY PROFILE
|--------------------------------------------------------------------------
*/

export async function updateProfile(
  userId: string,
  updates: Record<string, any>
) {
  const payload = {
    ...updates,
  };

  /*
  |--------------------------------------------------------------------------
  | Never update the primary key
  |--------------------------------------------------------------------------
  */

  delete payload.id;
  delete payload.user_id;

  /*
  |--------------------------------------------------------------------------
  | Normalize reminder_time
  |--------------------------------------------------------------------------
  */

  if (
    Object.prototype.hasOwnProperty.call(
      payload,
      "reminder_time"
    )
  ) {
    payload.reminder_time =
      normalizeReminderTime(
        payload.reminder_time
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Update timestamp
  |--------------------------------------------------------------------------
  */

  payload.updated_at =
    new Date().toISOString();

  console.log(
    "📝 Updating recovery profile:",
    {
      user_id: userId,
      reminder_time:
        payload.reminder_time,
    }
  );

  const { data, error } = await supabase
    .from("recovery_profiles")
    .update(payload)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error(
      "❌ Failed to update recovery profile:",
      error
    );

    throw error;
  }

  return data;
}