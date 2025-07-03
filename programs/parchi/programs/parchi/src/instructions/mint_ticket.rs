use anchor_lang::prelude::*;

use crate::{
    constants::TicketStatus,
    errors::ParchiError,
    state::{Event, Ticket},
};

/// Accounts required to mint a ticket for a specific event.
#[derive(Accounts)]
#[instruction()]
pub struct MintTicket<'info> {
    /// The wallet of the user who is minting the ticket.
    #[account(mut)]
    pub user: Signer<'info>,

    /// The event for which the ticket is being minted.
    #[account(
        mut,
        seeds = [b"event", event.event_id.to_le_bytes().as_ref()],
        bump = event.bump,
    )]
    pub event: Account<'info, Event>,

    /// The unique ticket account PDA for the user-event combo.
    #[account(
        init,
        payer = user,
        seeds = [b"ticket", event.key().as_ref(), user.key().as_ref()],
        bump,
        space = Ticket::INIT_SPACE,
    )]
    pub ticket: Account<'info, Ticket>,

    /// The Solana system program.
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MintTicket>) -> Result<()> {
    let event = &mut ctx.accounts.event;
    let ticket = &mut ctx.accounts.ticket;
    let user = &ctx.accounts.user;

    // Safety check: Prevent overselling
    require!(
        event.minted_count < event.max_tickets,
        ParchiError::MaxTicketLimitReached
    );

    // Safety check: Tier availability logic can be added here later

    // Update event state
    event.minted_count = event
        .minted_count
        .checked_add(1)
        .ok_or(ParchiError::MathOverflow)?;

    // Initialize ticket
    ticket.event = event.key();
    ticket.owner = user.key();
    ticket.status = TicketStatus::Unclaimed;
    ticket.bump = *ctx.bumps.get("ticket").ok_or(ParchiError::BumpNotFound)?;

    emit!(TicketMinted {
    user: user.key(),
    event: event.key(),
    });
    Ok(())
}