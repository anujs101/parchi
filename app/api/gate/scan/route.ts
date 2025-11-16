// app/api/gate/scan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { createChallengeJwt, canonicalMessageForJwt } from '@/lib/gate/gateHelpers';
import crypto from 'crypto';

const DEFAULT_EXPIRES = Number(process.env.GATE_JWT_EXP ?? 120); // seconds

// helper: decode base64url -> utf8 (Node)
function base64UrlToUtf8Node(input: string) {
  let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return Buffer.from(b64, 'base64').toString('utf8');
}

// helper: calculate checksum exactly as generator
function calculateChecksumServer(eventId: string, ticketNumber: number, assetPubkey: string, timestamp: number) {
  const checksumData = `${eventId}:${ticketNumber}:${assetPubkey}:${timestamp}`;
  return crypto.createHash('sha256').update(checksumData).digest('hex').slice(0, 4);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

    const { qrString, staffId, gateId } = body as { qrString?: string; staffId?: string; gateId?: string };

    if (!qrString) {
      return NextResponse.json({ ok: false, error: 'missing_qrString' }, { status: 400 });
    }

    // 1) Parse QR payload. Accept:
    //    - "parchi:<base64url>" compact format (preferred by generator)
    //    - URL-encoded JSON
    //    - raw JSON
    let decodedText: string;
    try {
      const raw = String(qrString);
      if (raw.startsWith('parchi:')) {
        const payload = raw.slice('parchi:'.length);
        try {
          decodedText = base64UrlToUtf8Node(payload);
        } catch (e) {
          console.error('parchi decode failed', e);
          return NextResponse.json({ ok: false, error: 'invalid_qr_format' }, { status: 400 });
        }
      } else {
        // tolerate URL-encoded QR payloads
        try {
          decodedText = decodeURIComponent(raw);
        } catch {
          decodedText = raw;
        }
      }
    } catch (err) {
      return NextResponse.json({ ok: false, error: 'invalid_qr_format' }, { status: 400 });
    }

    // Parse JSON
    let qrPayload: any;
    try {
      qrPayload = JSON.parse(decodedText);
    } catch (err) {
      return NextResponse.json({ ok: false, error: 'invalid_qr_format' }, { status: 400 });
    }

    // Map fields from generator (compact) to server-friendly names
    // generator => { v, e, t, a, ts, c }
    // server shape => { t: ticketId|ticketNumber, m: mintPubkey, e: eventId, ts, c }
    const ticketIdFromQr = qrPayload?.t ?? qrPayload?.ticketId ?? null; // can be number or string
    const mintPubkeyRaw = qrPayload?.m ?? qrPayload?.mint ?? qrPayload?.mintPubkey ?? qrPayload?.a ?? null; // 'a' may be prefix
    const eventIdFromQr = qrPayload?.e ?? qrPayload?.eventId ?? null;
    const tsFromQr = qrPayload?.ts ?? null;
    const checksumFromQr = qrPayload?.c ?? null;
    const versionFromQr = qrPayload?.v ?? null;

    // Basic presence check: either ticketId or mint/prefix must be present
    if (!ticketIdFromQr && !mintPubkeyRaw) {
      return NextResponse.json({ ok: false, error: 'qr_missing_fields' }, { status: 400 });
    }

    // Validate version if present
    if (versionFromQr && versionFromQr !== 1) {
      return NextResponse.json({ ok: false, error: 'unsupported_qr_version' }, { status: 400 });
    }

    // Optional: validity of timestamp if present
    if (typeof tsFromQr === 'number') {
      const now = Math.floor(Date.now() / 1000);
      const maxAge = 365 * 24 * 60 * 60; // 1 year
      if (now - tsFromQr > maxAge) {
        return NextResponse.json({ ok: false, error: 'qr_expired' }, { status: 400 });
      }
    }

    // 2) Lookup ticket in DB.
    // Prefer unique ticketId lookup when QR provided a DB ticketId (string).
    let ticket: any | null = null;

    if (ticketIdFromQr && typeof ticketIdFromQr === 'string') {
      ticket = await prisma.ticket.findUnique({
        where: { ticketId: ticketIdFromQr },
      });
    }

    // If not found, try mint-based lookups.
    if (!ticket && mintPubkeyRaw && typeof mintPubkeyRaw === 'string') {
      const mp = mintPubkeyRaw.trim();

      // If it looks like a short prefix (we expect generator a = first 8 chars), use startsWith.
      // Use a conservative threshold to treat 16 or fewer chars as prefix.
      if (mp.length <= 16) {
        ticket = await prisma.ticket.findFirst({
          where: { mintPubkey: { startsWith: mp } as any },
        });
      } else {
        // full pubkey match
        ticket = await prisma.ticket.findFirst({
          where: { mintPubkey: mp },
        });
      }
    }

    if (!ticket) {
      return NextResponse.json({ ok: false, error: 'ticket_not_found' }, { status: 404 });
    }

    // 3) If checksum & timestamp provided, verify integrity using full asset pubkey from DB.
    if (checksumFromQr && tsFromQr && ticket.mintPubkey) {
      try {
        const fullAssetPubkey = ticket.mintPubkey;
        // ticketIdFromQr might be numeric ticket number when generated; ensure number
        const ticketNumberForChecksum =
          typeof qrPayload?.t === 'number' ? qrPayload.t : Number(qrPayload?.t ?? 0);

        const expectedChecksum = calculateChecksumServer(
          eventIdFromQr ?? ticket.eventId,
          ticketNumberForChecksum,
          fullAssetPubkey,
          tsFromQr
        );

        if (checksumFromQr !== expectedChecksum) {
          return NextResponse.json({ ok: false, error: 'qr_tampered' }, { status: 400 });
        }
      } catch (err) {
        console.error('checksum validation failed', err);
        return NextResponse.json({ ok: false, error: 'invalid_qr_format' }, { status: 400 });
      }
    }

    // 4) Defensive mint match: if QR provided a full mint (m) and DB has a mint, ensure they match
    if (qrPayload?.m && ticket.mintPubkey && qrPayload.m !== ticket.mintPubkey) {
      return NextResponse.json({ ok: false, error: 'mint_mismatch' }, { status: 400 });
    }

    // 5) Ensure ticket is ACTIVE
    if (ticket.status !== 'ACTIVE') {
      return NextResponse.json({ ok: false, error: 'ticket_not_active', status: ticket.status }, { status: 409 });
    }

    // 6) All good — create short-lived challenge JWT and GateVerification row
    const challengeJwt = createChallengeJwt({ ticketId: ticket.ticketId, mintPubkey: ticket.mintPubkey ?? '' }, DEFAULT_EXPIRES);
    const messageToSign = canonicalMessageForJwt(challengeJwt);

    let verificationRecordId: string | null = null;
    try {
      const gv = await prisma.gateVerification.create({
        data: {
          eventId: eventIdFromQr ?? ticket.eventId,
          ticketId: ticket.ticketId,
          verifierPubkey: staffId ?? 'unknown-staff',
          status: 'PENDING',
          createdAt: new Date(),
          location: gateId ?? undefined,
          meta: {
            challengeJwt,
            messageToSign,
            expiresInSeconds: DEFAULT_EXPIRES,
            issuedAt: new Date().toISOString(),
            gateId: gateId ?? null,
            staffId: staffId ?? null,
            rawQrPayload: qrPayload,
          } as any,
        } as any,
      });
      verificationRecordId = gv.verificationId;
    } catch (gvErr) {
      console.error('Failed to create GateVerification row at scan time:', gvErr);
      verificationRecordId = null;
    }

    return NextResponse.json({
      ok: true,
      challengeJwt,
      messageToSign,
      expiresInSeconds: DEFAULT_EXPIRES,
      ticketId: ticket.ticketId,
      eventId: eventIdFromQr ?? ticket.eventId ?? null,
      verificationId: verificationRecordId,
    });
  } catch (err: any) {
    console.error('api/gate/scan error:', err);
    return NextResponse.json({ ok: false, error: 'server_error', details: err?.message ?? String(err) }, { status: 500 });
  }
}
