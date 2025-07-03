use anchor_lang::prelude::*;

#[error_code]
pub enum ParchiError {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,

    #[msg("Event not found.")]
    EventNotFound,

    #[msg("Maximum tickets already minted.")]
    MaxTicketsReached,

    #[msg("Invalid ticket tier.")]
    InvalidTier,

    #[msg("Ticket already marked as used.")]
    TicketAlreadyUsed,

    #[msg("Ticket not found or does not belong to this event.")]
    InvalidTicket,

    #[msg("Ticket usage verification failed.")]
    TicketVerificationFailed,

    #[msg("Cannot mint tickets for past events.")]
    EventExpired,

    #[msg("Invalid input.")]
    InvalidInput,

    #[msg("Event name too long.")]
    NameTooLong,

    #[msg("Metadata URI too long.")]
    UriTooLong,

    #[msg("Overflow while incrementing event ID.")]
    Overflow,

    #[msg("Maximum number of tickets for this event has been reached.")]
    MaxTicketLimitReached,

    #[msg("Ticket PDA bump not found.")]
    BumpNotFound,

    #[msg("Math operation overflowed.")]
    MathOverflow,
}