use anchor_lang::prelude::*;

pub mod context;
pub mod instructions;
pub mod state;
pub mod constants;
pub mod errors;
pub mod utils;

use instructions::*;
declare_id!("BTA3ZKyCjvfQq2gBxitcHMwPUAS5WHuDGMyEgMnBLYGj");

#[program]
pub mod parchi {
    use super::*;

    pub fn init_global_state(ctx: Context<InitGlobalState>) -> Result<()> {
        init_global_state::handler(ctx)
    }

    pub fn init_event(ctx: Context<InitEvent>, args: InitEventArgs) -> Result<()> {
        init_event::handler(ctx, args)
    }

    pub fn update_event(ctx: Context<UpdateEvent>, args: UpdateEventArgs) -> Result<()> {
        update_event::handler(ctx, args)
    }

    pub fn mint_ticket(ctx: Context<MintTicket>, args: MintTicketArgs) -> Result<()> {
        mint_ticket::handler(ctx, args)
    }
}