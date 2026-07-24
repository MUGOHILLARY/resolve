import { supabase } from "../lib/supabase.js";

export interface RecoveryProfile {
  id?: string;
  user_id: string;

  goal: string;
  challenges: string;
  preferences: string;

  current_streak: number;

  biggest_triggers: string;

  emergency_plan: string;

  daily_habits: string;

  support_person: string;

  motivation: string;

  reminder_time: string;

  notes: string;

  created_at?: string;
  updated_at?: string;
}

/*
|--------------------------------------------------------------------------
| Get Recovery Profile
|--------------------------------------------------------------------------
*/

export async function getRecoveryProfile(
  userId: string
): Promise<RecoveryProfile | null> {
  const { data, error } = await supabase
    .from("recovery_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Create Recovery Profile
|--------------------------------------------------------------------------
*/

export async function createRecoveryProfile(
  profile: RecoveryProfile
): Promise<RecoveryProfile> {
  const { data, error } = await supabase
    .from("recovery_profiles")
    .insert(profile)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Update Recovery Profile
|--------------------------------------------------------------------------
*/

export async function updateRecoveryProfile(
  userId: string,
  updates: Partial<
    Omit<
      RecoveryProfile,
      "id" | "user_id" | "created_at"
    >
  >
): Promise<RecoveryProfile> {
  const { data, error } = await supabase
    .from("recovery_profiles")
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
| Delete Recovery Profile (Optional)
|--------------------------------------------------------------------------
*/

export async function deleteRecoveryProfile(
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("recovery_profiles")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}