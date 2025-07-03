// apps/web/app/api/ticket/mint/route.ts

import { NextResponse } from 'next/server';
import { validateMintRequest } from '../utils/validate';
import { generateQr } from '../utils/generateQr';
import { generatePoster } from '../utils/generatePoster';
import { uploadToStorage } from '../utils/uploadToStorage';
import { mintNft } from '../utils/mintNft';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate input using Zod schema
    const parsed = validateMintRequest(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { eventId, userWallet, eventName, eventDate, location, tier } = parsed.data;

    // 2. Generate QR code (encodes event + ticket data)
    const qrImage = await generateQr({ eventId, userWallet });

    // 3. Generate poster with embedded QR code
    const posterImage = await generatePoster({
      qrImage,
      eventName,
      eventDate,
      location,
      tier,
    });

    // 4. Upload poster to storage (S3/IPFS)
    const uri = await uploadToStorage(posterImage);

    // 5. Mint NFT using Metaplex SDK
    const nft = await mintNft({
      uri,
      userWallet,
      eventId,
      eventName,
    });

    // Success response
    return NextResponse.json({ success: true, nft }, { status: 200 });

  } catch (error: any) {
    console.error('[MINT_TICKET_ERROR]', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        detail: error?.message ?? 'Unknown failure',
      },
      { status: 500 }
    );
  }
}