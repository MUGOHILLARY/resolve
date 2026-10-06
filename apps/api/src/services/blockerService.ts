import { supabase } from "../lib/supabase.js";

export interface BlockerSettings {
  id?: string;
  user_id: string;

  adult_content: boolean;
  gambling: boolean;
  social_media: boolean;
  gaming: boolean;

  custom_sites: string[];

  focus_mode: boolean;
  focus_until: string | null;

  emergency_lock: boolean;

  daily_limit: number;

  recovery_lock_enabled: boolean;
  recovery_lock_level: string | null;
  recovery_lock_until: string | null;
  recovery_lock_reason: string | null;

  created_at?: string;
  updated_at?: string;
}

/*
|--------------------------------------------------------------------------
| Get Blocker Settings
|--------------------------------------------------------------------------
*/

export async function getBlockerSettings(
  userId: string
): Promise<BlockerSettings> {
  const { data, error } = await supabase
    .from("blocker_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Automatically create default settings
  |--------------------------------------------------------------------------
  */

  if (!data) {
    return createDefaultBlockerSettings(userId);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Create Default Settings
|--------------------------------------------------------------------------
*/

export async function createDefaultBlockerSettings(
  userId: string
): Promise<BlockerSettings> {
  const defaults: BlockerSettings = {
    user_id: userId,

    adult_content: true,
    gambling: true,
    social_media: false,
    gaming: false,

    custom_sites: [],

    focus_mode: false,
    focus_until: null,

    emergency_lock: false,

    daily_limit: 0,

    recovery_lock_enabled: false,
    recovery_lock_level: null,
    recovery_lock_until: null,
    recovery_lock_reason: null,
  };

  const { data, error } = await supabase
    .from("blocker_settings")
    .insert(defaults)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Update Blocker Settings
|--------------------------------------------------------------------------
*/

export async function updateBlockerSettings(
  userId: string,
  updates: Partial<
    Omit<
      BlockerSettings,
      "id" | "user_id" | "created_at"
    >
  >
): Promise<BlockerSettings> {
  const { data, error } = await supabase
    .from("blocker_settings")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Add Custom Website
|--------------------------------------------------------------------------
|
| Premium access is enforced by requirePremium
| at the route level.
|
|--------------------------------------------------------------------------
*/

export async function addCustomSite(
  userId: string,
  website: string
): Promise<BlockerSettings> {
  const settings =
    await getBlockerSettings(userId);

  /*
  |--------------------------------------------------------------------------
  | Avoid duplicate websites
  |--------------------------------------------------------------------------
  */

  if (
    settings.custom_sites.includes(
      website
    )
  ) {
    return settings;
  }

  const updatedSites = [
    ...settings.custom_sites,
    website,
  ];

  return updateBlockerSettings(
    userId,
    {
      custom_sites: updatedSites,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Remove Custom Website
|--------------------------------------------------------------------------
|
| Premium access is enforced by requirePremium
| at the route level.
|
|--------------------------------------------------------------------------
*/

export async function removeCustomSite(
  userId: string,
  website: string
): Promise<BlockerSettings> {
  const settings =
    await getBlockerSettings(userId);

  const updatedSites =
    settings.custom_sites.filter(
      (site) => site !== website
    );

  return updateBlockerSettings(
    userId,
    {
      custom_sites: updatedSites,
    }
  );
}