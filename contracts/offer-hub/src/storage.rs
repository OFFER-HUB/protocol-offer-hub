use soroban_sdk::{Env, Address, Vec};
use crate::types::{DataKey, Profile, Claim};

const DAY_IN_LEDGERS: u32 = 17280; // Approximately 1 day
const PROFILE_LIFETIME: u32 = DAY_IN_LEDGERS * 365; // 1 year
const CLAIM_LIFETIME: u32 = DAY_IN_LEDGERS * 365; // 1 year
const INSTANCE_LIFETIME: u32 = DAY_IN_LEDGERS * 365; // 1 year

// Profile storage
pub fn has_profile(e: &Env, owner: &Address) -> bool {
    let key = DataKey::Profile(owner.clone());
    e.storage().persistent().has(&key)
}

pub fn get_profile(e: &Env, owner: &Address) -> Option<Profile> {
    let key = DataKey::Profile(owner.clone());
    e.storage().persistent().get(&key)
}

pub fn set_profile(e: &Env, owner: &Address, profile: &Profile) {
    let key = DataKey::Profile(owner.clone());
    e.storage().persistent().set(&key, profile);
    e.storage().persistent().extend_ttl(&key, PROFILE_LIFETIME, PROFILE_LIFETIME);
}

// Claim storage
pub fn get_claim(e: &Env, id: u64) -> Option<Claim> {
    let key = DataKey::Claim(id);
    e.storage().persistent().get(&key)
}

pub fn set_claim(e: &Env, id: u64, claim: &Claim) {
    let key = DataKey::Claim(id);
    e.storage().persistent().set(&key, claim);
    e.storage().persistent().extend_ttl(&key, CLAIM_LIFETIME, CLAIM_LIFETIME);
}

// User claims list (claims received by a user)
pub fn get_user_claims(e: &Env, user: &Address) -> Vec<u64> {
    let key = DataKey::UserClaims(user.clone());
    e.storage().persistent().get(&key).unwrap_or(Vec::new(e))
}

pub fn add_user_claim(e: &Env, user: &Address, claim_id: u64) {
    let key = DataKey::UserClaims(user.clone());
    let mut claims = get_user_claims(e, user);
    claims.push_back(claim_id);
    e.storage().persistent().set(&key, &claims);
    e.storage().persistent().extend_ttl(&key, CLAIM_LIFETIME, CLAIM_LIFETIME);
}

// Issuer claims list (claims issued by a user)
pub fn get_issuer_claims(e: &Env, issuer: &Address) -> Vec<u64> {
    let key = DataKey::IssuerClaims(issuer.clone());
    e.storage().persistent().get(&key).unwrap_or(Vec::new(e))
}

pub fn add_issuer_claim(e: &Env, issuer: &Address, claim_id: u64) {
    let key = DataKey::IssuerClaims(issuer.clone());
    let mut claims = get_issuer_claims(e, issuer);
    claims.push_back(claim_id);
    e.storage().persistent().set(&key, &claims);
    e.storage().persistent().extend_ttl(&key, CLAIM_LIFETIME, CLAIM_LIFETIME);
}

// Global counters
pub fn get_next_claim_id(e: &Env) -> u64 {
    let key = DataKey::NextClaimId;
    e.storage().instance().get(&key).unwrap_or(0)
}

pub fn increment_next_claim_id(e: &Env) -> u64 {
    let key = DataKey::NextClaimId;
    let id = get_next_claim_id(e);
    e.storage().instance().set(&key, &(id + 1));
    e.storage().instance().extend_ttl(INSTANCE_LIFETIME, INSTANCE_LIFETIME);
    id
}

