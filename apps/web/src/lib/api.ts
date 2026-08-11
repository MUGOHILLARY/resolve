import { supabase } from "./supabase";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:4000";

/* ==========================================================================
   Types
   ========================================================================== */

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

  /*
   * PostgreSQL TIME accepts a valid time string or NULL.
   * It does not accept "".
   */
  reminder_time: string | null;

  notes: string;

  created_at?: string;
  updated_at?: string;
};

/* ==========================================================================
   PREMIUM SUBSCRIPTION
   ========================================================================== */

export type SubscriptionPlan =
  | "free"
  | "premium";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "cancelled"
  | "expired";

export type Subscription = {
  id: string;

  user_id: string;

  provider: string;

  provider_customer_id: string | null;

  provider_subscription_id: string | null;

  plan: SubscriptionPlan;

  status: SubscriptionStatus;

  current_period_start: string | null;

  current_period_end: string | null;

  cancel_at_period_end: boolean;

  created_at: string;

  updated_at: string;
};

/* ==========================================================================
   Authentication
   ========================================================================== */

async function getAuthHeaders(): Promise<
  Record<string, string>
> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error(
      "Failed to get Supabase session:",
      error
    );

    throw new Error(
      "Unable to verify your login session."
    );
  }

  if (!session?.access_token) {
    throw new Error(
      "You must be logged in."
    );
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

/* ==========================================================================
   Generic API Response Helper
   ========================================================================== */

async function parseResponse(
  response: Response
) {
  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `Request failed with status ${response.status}.`
    );
  }

  if (data && data.success === false) {
    throw new Error(
      data.message ??
        "Request failed."
    );
  }

  return data;
}

/* ==========================================================================
   JOURNALS
   ========================================================================== */

/*
 * Create Journal Entry
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

  const data = await parseResponse(
    response
  );

  return data.journal;
}

/*
 * Get Journal Entries
 */

export async function getJournals(): Promise<
  Journal[]
> {
  const response = await fetch(
    `${API_BASE_URL}/api/journal`,
    {
      method: "GET",

      headers: await getAuthHeaders(),
    }
  );

  const data = await parseResponse(
    response
  );

  return data.journals ?? [];
}

/*
 * Delete Journal Entry
 */

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

  await parseResponse(response);
}

/* ==========================================================================
   CHAT
   ========================================================================== */

/*
 * Send Chat Message
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

  const data = await parseResponse(
    response
  );

  return data.reply;
}

/*
 * Load Chat History
 */

export async function loadHistory(): Promise<
  ChatMessage[]
> {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/history`,
    {
      method: "GET",

      headers: await getAuthHeaders(),
    }
  );

  const data = await parseResponse(
    response
  );

  return data.messages ?? [];
}

/*
 * Clear Chat History
 */

export async function clearHistory(): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/history`,
    {
      method: "DELETE",

      headers: await getAuthHeaders(),
    }
  );

  await parseResponse(response);
}

/* ==========================================================================
   RECOVERY PROFILE
   ========================================================================== */

/*
 * Get Recovery Profile
 */

export async function getProfile(): Promise<
  RecoveryProfile | null
> {
  const response = await fetch(
    `${API_BASE_URL}/api/profile`,
    {
      method: "GET",

      headers: await getAuthHeaders(),
    }
  );

  const data = await parseResponse(
    response
  );

  return data.profile ?? null;
}

/*
 * Create Recovery Profile
 */

export async function createProfile(
  profile: Omit<
    RecoveryProfile,
    | "id"
    | "user_id"
    | "created_at"
    | "updated_at"
  >
): Promise<RecoveryProfile> {
  /*
   * Make absolutely sure an empty reminder
   * time never reaches PostgreSQL as "".
   */

  const payload = {
    ...profile,

    reminder_time:
      profile.reminder_time === "" ||
      profile.reminder_time == null
        ? null
        : profile.reminder_time,
  };

  const response = await fetch(
    `${API_BASE_URL}/api/profile`,
    {
      method: "POST",

      headers: await getAuthHeaders(),

      body: JSON.stringify(payload),
    }
  );

  const data = await parseResponse(
    response
  );

  return data.profile;
}

/*
 * Update Recovery Profile
 */

export async function updateProfile(
  profile: Partial<RecoveryProfile>
): Promise<RecoveryProfile> {
  /*
   * Convert "" to NULL before sending.
   *
   * This prevents:
   *
   * invalid input syntax for type time: ""
   */

  const payload = {
    ...profile,

    ...(profile.reminder_time !== undefined
      ? {
          reminder_time:
            profile.reminder_time === "" ||
            profile.reminder_time == null
              ? null
              : profile.reminder_time,
        }
      : {}),
  };

  const response = await fetch(
    `${API_BASE_URL}/api/profile`,
    {
      method: "PUT",

      headers: await getAuthHeaders(),

      body: JSON.stringify(payload),
    }
  );

  const data = await parseResponse(
    response
  );

  return data.profile;
}

/* ==========================================================================
   PREMIUM SUBSCRIPTION
   ========================================================================== */

/*
 * Get authenticated user's subscription.
 *
 * GET /api/subscription
 *
 * The backend automatically creates a FREE
 * subscription if the authenticated user does
 * not already have one.
 */

export async function getSubscription(): Promise<
  Subscription
> {
  const response = await fetch(
    `${API_BASE_URL}/api/subscription`,
    {
      method: "GET",

      headers: await getAuthHeaders(),
    }
  );

  const data = await parseResponse(
    response
  );

  if (!data.subscription) {
    throw new Error(
      "Subscription information was not returned by the server."
    );
  }

  return data.subscription;
}

/*
 * Check whether the current user has
 * an active Premium subscription.
 *
 * This is a convenience function for
 * components that only need true/false.
 */

export async function checkPremiumStatus(): Promise<boolean> {
  const subscription =
    await getSubscription();

  return (
    subscription.plan === "premium" &&
    (
      subscription.status === "active" ||
      subscription.status === "trialing"
    )
  );
}