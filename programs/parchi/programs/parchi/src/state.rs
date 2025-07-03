use anchor_lang::prelude::*;
use crate::constants::EventTier;
use crate::constants::TicketStatus;
/// Stores the global authority and event counter
#[account]
pub struct GlobalState {
    pub authority: Pubkey, // Admin or protocol-level owner
    pub last_event_id: u64,
    pub bump: u8,
}

impl GlobalState {
    pub const INIT_SPACE: usize = 8 + // discriminator
        32 + // authority
        8 +  // last_event_id
        1;   // bump
}

/// Represents a single event created by an organizer
#[account]
pub struct Event {
    pub authority: Pubkey,       // Wallet that created the event
    pub event_id: u64,           // Globally unique event ID
    pub name: String,            // Event title
    pub tier: EventTier,         // Tier (VIP / General / Backstage etc.)
    pub timestamp: i64,          // Scheduled time
    pub max_tickets: u32,        // Capacity
    pub minted_count: u32,       // Count of tickets minted
    pub uri: String,             // IPFS metadata URI
    pub bump: u8,                // PDA bump
}

impl Event {
    /// Returns number of tickets still available for minting
    pub fn remaining_tickets(&self) -> u32 {
        self.max_tickets.saturating_sub(self.minted_count)
    }

    /// Calculate account space to avoid magic numbers
   pub const INIT_SPACE: usize =  // total space = discriminator + fields
        8 + // discriminator
        32 + // authority
        8 + // event_id
        4 + MAX_EVENT_NAME_LEN + // name (String = 4 bytes length prefix + data)
        1 + // tier (enum as u8)
        8 + // timestamp
        4 + // max_tickets
        4 + // minted_count
        4 + MAX_METADATA_URI_LEN + // uri
        1; // bump
}

#[account]
pub struct Ticket {
    pub event: Pubkey,           // Associated event
    pub owner: Pubkey,           // User who owns the ticket
    pub status: TicketStatus,    // Unclaimed, Claimed, etc.
    pub bump: u8,                // PDA bump
}

impl Ticket {
    pub const INIT_SPACE: usize = 8 + 32 + 32 + 1 + 1; // anchor discriminator + pubkeys + status + bump
}