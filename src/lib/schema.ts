// lib/schemas.ts
import { z } from "zod";

export const requestIntroSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  linkedin: z.string().url().optional(),
  reason: z.string().min(10),
});