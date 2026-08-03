import { supabase } from "../lib/supabase";

export interface BlockerSettings {
  gambling: boolean;
  adult_content: boolean;
  social_media: boolean;
  gaming: boolean;

  focus_mode: boolean;
  custom_sites: string[];

  focus_until: string | null;

  emergency_lock: boolean;
  daily_limit: number;

  recovery_lock_enabled: boolean;
  recovery_lock_level: string | null;
  recovery_lock_until: string | null;
  recovery_lock_reason: string | null;
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  if (!user) {
    throw new Error("User is not logged in.");
  }

  return user.id;
}

/*
|--------------------------------------------------------------------------
| Get Blocker Settings
|--------------------------------------------------------------------------
*/

export async function getBlockerSettings(): Promise<BlockerSettings> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("blocker_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const defaults = {
      user_id: userId,

      gambling: true,
      adult_content: true,
      social_media: false,
      gaming: false,

      focus_mode: false,
      custom_sites: [],

      focus_until: null,

      emergency_lock: false,
      daily_limit: 0,

      recovery_lock_enabled: false,
      recovery_lock_level: null,
      recovery_lock_until: null,
      recovery_lock_reason: null,
    };

    const {
      data: inserted,
      error: insertError,
    } = await supabase
      .from("blocker_settings")
      .insert(defaults)
      .select()
      .single();

    if (insertError) throw insertError;

    return inserted;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Update Settings
|--------------------------------------------------------------------------
*/

export async function updateBlockerSettings(
  updates: Partial<BlockerSettings>
) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("blocker_settings")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/*
|--------------------------------------------------------------------------
| Custom Websites
|--------------------------------------------------------------------------
*/

export async function addCustomWebsite(site: string) {
  const settings = await getBlockerSettings();

  if (settings.custom_sites.includes(site)) {
    return settings;
  }

  return updateBlockerSettings({
    custom_sites: [
      ...settings.custom_sites,
      site,
    ],
  });
}

export async function removeCustomWebsite(site: string) {
  const settings = await getBlockerSettings();

  return updateBlockerSettings({
    custom_sites:
      settings.custom_sites.filter(
        (item) => item !== site
      ),
  });
}

/*
|--------------------------------------------------------------------------
| Recovery Lock
|--------------------------------------------------------------------------
*/

export async function activateRecoveryLock(
  level: string,
  years: number,
  reason = "Recovery Commitment"
) {
  const expires = new Date();

  expires.setFullYear(
    expires.getFullYear() + years
  );

  return updateBlockerSettings({
    recovery_lock_enabled: true,
    recovery_lock_level: level,
    recovery_lock_until:
      expires.toISOString(),
    recovery_lock_reason: reason,
  });
}

export async function disableRecoveryLock() {
  return updateBlockerSettings({
    recovery_lock_enabled: false,
    recovery_lock_level: null,
    recovery_lock_until: null,
    recovery_lock_reason: null,
  });
}