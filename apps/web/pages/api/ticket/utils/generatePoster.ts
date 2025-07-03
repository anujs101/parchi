import { createCanvas, loadImage, Image } from 'canvas';
import { readFileSync } from 'fs';
import path from 'path';

type GeneratePosterParams = {
  qrImage: Buffer;
  eventName: string;
  eventDate: string;
  location: string;
  tier: 'VIP' | 'General' | 'Backstage';
};

export async function generatePoster({
  qrImage,
  eventName,
  eventDate,
  location,
  tier,
}: GeneratePosterParams): Promise<Buffer> {
  const width = 1080;
  const height = 1920;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Optional: load background
  // const background = await loadImage('someBackground.jpg');
  // ctx.drawImage(background, 0, 0, width, height);

  // Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 60px Sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(eventName, width / 2, 150);

  // Event details
  ctx.font = '36px Sans-serif';
  ctx.fillText(`🕒 ${eventDate}    🎫 ${tier} Pass`, width / 2, 250);
  ctx.fillText(`📍 ${location}`, width / 2, 320);

  // QR code
  const qr = await loadImage(qrImage);
  const qrSize = 500;
  const qrX = (width - qrSize) / 2;
  const qrY = height / 2 - 200;
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

  // “Scan for entry”
  ctx.font = '28px Sans-serif';
  ctx.fillText('Scan for entry', width / 2, qrY + qrSize + 50);

  // Footer
  ctx.font = 'italic 26px Sans-serif';
  ctx.fillText('🎟️ Powered by Parchi', width / 2, height - 100);

  return canvas.toBuffer('image/png');
}