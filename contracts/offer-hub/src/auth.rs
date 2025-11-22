use soroban_sdk::String;
use crate::errors::Error;

/// Validates metadata URI format
/// Basic check for non-empty and reasonable length
pub fn validate_metadata_uri(uri: &String) -> Result<(), Error> {
    if uri.len() == 0 || uri.len() > 256 {
        return Err(Error::InvalidMetadataUri);
    }
    Ok(())
}

