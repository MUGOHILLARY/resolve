import { z } from "zod";

export const ChatMessageSchema = z.object({
  id: z.string(),

  role: z.enum([
    "user",
    "assistant",
  ]),

  content: z.string(),

  created_at: z.string(),
});

export type ChatMessage =
  z.infer<typeof ChatMessageSchema>;