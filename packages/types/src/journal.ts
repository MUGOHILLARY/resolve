import { z } from "zod";

export const JournalEntrySchema = z.object({
  id: z.string(),

  content: z.string(),

  mood: z.number(),

  created_at: z.string(),
});

export type JournalEntry =
  z.infer<typeof JournalEntrySchema>;