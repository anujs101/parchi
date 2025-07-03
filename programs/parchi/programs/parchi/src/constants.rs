use anchor_lang::prelude::*;

/// Event access tier – useful for defining pricing or benefits
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EventTier {
    General=0,
    VIP=1,
    Backstage=2,
}

impl EventTier {
    /// Convert tier to a human-readable string (optional)
    pub fn as_str(&self) -> &'static str {
        match self {
            EventTier::General => "General",
            EventTier::VIP => "VIP",
            EventTier::Backstage => "Backstage",
        }
    }
}

/// Global seeds for PDAs
pub const GLOBAL_STATE_SEED: &[u8] = b"global-state";
pub const EVENT_SEED: &[u8] = b"event";
pub const TICKET_SEED: &[u8] = b"ticket";

/// Max sizes for variable-length fields (used for account allocation)
pub const MAX_EVENT_NAME_LEN: usize = 64;     // 64 bytes
pub const MAX_METADATA_URI_LEN: usize = 256;  // 256 bytes