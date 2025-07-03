import fs from 'fs';
import path from 'path';
import { generatePoster } from '../pages/api/ticket/utils/generatePoster';
import { generateQr } from '../pages/api/ticket/utils/generateQr';
async function main() {
  const qrImage = await generateQr({
    eventId: 'test123',
    userWallet: '7gG3kF8xB2mUJLq3eRzPuzk4ZBbJxU7ExnFGXvcnDn1v', // random Solana wallet
  });

  const posterBuffer = await generatePoster({
    qrImage,
    eventName: 'NightVibe Music Festival 2025',
    eventDate: 'Oct 12, 2025',
    location: 'Jio Arena, Mumbai',
    tier: 'VIP',
  });

  const outPath = path.join(__dirname, 'test-poster.png');
  fs.writeFileSync(outPath, posterBuffer);

  console.log('✅ Poster saved to:', outPath);
}

main().catch(console.error);