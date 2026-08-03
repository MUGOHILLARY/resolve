import { z } from "zod";

export const BlockerSettingsSchema = z.object({
  gambling: z.boolean(),
  adult_content: z.boolean(),
  social_media: z.boolean(),
  gaming: z.boolean(),
  focus_mode: z.boolean(),

  custom_sites: z.array(z.string()),

  focus_until: z.string().nullable(),

  emergency_lock: z.boolean(),

  daily_limit: z.number(),
});

export type BlockerSettings =
  z.infer<typeof BlockerSettingsSchema>;