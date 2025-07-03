use anchor_lang::prelude::*;
use crate::{
    context::mint_ticket::*,
    errors::ParchiError,
    state::Event,
};

pub fn handler(ctx: Context<MintTicket>) -> Result<()> {
    let event = &mut ctx.accounts.event;

    // Ensure tickets are still available
    if event.minted_count >= event.max_tickets {
        return Err(ParchiError::Overflow.into());
    }

    // 🎯 [Optional] Call Metaplex to create NFT here using CPI
    // e.g., invoke_create_metadata_accounts_v3(...)
    // This is a placeholder — you'd include full Metaplex CPI here

    // Increment minted count
    event.minted_count = event.minted_count.checked_add(1).ok_or(ParchiError::Overflow)?;

    Ok(())
}