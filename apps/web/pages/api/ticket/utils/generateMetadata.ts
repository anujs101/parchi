type GenerateMetadataParams = {
  eventId: string;
  eventName: string;
  eventDate: string; // ISO string
  location: string;
  tier: 'VIP' | 'Standard' | 'Premium';
  imageUrl: string; // e.g. ipfs://... or https://...
  userWallet: string;
  hostPublicKey: string; // wallet address of event organizer
};

export function generateMetadata({
  eventId,
  eventName,
  eventDate,
  location,
  tier,
  imageUrl,
  userWallet,
  hostPublicKey,
}: GenerateMetadataParams) {
  return {
    name: `${eventName} - ${tier} Pass`,
    symbol: 'PARCHI',
    description: `Your NFT ticket for ${eventName} on ${eventDate} at ${location}.`,
    image: imageUrl, // Should be an IPFS URI or CDN link
    external_url: `https://parchi.app/event/${eventId}`,
    attributes: [
      { trait_type: 'Event ID', value: eventId },
      { trait_type: 'Tier', value: tier },
      { trait_type: 'Date', value: eventDate },
      { trait_type: 'Location', value: location },
      { trait_type: 'Wallet', value: userWallet },
    ],
    properties: {
      category: 'image',
      files: [
        {
          uri: imageUrl,
          type: 'image/png',
        },
      ],
      creators: [
        {
          address: hostPublicKey,
          share: 100,
        },
      ],
    },
  };
}