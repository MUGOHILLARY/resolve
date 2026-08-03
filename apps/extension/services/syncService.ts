import { supabase } from "../lib/supabase";
import { saveSettings } from "../storage/settings";

export async function syncSettingsFromSupabase() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from("blocker_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  await saveSettings({
    gambling: data.gambling,
    adult: data.adult_content,
    social: data.social_media,
    gaming: data.gaming,
    customSites: data.custom_sites,
  });
}