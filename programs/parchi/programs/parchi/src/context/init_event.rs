use anchor_lang::prelude::*;
use crate::state::{GlobalState, Event};
use crate::constants::{EVENT_SEED, GLOBAL_STATE_SEED, MAX_EVENT_NAME_LEN, MAX_METADATA_URI_LEN};

#[derive(Accounts)]
#[instruction(event_id: u64)]
pub struct InitEvent<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
    )]
    pub global_state: Account<'info, GlobalState>,

    /// CHECK: This will be validated as event authority and signer
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        seeds = [EVENT_SEED, authority.key().as_ref(), &event_id.to_le_bytes()],
        bump,
        payer = authority,
        space = 8 + Event::INIT_SPACE,
    )]
    pub event: Account<'info, Event>,

    pub system_program: Program<'info, System>,
}