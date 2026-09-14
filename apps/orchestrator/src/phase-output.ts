import { z } from 'zod';

export const PhaseOutputSchema = z.object({
  summary: z.string().min(1),
  evidence: z.array(z.string()),
  risks: z.array(z.string()),
  nextInputs: z.array(z.string()),
});

export type PhaseOutput = z.infer<typeof PhaseOutputSchema>;
