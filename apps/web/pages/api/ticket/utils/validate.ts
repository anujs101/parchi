// apps/web/app/api/ticket/utils/validate.ts

import { z, ZodError } from 'zod';

// ✅ Define schema
export const MintTicketSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  userWallet: z.string().refine(val =>
    val.length === 44 || val.startsWith('0x'),
    'Invalid wallet format (expected Solana address or EVM)'
  ),
  eventName: z.string().min(1, 'Event name is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  location: z.string().min(1, 'Location is required'),
  tier: z.enum(['VIP', 'Standard', 'Premium']),
});

// ✅ Export inferred type
export type MintTicketInput = z.infer<typeof MintTicketSchema>;

// ✅ Validate + type-safe result
export function validateMintRequest(data: unknown): {
  success: true;
  data: MintTicketInput;
  error: null;
} | {
  success: false;
  data: null;
  error: ReturnType<ZodError<MintTicketInput>['format']>;
} {
  const result = MintTicketSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data, error: null };
  }

  return {
    success: false,
    data: null,
    error: (result.error as ZodError<MintTicketInput>).format()
  };
}