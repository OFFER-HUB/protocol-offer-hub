use soroban_sdk::{contract, contractimpl, symbol_short, Address, BytesN, Env, String, Vec};
use crate::types::{Claim, ClaimStatus, Profile};
use crate::errors::Error;
use crate::auth::{validate_did, validate_metadata_uri, validate_claim_ownership};
use crate::storage::{
    add_user_claim, add_issuer_claim, get_claim, get_next_claim_id, 
    get_profile, get_user_claims, get_issuer_claims, has_profile,
    increment_next_claim_id, set_claim, set_profile,
};

#[contract]
pub struct OfferHub;

#[contractimpl]
impl OfferHub {
    /// Register a new profile for the caller
    pub fn register_profile(e: Env, owner: Address, metadata_uri: String) -> Result<(), Error> {
        owner.require_auth();

        // Validate inputs
        validate_metadata_uri(&metadata_uri)?;

        if has_profile(&e, &owner) {
            return Err(Error::ProfileAlreadyExists);
        }

        let profile = Profile {
            owner: owner.clone(),
            metadata_uri: metadata_uri.clone(),
            did: None,
        };

        set_profile(&e, &owner, &profile);
        
        // Emit event
        e.events().publish((symbol_short!("prof_reg"),), (owner, metadata_uri));
        
        Ok(())
    }

    /// Add a new claim to another user
    pub fn add_claim(
        e: Env,
        issuer: Address,
        receiver: Address,
        claim_type: String,
        proof_hash: BytesN<32>,
    ) -> Result<u64, Error> {
        issuer.require_auth();

        let claim_id = increment_next_claim_id(&e);

        let claim = Claim {
            id: claim_id,
            issuer: issuer.clone(),
            receiver: receiver.clone(),
            claim_type: claim_type.clone(),
            proof_hash,
            status: ClaimStatus::Pending,
        };

        set_claim(&e, claim_id, &claim);
        add_user_claim(&e, &receiver, claim_id);
        add_issuer_claim(&e, &issuer, claim_id);

        // Emit event
        e.events().publish((symbol_short!("claim_add"),), (claim_id, issuer, receiver, claim_type));

        Ok(claim_id)
    }

    /// Approve a claim (only by the issuer)
    pub fn approve_claim(e: Env, issuer: Address, claim_id: u64) -> Result<(), Error> {
        issuer.require_auth();

        let mut claim = get_claim(&e, claim_id).ok_or(Error::ClaimNotFound)?;

        // Validate ownership
        validate_claim_ownership(&issuer, &claim.issuer)?;

        if claim.status == ClaimStatus::Approved {
            return Err(Error::ClaimAlreadyApproved);
        }

        if claim.status == ClaimStatus::Rejected {
            return Err(Error::ClaimAlreadyRejected);
        }

        claim.status = ClaimStatus::Approved;
        set_claim(&e, claim_id, &claim);

        // Emit event
        e.events().publish((symbol_short!("claim_app"),), (claim_id, &claim.issuer, &claim.receiver));

        Ok(())
    }

    /// Reject a claim (only by the issuer)
    pub fn reject_claim(e: Env, issuer: Address, claim_id: u64) -> Result<(), Error> {
        issuer.require_auth();

        let mut claim = get_claim(&e, claim_id).ok_or(Error::ClaimNotFound)?;

        // Validate ownership
        validate_claim_ownership(&issuer, &claim.issuer)?;

        if claim.status == ClaimStatus::Approved {
            return Err(Error::ClaimAlreadyApproved);
        }

        if claim.status == ClaimStatus::Rejected {
            return Err(Error::ClaimAlreadyRejected);
        }

        claim.status = ClaimStatus::Rejected;
        set_claim(&e, claim_id, &claim);

        // Emit event
        e.events().publish((symbol_short!("claim_rej"),), (claim_id, &claim.issuer, &claim.receiver));

        Ok(())
    }

    /// Link a DID to the caller's profile
    pub fn link_did(e: Env, owner: Address, did: String) -> Result<(), Error> {
        owner.require_auth();

        // Validate DID format
        validate_did(&did)?;

        let mut profile = get_profile(&e, &owner).ok_or(Error::ProfileNotFound)?;

        profile.did = Some(did.clone());
        set_profile(&e, &owner, &profile);

        // Emit event
        e.events().publish((symbol_short!("did_link"),), (owner, did));

        Ok(())
    }

    // ==========================================================================
    // Getters
    // ==========================================================================

    /// Get profile by address
    pub fn get_profile(e: Env, account: Address) -> Option<Profile> {
        get_profile(&e, &account)
    }

    /// Get claim by ID
    pub fn get_claim(e: Env, claim_id: u64) -> Option<Claim> {
        get_claim(&e, claim_id)
    }

    /// Get all claims received by a user
    pub fn get_user_claims(e: Env, account: Address) -> Vec<Claim> {
        let claim_ids = get_user_claims(&e, &account);
        let mut claims = Vec::new(&e);
        
        for id in claim_ids.iter() {
             if let Some(claim) = get_claim(&e, id) {
                 claims.push_back(claim);
             }
        }
        
        claims
    }

    /// Get all claims issued by a user
    pub fn get_issuer_claims(e: Env, account: Address) -> Vec<Claim> {
        let claim_ids = get_issuer_claims(&e, &account);
        let mut claims = Vec::new(&e);
        
        for id in claim_ids.iter() {
             if let Some(claim) = get_claim(&e, id) {
                 claims.push_back(claim);
             }
        }
        
        claims
    }

    /// Get total number of claims
    pub fn get_total_claims(e: Env) -> u64 {
        get_next_claim_id(&e)
    }
    
    /// Get DID for an address
    pub fn get_did(e: Env, account: Address) -> Option<String> {
        get_profile(&e, &account).and_then(|p| p.did)
    }
}

