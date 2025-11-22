use soroban_sdk::{contracttype, Address, String};

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

