import { openai } from "../lib/openai.js";
import { supabase } from "../lib/supabase.js";

import { loadChatHistory } from "./chatService.js";
import { getRecoveryProfile } from "./profileService.js";

export async function generateAIReply(
  userId: string,
  userMessage: string
): Promise<string> {
  /*
  |--------------------------------------------------------------------------
  | Load Recovery Profile
  |--------------------------------------------------------------------------
  */

  const profile =
    await getRecoveryProfile(userId);

  /*
  |--------------------------------------------------------------------------
  | Load Journal Entries
  |--------------------------------------------------------------------------
  */

  const { data: journals, error } = await supabase
    .from("journal_entries")
    .select(
      "mood,title,content,created_at"
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Load Previous Conversation
  |--------------------------------------------------------------------------
  */

  const previousMessages =
    await loadChatHistory(userId);

  /*
  |--------------------------------------------------------------------------
  | Recovery Profile Context
  |--------------------------------------------------------------------------
  */

  const profileContext = profile
    ? `
Recovery Goal:
${profile.goal}

Current Challenges:
${profile.challenges}

Preferred Coaching Style:
${profile.preferences}
`
    : `
The user has not created a recovery profile yet.
Encourage them to complete one so coaching can be more personalized.
`;

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

You are an empathetic, supportive, and practical recovery coach.

Your objectives are:

- Help users build healthy habits.
- Encourage emotional reflection.
- Support long-term recovery.
- Never shame or judge.
- Celebrate progress.
- Offer practical next steps.
- Remember previous conversations.
- Use the user's recovery profile to personalize every response.
- Use journal entries to identify emotional patterns.
- Keep responses between 100 and 250 words unless more detail is requested.

==============================
RECOVERY PROFILE
==============================

${profileContext}

==============================
JOURNAL HISTORY
==============================

${journalContext}
`;

  /*
  |--------------------------------------------------------------------------
  | Conversation History
  |--------------------------------------------------------------------------
  */

  const conversation = previousMessages.map(
    (message) => ({
      role: message.role as
        | "user"
        | "assistant",
      content: message.message,
    })
  );

  /*
  |--------------------------------------------------------------------------
  | Current Conversation
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
  | GPT Response
  |--------------------------------------------------------------------------
  */

  const response =
    await openai.responses.create({
      model: "gpt-5-mini",
      input,
    });

  return response.output_text;
}