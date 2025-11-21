use soroban_sdk::{contracttype, symbol_short, Address, String, Symbol};

/// Event emitted when a new profile is registered
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProfileRegisteredEvent {
    pub owner: Address,
    pub metadata_uri: String,
}

/// Event emitted when a claim is added
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ClaimAddedEvent {
    pub claim_id: u64,
    pub issuer: Address,
    pub receiver: Address,
    pub claim_type: String,
}

/// Event emitted when a claim is approved
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ClaimApprovedEvent {
    pub claim_id: u64,
    pub issuer: Address,
    pub receiver: Address,
}

/// Event emitted when a claim is rejected
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ClaimRejectedEvent {
    pub claim_id: u64,
    pub issuer: Address,
    pub receiver: Address,
}

/// Event emitted when a DID is linked
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DidLinkedEvent {
    pub owner: Address,
    pub did: String,
}

/// Event topic constants
pub const PROFILE_REGISTERED: Symbol = symbol_short!("prof_reg");
pub const CLAIM_ADDED: Symbol = symbol_short!("claim_add");
pub const CLAIM_APPROVED: Symbol = symbol_short!("claim_app");
pub const CLAIM_REJECTED: Symbol = symbol_short!("claim_rej");
pub const DID_LINKED: Symbol = symbol_short!("did_link");

