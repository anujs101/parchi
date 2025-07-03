use anchor_lang::prelude::*;
use crate::{
    state::{Event, GlobalState, Ticket},
    constants::{TICKET_SEED, EVENT_SEED},
    errors::ParchiError,
    constants::TicketStatus,
};

/// Accounts required for claiming a ticket
#[derive(Accounts)]
#[instruction(event_id: u64)]
pub struct ClaimTicket<'info> {
    #[account(
        mut,
        seeds = [b"global"],
        bump = global_state.bump,
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [EVENT_SEED, &event_id.to_le_bytes()],
        bump = event.bump,
    )]
    pub event: Account<'info, Event>,

    #[account(
        init,
        seeds = [TICKET_SEED, event.key().as_ref(), user.key().as_ref()],
        bump,
        payer = user,
        space = Ticket::INIT_SPACE,
    )]
    pub ticket: Account<'info, Ticket>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ClaimTicket>, event_id: u64) -> Result<()> {
    let event = &mut ctx.accounts.event;
    let ticket = &mut ctx.accounts.ticket;

    // Ensure tickets are still available
    if event.remaining_tickets() == 0 {
        return Err(ParchiError::EventSoldOut.into());
    }

    // Initialize ticket data
    ticket.event = event.key();
    ticket.owner = ctx.accounts.user.key();
    ticket.status = TicketStatus::Unclaimed;
    ticket.bump = *ctx.bumps.get("ticket").ok_or(ParchiError::MissingBump)?;

    // Increment minted count
    event.minted_count = event
        .minted_count
        .checked_add(1)
        .ok_or(ParchiError::Overflow)?;

    Ok(())
}