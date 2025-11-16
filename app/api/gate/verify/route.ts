// app/api/gate/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';
import { prisma } from '@/lib/database/prisma';
import {
  verifyChallengeJwt,
  canonicalMessageForJwt,
  verifyEd25519Signature,
  walletOwnsMint,
} from '@/lib/gate/gateHelpers';

const SOLANA_RPC = process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';

/**
 * POST /api/gate/verify
 * Body:
 * {
 *   challengeJwt: string,
 *   signatureBase58: string,
 *   signerPubkey: string,
 *   staffId?: string,          // will be used as verifierPubkey in GateVerification
 *   gateId?: string,
 *   verificationId?: string    // optional - if provided, update this GateVerification row
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });

    const {
      challengeJwt,
      signatureBase58,
      signerPubkey,
      staffId,
      gateId,
      verificationId,
    }: {
      challengeJwt?: string;
      signatureBase58?: string;
      signerPubkey?: string;
      staffId?: string;
      gateId?: string;
      verificationId?: string;
    } = body;

    // Basic validation
    if (!challengeJwt || !signatureBase58 || !signerPubkey) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
    }

    // 1) Verify and decode challenge JWT
    let jwtPayload: { ticketId: string; mintPubkey: string; nonce?: string };
    try {
      jwtPayload = verifyChallengeJwt(challengeJwt) as any;
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: 'invalid_or_expired_challenge', details: err?.message }, { status: 400 });
    }

    const { ticketId, mintPubkey } = jwtPayload;
    if (!ticketId || !mintPubkey) {
      return NextResponse.json({ ok: false, error: 'invalid_challenge_payload' }, { status: 400 });
    }

    // 2) Reconstruct canonical message and verify signature
    const canonical = canonicalMessageForJwt(challengeJwt);
    const sigOk = verifyEd25519Signature(canonical, signatureBase58, signerPubkey);
    if (!sigOk) {
      return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 400 });
    }

    // 3) On-chain ownership check
    const connection = new Connection(SOLANA_RPC, { commitment: 'confirmed' });
    const owns = await walletOwnsMint(connection, signerPubkey, mintPubkey);
    if (!owns) {
      return NextResponse.json({ ok: false, error: 'wallet_does_not_own_mint' }, { status: 400 });
    }

    // 4) Prepare verification meta
    const verificationMeta = {
      challengeJwt,
      signatureBase58,
      signerPubkey,
      gateId: gateId ?? null,
      staffId: staffId ?? null,
      verifiedAt: new Date().toISOString(),
    };

    // 5) Atomic transaction: flip ticket status -> USED (only if ACTIVE), then update/create GateVerification
    try {
      const result = await prisma.$transaction(async (tx) => {
        // a) conditional updateMany to atomically mark ticket USED only if ACTIVE
        const updateRes = await tx.ticket.updateMany({
          where: { ticketId, status: 'ACTIVE' },
          data: {
            status: 'USED',
            usedAt: new Date(),
          },
        });

        if (updateRes.count === 0) {
          // nothing updated — ticket not ACTIVE (either used/cancelled/doesn't exist)
          // Throw to abort transaction and return a 409 later
          throw new Error('already_redeemed_or_invalid');
        }

        // b) fetch eventId for GateVerification.eventId
        const ticketRow = await tx.ticket.findUnique({ where: { ticketId }, select: { eventId: true } });
        const eventId = ticketRow?.eventId ?? '';

        // c) if verificationId provided -> update that row (ensure it matches ticketId)
        if (verificationId) {
          // ensure the verification row exists and matches this ticket
          const existing = await tx.gateVerification.findUnique({ where: { verificationId } });
          if (!existing) throw new Error('verification_record_not_found');
          if (existing.ticketId !== ticketId) throw new Error('verification_ticket_mismatch');

          // perform update
          await tx.gateVerification.update({
            where: { verificationId },
            data: {
              status: 'VERIFIED', // VerificationStatus.VERIFIED
              verifiedAt: new Date(),
              verifierPubkey: staffId ?? existing.verifierPubkey ?? 'unknown-staff',
              signerPubkey,
              location: gateId ?? existing.location ?? undefined,
              meta: {
                ...(existing.meta as Record<string, any>),
                ...verificationMeta,
              } as any,
            },
          });

          return { ticketId, verificationId, createdOrUpdated: 'updated' };
        } else {
          // d) create new GateVerification row
          const gv = await tx.gateVerification.create({
            data: {
              eventId,
              ticketId,
              verifierPubkey: staffId ?? 'unknown-staff',
              status: 'VERIFIED',
              verifiedAt: new Date(),
              location: gateId ?? undefined,
              signerPubkey,
              meta: verificationMeta as any,
            } as any,
          });

          return { ticketId, verificationId: gv.verificationId, createdOrUpdated: 'created' };
        }
      });

      // success
      return NextResponse.json({ ok: true, message: 'verified_and_used', ticketId: result.ticketId, verificationId: result.verificationId });
    } catch (txErr: any) {
      // Distinguish our thrown 'already_redeemed_or_invalid' vs other errors
      const msg = String(txErr?.message ?? txErr);
      if (msg.includes('already_redeemed_or_invalid')) {
        return NextResponse.json({ ok: false, error: 'already_redeemed_or_invalid' }, { status: 409 });
      }
      if (msg.includes('verification_record_not_found')) {
        return NextResponse.json({ ok: false, error: 'verification_record_not_found' }, { status: 400 });
      }
      if (msg.includes('verification_ticket_mismatch')) {
        return NextResponse.json({ ok: false, error: 'verification_ticket_mismatch' }, { status: 400 });
      }

      console.error('Transaction error in /api/gate/verify:', txErr);
      return NextResponse.json({ ok: false, error: 'server_error', details: msg }, { status: 500 });
    }
  } catch (err: any) {
    console.error('api/gate/verify error:', err);
    return NextResponse.json({ ok: false, error: 'server_error', details: err?.message ?? String(err) }, { status: 500 });
  }
}
