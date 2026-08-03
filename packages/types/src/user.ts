import { z } from "zod";

export const ResolveUserSchema = z.object({
  id: z.string(),

  email: z.email(),
});

export type ResolveUser =
  z.infer<typeof ResolveUserSchema>;