// apps/web/app/api/ticket/utils/validate.ts

import { z } from 'zod';

// Define Zod schema for the expected request shape
const MintTicketSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
    userWallet: z.string().refine(val =>
    val.length === 44 || val.startsWith('0x'),
    'Invalid wallet format (expected Solana address or EVM)'
    ), // Phantom/Solana pubkey
  eventName: z.string().min(1, 'Event name is required'),
  eventDate: z.string().min(1, 'Event date is required'), // ISO format expected
  location: z.string().min(1, 'Location is required'),
  tier: z.enum(['VIP', 'Standard', 'Premium']),
});

// Export type-safe result parser
export function validateMintRequest(data: unknown) {
  const result = MintTicketSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : null,
    error: result.success ? null : result.error.format(),
  };
}

// Optionally export schema if needed elsewhere
export type MintValidationResult =
  | { success: true; data: MintTicketInput; error: null }
  | { success: false; data: null; error: ReturnType<typeof MintTicketSchema.safeParse>['error']['format'] };