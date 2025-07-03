import QRCode from 'qrcode';
import { env } from '@/env'; // Adjust if you use a custom env loader

type GenerateQrParams = {
  eventId: string;
  userWallet: string;
};

export async function generateQr({ eventId, userWallet }: GenerateQrParams): Promise<Buffer> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://parchi.vercel.app/';

  // Construct the QR payload (URL with params)
  const qrUrl = `${baseUrl}/verify?event=${eventId}&wallet=${userWallet}`;

  try {
    // Return QR code as PNG buffer
    return await QRCode.toBuffer(qrUrl, {
      type: 'png',
      width: 300,
      margin: 2,
    });
  } catch (error) {
    console.error('[QR_GENERATION_ERROR]', error);
    throw new Error('Failed to generate QR code');
  }
}