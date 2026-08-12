import { supabase } from "../lib/supabase.js";

/**
 * Normalize reminder time.
 *
 * PostgreSQL TIME may return:
 *   "08:30"
 *   "08:30:00"
 *
 * HTML <input type="time"> normally sends:
 *   "08:30"
 *
 * The database should receive:
 *   "08:30"
 *
 * Empty values are converted to NULL.
 */
function normalizeReminderTime(
  value: unknown
): string | null {
  // Empty / missing reminder time
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  // Only strings are valid
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  /*
   * Accept both:
   *
   * HH:MM
   * HH:MM:SS
   *
   * PostgreSQL commonly returns TIME as HH:MM:SS,
   * while HTML time inputs normally use HH:MM.
   */

  const match = trimmed.match(
    /^(\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!match) {
    throw new Error(
      "Reminder time must be in HH:MM format."
    );
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3]
    ? Number(match[3])
    : 0;

  /*
   * Validate actual time values.
   */
  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    throw new Error(
      "Reminder time must be a valid time in HH:MM format."
    );
  }

  /*
   * Always return HH:MM.
   *
   * This keeps the frontend and database consistent.
   */
  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
}

/**
 * GET RECOVERY PROFILE
 */
export async function getProfile(
  userId: string
) {
  if (
    !userId ||
    typeof userId !== "string"
  ) {
    throw new Error(
      "Authenticated user ID is required."
    );
  }

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

  /*
   * Normalize the value returned from PostgreSQL.
   *
   * PostgreSQL may return:
   *   08:30:00
   *
   * Frontend receives:
   *   08:30
   */
  if (data) {
    data.reminder_time =
      normalizeReminderTime(
        data.reminder_time
      );
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
   * Generate the UUID here because the
   * recovery_profiles.id column requires one.
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

    /*
     * Convert:
     * ""        → null
     * null      → null
     * 08:30     → 08:30
     * 08:30:00  → 08:30
     */
    reminder_time:
      normalizeReminderTime(
        profile.reminder_time
      ),

    updated_at:
      profile.updated_at ??
      new Date().toISOString(),
  };

  /*
   * Never allow an invalid ID.
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

  /*
   * Normalize the value returned by PostgreSQL
   * before sending it back to the frontend.
   */
  if (data) {
    data.reminder_time =
      normalizeReminderTime(
        data.reminder_time
      );
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
   * Copy updates so we don't mutate the
   * original request object.
   */
  const payload: Record<string, any> = {
    ...updates,
  };

  /*
   * Never allow the client to change:
   *
   * id
   * user_id
   *
   * Ownership must always come from the
   * authenticated user.
   */
  delete payload.id;
  delete payload.user_id;

  /*
   * Only normalize reminder_time if the
   * client actually supplied it.
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
   * Always update modification timestamp.
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

  /*
   * Normalize PostgreSQL TIME before
   * returning the profile to the frontend.
   */
  if (data) {
    data.reminder_time =
      normalizeReminderTime(
        data.reminder_time
      );
  }

  return data;
}