use soroban_sdk::{contracttype, Address, BytesN, String, Symbol, Vec};

/// Linked account (e.g. GitHub, LinkedIn)
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LinkedAccount {
    pub platform: Symbol,
    pub handle: String,
}

/// User profile with optional DID
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Profile {
    pub owner: Address,
    pub metadata_uri: String,
    pub did: Option<String>,
    pub display_name: String,
    pub country_code: Option<Symbol>,
    pub email_hash: Option<BytesN<32>>,
    pub linked_accounts: Vec<LinkedAccount>,
    pub joined_at: u64,
}

/// Status of a claim
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ClaimStatus {
    Pending,
    Approved,
    Rejected,
}

/// Claim structure representing a skill or achievement
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Claim {
    pub id: u64,
    pub issuer: Address,
    pub receiver: Address,
    pub claim_type: String,
    pub proof_hash: BytesN<32>,
    pub status: ClaimStatus,
}

/// Storage keys for the contract
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Profile(Address),
    Claim(u64),
    UserClaims(Address),
    IssuerClaims(Address),
    NextClaimId,
}

