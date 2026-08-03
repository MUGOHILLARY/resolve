import { openai } from "../lib/openai.js";
import { supabase } from "../lib/supabase.js";
import { loadChatHistory } from "./chatService.js";

export async function generateAIReply(
  userId: string,
  userMessage: string
): Promise<string> {
  /*
  |--------------------------------------------------------------------------
  | Load Recovery Profile
  |--------------------------------------------------------------------------
  */

  const { data: profile, error: profileError } = await supabase
    .from("recovery_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  /*
  |--------------------------------------------------------------------------
  | Load Recent Journal Entries
  |--------------------------------------------------------------------------
  */

  const { data: journals, error: journalError } = await supabase
    .from("journal_entries")
    .select("mood,title,content,created_at")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  if (journalError) {
    throw journalError;
  }

  /*
  |--------------------------------------------------------------------------
  | Load Previous Conversation
  |--------------------------------------------------------------------------
  */

  const previousMessages = await loadChatHistory(userId);

  /*
  |--------------------------------------------------------------------------
  | Recovery Profile Context
  |--------------------------------------------------------------------------
  */

  const profileContext = profile
    ? `
Recovery Goal:
${profile.goal || "Not provided"}

Motivation:
${profile.motivation || "Not provided"}

Current Recovery Streak:
${profile.current_streak ?? 0} days

Current Challenges:
${profile.challenges || "Not provided"}

Biggest Triggers:
${profile.biggest_triggers || "Not provided"}

Emergency Recovery Plan:
${profile.emergency_plan || "Not provided"}

Daily Habits:
${profile.daily_habits || "Not provided"}

Support Person:
${profile.support_person || "Not provided"}

Preferred Coaching Style:
${profile.preferences || "Not provided"}

Daily Reminder Time:
${profile.reminder_time || "Not provided"}

Additional Notes:
${profile.notes || "Not provided"}
`
    : "The user has not created a recovery profile yet.";

  /*
  |--------------------------------------------------------------------------
  | Journal Context
  |--------------------------------------------------------------------------
  */

  const journalContext =
    journals && journals.length > 0
      ? journals
          .map(
            (entry, index) => `
Journal ${index + 1}

Date: ${entry.created_at}

Mood: ${entry.mood}

Title: ${entry.title}

Content:
${entry.content}
`
          )
          .join("\n")
      : "The user has not written any journal entries yet.";

  /*
  |--------------------------------------------------------------------------
  | System Prompt
  |--------------------------------------------------------------------------
  */

  const systemPrompt = `
You are Resolve AI.

You are an expert recovery coach,
habit-building specialist,
behavioral psychologist,
and accountability partner.

Your personality should always be:

• Warm
• Calm
• Encouraging
• Practical
• Compassionate
• Never judgmental
• Never shame the user

Always personalize your responses using:

1. Recovery Profile
2. Journal History
3. Previous Conversations

Always:

• Celebrate progress.
• Reference previous achievements when appropriate.
• Encourage consistency over perfection.
• Detect patterns in emotions and habits.
• Recommend small achievable next steps.
• Mention the user's motivation when relevant.
• Consider their biggest triggers.
• Suggest using their emergency plan during difficult moments.
• Adapt to the user's preferred coaching style.
• Encourage healthy routines and self-reflection.

Never invent facts that are not contained in the profile,
journal history or previous conversations.

Keep responses between 100 and 250 words unless the user asks for more detail.

==================================================

RECOVERY PROFILE

${profileContext}

==================================================

JOURNAL HISTORY

${journalContext}
`;

  /*
  |--------------------------------------------------------------------------
  | Previous Conversation
  |--------------------------------------------------------------------------
  */

  const conversation = previousMessages.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.message,
  }));

  /*
  |--------------------------------------------------------------------------
  | GPT Input
  |--------------------------------------------------------------------------
  */

  const input = [
    {
      role: "system" as const,
      content: systemPrompt,
    },
    ...conversation,
    {
      role: "user" as const,
      content: userMessage,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Generate AI Response
  |--------------------------------------------------------------------------
  */

  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input,
  });

  return response.output_text;
}