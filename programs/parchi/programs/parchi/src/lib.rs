use anchor_lang::prelude::*;
mod instructions;
pub use instructions::*;
pub mod context;
pub mod state;
pub mod constants;
pub mod errors;
pub mod utils;

use instructions::*;
declare_id!("BTA3ZKyCjvfQq2gBxitcHMwPUAS5WHuDGMyEgMnBLYGj");

#[program]
pub mod parchi {
    use super::*;

     pub fn init_event(
        ctx: Context<InitEvent>,
        name: String,
        tier: EventTier,
        timestamp: i64,
        max_tickets: u32,
        uri: String,
    ) -> Result<()> {
        init_event::handler(ctx, name, tier, timestamp, max_tickets, uri)
    }
    pub fn init_global_state(ctx: Context<InitGlobalState>) -> Result<()> {
        init_global_state::handler(ctx)
    }

    pub fn update_event(ctx: Context<UpdateEvent>, args: UpdateEventArgs) -> Result<()> {
        update_event::handler(ctx, args)
    }

    pub fn mark_ticket_claimed(ctx: Context<MarkTicketClaimed>) -> Result<()> {
    instructions::mark_ticket_claimed::handler(ctx)
    }

}
#[event]
pub struct TicketMinted {
    pub user: Pubkey,
    pub event: Pubkey,
}