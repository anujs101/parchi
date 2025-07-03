
import QRCode from 'qrcode';

type GenerateQrParams = {
  eventId: string;
  userWallet: string;
};

export async function generateQr({ eventId, userWallet }: GenerateQrParams): Promise<Buffer> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://parchi.vercel.app/';

  const qrUrl = `${baseUrl}/verify?event=${eventId}&wallet=${userWallet}`;

  try {
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