import { supabase } from "./supabase";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type CreateJournalRequest = {
  mood: string;
  title: string;
  content: string;
};

export type Journal = {
  id: string;
  mood: string;
  title: string;
  content: string;
  created_at: string;
};

export type ChatMessage = {
  id?: string;

  role: "user" | "assistant";

  // Backend field
  message?: string;

  // Frontend field
  content?: string;

  created_at?: string;
};

export type RecoveryProfile = {
  id?: string;
  user_id?: string;

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
};

/*
|--------------------------------------------------------------------------
| Auth Header
|--------------------------------------------------------------------------
*/

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be logged in.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

/*
|--------------------------------------------------------------------------
| JOURNALS
|--------------------------------------------------------------------------
*/

export async function createJournal(
  journal: CreateJournalRequest
): Promise<Journal> {
  const response = await fetch(
    `${API_BASE_URL}/api/journal`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(journal),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ?? "Failed to save journal."
    );
  }

  return data.journal;
}

export async function getJournals(): Promise<
  Journal[]
> {
  const response = await fetch(
    `${API_BASE_URL}/api/journal`,
    {
      headers: await getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ??
        "Failed to load journals."
    );
  }

  return data.journals;
}

export async function deleteJournal(
  id: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/journal/${id}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ??
        "Failed to delete journal."
    );
  }
}

/*
|--------------------------------------------------------------------------
| CHAT
|--------------------------------------------------------------------------
*/

export async function sendChat(
  message: string
): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/api/chat`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        message,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ??
        "Failed to send message."
    );
  }

  return data.reply;
}

export async function loadHistory(): Promise<
  ChatMessage[]
> {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/history`,
    {
      headers: await getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ??
        "Failed to load history."
    );
  }

  return data.messages;
}

export async function clearHistory(): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/history`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ??
        "Failed to clear history."
    );
  }
}

/*
|--------------------------------------------------------------------------
| RECOVERY PROFILE
|--------------------------------------------------------------------------
*/

export async function getProfile(): Promise<RecoveryProfile | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/profile`,
    {
      headers: await getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ??
        "Failed to load profile."
    );
  }

  return data.profile;
}

export async function createProfile(
  profile: RecoveryProfile
): Promise<RecoveryProfile> {
  const response = await fetch(
    `${API_BASE_URL}/api/profile`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(profile),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ??
        "Failed to create profile."
    );
  }

  return data.profile;
}

export async function updateProfile(
  profile: Partial<RecoveryProfile>
): Promise<RecoveryProfile> {
  const response = await fetch(
    `${API_BASE_URL}/api/profile`,
    {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: JSON.stringify(profile),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ??
        "Failed to update profile."
    );
  }

  return data.profile;
}