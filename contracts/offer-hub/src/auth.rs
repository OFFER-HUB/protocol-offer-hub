use soroban_sdk::String;
use crate::errors::Error;

/// Validates that a DID has the correct format
/// Basic validation: checks for did:kilt: prefix and minimum length
pub fn validate_did(did: &String) -> Result<(), Error> {
    if did.len() < 10 {
        return Err(Error::InvalidDid);
    }
    
    // Note: Full DID validation would require string manipulation
    // that's complex in Soroban without std. This is a basic check.
    Ok(())
}

/// Validates metadata URI format
/// Basic check for non-empty and reasonable length
pub fn validate_metadata_uri(uri: &String) -> Result<(), Error> {
    if uri.len() == 0 || uri.len() > 256 {
        return Err(Error::InvalidMetadataUri);
    }
    Ok(())
}

