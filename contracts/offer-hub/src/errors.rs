use soroban_sdk::contracterror;

/// Contract errors
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Profile already exists for this address
    ProfileAlreadyExists = 1,
    /// Profile not found for this address
    ProfileNotFound = 2,
    /// Claim not found
    ClaimNotFound = 3,
    /// Invalid DID format
    InvalidDid = 6,
    /// Invalid metadata URI
    InvalidMetadataUri = 7,
}

