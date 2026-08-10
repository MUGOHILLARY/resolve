import { supabase } from "../lib/supabase.js";

/**
 * Normalize reminder time.
 *
 * PostgreSQL TIME accepts:
 *   "08:30"
 *   "18:45"
 *   null
 *
 * PostgreSQL TIME does NOT accept:
 *   ""
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

  if (trimmed === "") {
    return null;
  }

  /*
   * HTML <input type="time"> normally gives HH:MM.
   * PostgreSQL TIME accepts this format.
   */
  if (!/^\d{2}:\d{2}$/.test(trimmed)) {
    throw new Error(
      "Reminder time must be in HH:MM format."
    );
  }

  return trimmed;
}

/**
 * GET RECOVERY PROFILE
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

/**
 * CREATE RECOVERY PROFILE
 */
export async function createProfile(
  profile: Record<string, any>
) {
  /*
   * IMPORTANT:
   *
   * Your recovery_profiles.id column is NOT allowing NULL.
   * Generate the UUID here instead of relying on the database.
   */
  const id =
    typeof profile.id === "string" &&
    profile.id.trim() !== ""
      ? profile.id
      : crypto.randomUUID();

  /*
   * user_id must come from the authenticated user.
   */
  if (
    !profile.user_id ||
    typeof profile.user_id !== "string"
  ) {
    throw new Error(
      "Authenticated user ID is required to create a recovery profile."
    );
  }

  const payload: Record<string, any> = {
    ...profile,

    id,

    user_id: profile.user_id,

    reminder_time:
      normalizeReminderTime(
        profile.reminder_time
      ),

    updated_at:
      profile.updated_at ??
      new Date().toISOString(),
  };

  /*
   * Do not allow the client to accidentally send
   * undefined as the ID.
   */
  if (!payload.id) {
    throw new Error(
      "Recovery profile ID could not be generated."
    );
  }

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
    .select("*")
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

/**
 * UPDATE RECOVERY PROFILE
 */
export async function updateProfile(
  userId: string,
  updates: Record<string, any>
) {
  if (
    !userId ||
    typeof userId !== "string"
  ) {
    throw new Error(
      "Authenticated user ID is required."
    );
  }

  /*
   * Never allow the client to change the profile ID
   * or user ownership during an update.
   */
  const payload: Record<string, any> = {
    ...updates,
  };

  delete payload.id;
  delete payload.user_id;

  /*
   * Only normalize reminder_time when it
   * was actually supplied.
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
   * Always update the modification timestamp.
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
    .select("*")
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