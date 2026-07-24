import { supabase } from "../lib/supabase.js";

export type ChatRole = "user" | "assistant";

/*
|--------------------------------------------------------------------------
| Save Message
|--------------------------------------------------------------------------
*/

export async function saveMessage(
  userId: string,
  role: ChatRole,
  message: string
) {
  const { data, error } = await supabase
    .from("ai_messages")
    .insert({
      user_id: userId,
      role,
      message,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Load Chat History
|--------------------------------------------------------------------------
*/

export async function loadChatHistory(userId: string) {
  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/*
|--------------------------------------------------------------------------
| Clear Chat History
|--------------------------------------------------------------------------
*/

export async function clearChatHistory(userId: string) {
  const { error } = await supabase
    .from("ai_messages")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}