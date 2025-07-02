use anchor_lang::prelude::*;

pub mod context;
pub mod state;
pub mod constants;
pub mod errors;

use context::*;
use state::*;
declare_id!("BTA3ZKyCjvfQq2gBxitcHMwPUAS5WHuDGMyEgMnBLYGj");

#[program]
pub mod parchi {
    use super::*;

    // Instruction handlers
    pub fn initialize_global_state(ctx: Context<InitializeGlobalState>) -> Result<()> {
        handler_initialize_global_state(ctx)
    }

    pub fn create_event(
        ctx: Context<CreateEvent>,
        tier_data: Vec<TierInput>, // define a TierInput struct in context.rs
        timestamp: i64,
        metadata_uri: String,
    ) -> Result<()> {
        handler_create_event(ctx, tier_data, timestamp, metadata_uri)
    }

    pub fn mint_ticket(ctx: Context<MintTicket>, tier: u8) -> Result<()> {
        handler_mint_ticket(ctx, tier)
    }

    pub fn mark_ticket_used(ctx: Context<MarkTicketUsed>) -> Result<()> {
        handler_mark_ticket_used(ctx)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
