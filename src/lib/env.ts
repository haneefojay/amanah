import { z } from "zod";

/**
 * Public (browser-safe) configuration. Only NEXT_PUBLIC_* values belong here; secrets never
 * reach the frontend (spec §9). Values are inlined at build time by Next.js.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url().default("http://localhost:8000"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  /** Public contact address for organisations. Contact buttons are hidden when unset. */
  NEXT_PUBLIC_CONTACT_EMAIL: z.email().optional(),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || undefined,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || undefined,
});
