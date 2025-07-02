use anchor_lang::prelude::*;
use crate::{
    state::{Event, GlobalState},
    constants::EventTier,
    errors::ParchiError,
};

#[derive(Accounts)]
#[instruction(name: String, uri: String)]
pub struct InitEvent<'info> {
    #[account(mut, has_one = authority)]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        init,
        seeds = [b"event", authority.key().as_ref(), &global_state.last_event_id.to_le_bytes()],
        bump,
        payer = authority,
        space = 8 + Event::INIT_SPACE,
    )]
    pub event: Account<'info, Event>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitEvent>,
    name: String,
    tier: EventTier,
    timestamp: i64,
    max_tickets: u32,
    uri: String,
) -> Result<()> {
    if name.len() > crate::constants::MAX_EVENT_NAME_LEN {
        return Err(ParchiError::NameTooLong.into());
    }

    if uri.len() > crate::constants::MAX_METADATA_URI_LEN {
        return Err(ParchiError::UriTooLong.into());
    }

    let global_state = &mut ctx.accounts.global_state;
    let event = &mut ctx.accounts.event;

    event.authority = ctx.accounts.authority.key();
    event.event_id = global_state.last_event_id;
    event.name = name;
    event.tier = tier;
    event.timestamp = timestamp;
    event.max_tickets = max_tickets;
    event.minted_count = 0;
    event.uri = uri;
    event.bump = *ctx.bumps.get("event").unwrap();

    // Increment the event ID counter in GlobalState
    global_state.last_event_id = global_state
        .last_event_id
        .checked_add(1)
        .ok_or(ParchiError::Overflow)?;

    Ok(())
}