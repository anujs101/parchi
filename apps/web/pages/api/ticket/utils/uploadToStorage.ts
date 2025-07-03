import pinataSDK from '@pinata/sdk';
import { randomUUID } from 'crypto';
import path from 'path';
import { Readable } from 'stream';
import { config } from 'dotenv';

config(); // Load .env vars

const pinata = new pinataSDK({
  pinataJWTKey: process.env.PINATA_JWT!,
});

interface UploadPosterParams {
  posterBuffer: Buffer;
  eventName: string;
  userWallet: string;
  tier: 'VIP' | 'Standard' | 'Premium';
}

/**
 * Uploads a poster + metadata to IPFS using Pinata
 * Returns: metadataUri
 */
export async function uploadToStorage({
  posterBuffer,
  eventName,
  userWallet,
  tier,
}: UploadPosterParams): Promise<string> {
  // Upload poster image
  const posterStream = Readable.from(posterBuffer);
  const imageRes = await pinata.pinFileToIPFS(posterStream, {
    pinataMetadata: {
      name: `${eventName}-${userWallet}-poster`,
    },
  });

  const imageCID = imageRes.IpfsHash;
  const imageUrl = `ipfs://${imageCID}`;

  // Prepare metadata
  const metadata = {
    name: `${eventName} Ticket`,
    symbol: 'PARCHI',
    description: `Entry pass for ${eventName}`,
    image: imageUrl,
    attributes: [
      { trait_type: 'Tier', value: tier },
      { trait_type: 'Wallet', value: userWallet },
    ],
  };

  // Upload metadata JSON
  const metadataRes = await pinata.pinJSONToIPFS(metadata, {
    pinataMetadata: {
      name: `${eventName}-${userWallet}-metadata-${randomUUID()}`,
    },
  });

  return `ipfs://${metadataRes.IpfsHash}`;
}