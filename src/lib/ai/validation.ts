import { z } from 'zod';

export const credentialSchema = z.object({
  provider: z.enum(['openrouter', 'openai-compatible']),
  apiKey: z.string().trim().min(1).max(500),
  model: z.string().trim().min(1).max(200),
});

export type CredentialInput = z.infer<typeof credentialSchema>;
