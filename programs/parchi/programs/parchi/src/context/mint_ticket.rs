use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct MintTicket<'info> {
    #[account(
        mut,
        seeds = [b"event", event.authority.as_ref(), &event.event_id.to_le_bytes()],
        bump = event.bump,
        has_one = authority
    )]
    pub event: Account<'info, Event>,

    #[account(mut)]
    pub authority: Signer<'info>, // user minting the ticket

    /// CHECK: Mint account (NFT)
    #[account(mut)]
    pub mint: AccountInfo<'info>,

    /// CHECK: Token account for the NFT recipient
    #[account(mut)]
    pub token_account: AccountInfo<'info>,

    /// CHECK: Metadata account (Metaplex standard)
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    /// CHECK: Master Edition (if applicable)
    #[account(mut)]
    pub master_edition: AccountInfo<'info>,

    /// CHECK: Token Metadata Program
    pub token_metadata_program: AccountInfo<'info>,

    /// CHECK: Token Program
    pub token_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}