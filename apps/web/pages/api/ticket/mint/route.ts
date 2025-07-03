import { NextResponse } from 'next/server';
import { validateMintRequest } from '../utils/validate';
import { generateQr } from '../utils/generateQr';
import { generatePoster } from '../utils/generatePoster';
import { uploadToStorage } from '../utils/uploadToStorage';
import { mintNft } from '../utils/mintNft';

// Replace with actual creator address (could be req header or env in real setup)
const HOST_PUBLIC_KEY = process.env.NEXT_PUBLIC_HOST_PUBLIC_KEY || 'HOST_PUBLIC_KEY_FALLBACK';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate input
    const parsed = validateMintRequest(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const {
      eventId,
      userWallet,
      eventName,
      eventDate,
      location,
      tier,
    } = parsed.data;

    // 2. Generate QR Code (linked to validation route)
    const qrImage = await generateQr({ eventId, userWallet });

    // 3. Generate poster with QR code
    const posterImage = await generatePoster({
      qrImage,
      eventName,
      eventDate,
      location,
      tier,
    });

    // 4. Upload poster + metadata to IPFS via Pinata
    const metadataUri = await uploadToStorage({
      posterBuffer: posterImage,
      eventId,
      eventName,
      eventDate,
      location,
      tier,
      userWallet,
      hostPublicKey: HOST_PUBLIC_KEY,
    });

    // 5. Mint NFT using Metaplex SDK
    const nft = await mintNft({
      uri: metadataUri,
      userWallet,
      eventId,
      eventName,
    });

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