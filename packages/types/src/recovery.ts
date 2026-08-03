import { z } from "zod";

export const RecoveryProfileSchema = z.object({
  streak: z.number(),

  urges: z.number(),

  relapses: z.number(),

  recovery_score: z.number(),
});

export type RecoveryProfile =
  z.infer<typeof RecoveryProfileSchema>;