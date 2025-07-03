use anchor_lang::prelude::*;
use crate::{state::{Ticket, Event}, errors::ParchiError};
use crate::constants::TicketStatus;

#[derive(Accounts)]
pub struct MarkTicketClaimed<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"ticket", event.key().as_ref(), user.key(what).as_ref()],
        bump = ticket.bump,
        has_one = owner @ ParchiError::InvalidTicketOwner,
        constraint = ticket.status == TicketStatus::Unclaimed @ ParchiError::AlreadyClaimed
    )]
    pub ticket: Account<'info, Ticket>,

    #[account(
        seeds = [b"event", event.authority.as_ref(), &event.event_id.to_le_bytes()],
        bump = event.bump
    )]
    pub event: Account<'info, Event>,
}

pub fn handler(ctx: Context<MarkTicketClaimed>) -> Result<()> {
    let ticket = &mut ctx.accounts.ticket;
    ticket.status = TicketStatus::Claimed;

    Ok(())
}