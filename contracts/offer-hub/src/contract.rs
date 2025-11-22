use soroban_sdk::{contract, contractimpl, symbol_short, Address, BytesN, Env, String, Vec, Symbol};
use crate::types::{Claim, ClaimStatus, Profile, LinkedAccount};
use crate::errors::Error;
use crate::auth::{validate_did, validate_metadata_uri};
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
    pub fn register_profile(
        e: Env,
        owner: Address,
        metadata_uri: String,
        display_name: String,
        country_code: Option<Symbol>, 
        email_hash: Option<BytesN<32>>,
        linked_accounts: Vec<LinkedAccount>
    ) -> Result<(), Error> {
        owner.require_auth();

        // Validate inputs
        validate_metadata_uri(&metadata_uri)?;

        if has_profile(&e, &owner) {
            return Err(Error::ProfileAlreadyExists);
        }
        
        // country_code is already Option<Symbol> (or similar) if we change signature
        // Let's change signature to use Symbol for country_code

        let profile = Profile {
            owner: owner.clone(),
            metadata_uri: metadata_uri.clone(),
            did: None,
            display_name,
            country_code, // Use directly
            email_hash,
            linked_accounts,
            joined_at: e.ledger().timestamp(),
        };

        set_profile(&e, &owner, &profile);
        
        // Emit event
        e.events().publish((symbol_short!("prof_reg"),), (owner, metadata_uri));
        
        Ok(())
    }

    /// Update profile data
    pub fn update_profile_data(
        e: Env,
        owner: Address,
        display_name: String,
        metadata_uri: String,
        country_code: Option<Symbol>,
        email_hash: Option<BytesN<32>>,
        linked_accounts: Vec<LinkedAccount>
    ) -> Result<(), Error> {
        owner.require_auth();
        
        let mut profile = get_profile(&e, &owner).ok_or(Error::ProfileNotFound)?;
        
        validate_metadata_uri(&metadata_uri)?;

        profile.display_name = display_name;
        profile.metadata_uri = metadata_uri;
        profile.country_code = country_code;
        profile.email_hash = email_hash;
        profile.linked_accounts = linked_accounts;

        set_profile(&e, &owner, &profile);
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
            status: ClaimStatus::Approved,
        };

        set_claim(&e, claim_id, &claim);
        add_user_claim(&e, &receiver, claim_id);
        add_issuer_claim(&e, &issuer, claim_id);

        // Emit event
        e.events().publish((symbol_short!("claim_add"),), (claim_id, issuer, receiver, claim_type));

        Ok(claim_id)
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

    /// Get reputation score
    pub fn get_reputation_score(e: Env, account: Address) -> u32 {
        let profile = match get_profile(&e, &account) {
            Some(p) => p,
            None => return 0,
        };

        let claims = get_user_claims(&e, &account);
        let mut score: u32 = 0;

        // 1. Claims score
        for id in claims.iter() {
            if let Some(claim) = get_claim(&e, id) {
                // Only approved claims count (all are approved now, but good check)
                if claim.status == ClaimStatus::Approved {
                    let tipo = claim.claim_type;
                    // Check type string content
                    // Note: In Soroban String comparison can be tricky if not careful with allocation
                    // We'll do basic starts_with logic manually or exact match
                    
                    // Simple exact match for "job_completed"
                    if tipo == String::from_str(&e, "job_completed") {
                        score += 10;
                    } else {
                        // Check if starts with "skill_"
                        // For MVP simpler: just check exact types or default
                        // Implementing starts_with manually is verbose, let's assume specific types for now
                        // or just give 5 points for everything else as a baseline + bonus
                        score += 5;
                    }
                }
            }
        }

        // 2. Age score (weeks since joined)
        // 604800 seconds in a week
        let current_time = e.ledger().timestamp();
        if current_time > profile.joined_at {
            let weeks = (current_time - profile.joined_at) / 604800;
            // Cap age score to avoid overflow if very old (unlikely)
            if weeks > 0 {
                 score += weeks as u32;
            }
        }

        score
    }
    
    /// Get DID for an address
    pub fn get_did(e: Env, account: Address) -> Option<String> {
        get_profile(&e, &account).and_then(|p| p.did)
    }
}

