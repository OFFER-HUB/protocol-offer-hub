#![cfg(test)]

use super::contract::{OfferHub, OfferHubClient};
use super::errors::Error;
use super::types::ClaimStatus;
use soroban_sdk::{testutils::{Address as _, BytesN as _}, Address, BytesN, Env, String};

fn create_contract<'a>(e: &Env) -> OfferHubClient<'a> {
    let contract_id = e.register(OfferHub, ());
    OfferHubClient::new(e, &contract_id)
}

// ==========================================================================
// Profile Tests
// ==========================================================================

#[test]
fn test_register_profile_success() {
    let e = Env::default();
    e.mock_all_auths();
    
    let client = create_contract(&e);
    let alice = Address::generate(&e);
    let metadata = String::from_str(&e, "ipfs://QmTest123");

    // Register profile
    client.register_profile(&alice, &metadata);

    // Verify profile
    let profile = client.get_profile(&alice).unwrap();
    assert_eq!(profile.owner, alice);
    assert_eq!(profile.metadata_uri, metadata);
    assert_eq!(profile.did, None);
}

#[test]
fn test_register_duplicate_profile_fails() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let alice = Address::generate(&e);
    let metadata = String::from_str(&e, "ipfs://QmTest123");

    client.register_profile(&alice, &metadata);
    
    let res = client.try_register_profile(&alice, &metadata);
    assert_eq!(res, Err(Ok(Error::ProfileAlreadyExists)));
}

#[test]
fn test_register_profile_empty_metadata_fails() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let alice = Address::generate(&e);
    let metadata = String::from_str(&e, "");

    let res = client.try_register_profile(&alice, &metadata);
    assert_eq!(res, Err(Ok(Error::InvalidMetadataUri)));
}

#[test]
fn test_register_multiple_profiles() {
    let e = Env::default();
    e.mock_all_auths();
    
    let client = create_contract(&e);
    let alice = Address::generate(&e);
    let bob = Address::generate(&e);
    let charlie = Address::generate(&e);

    let metadata_alice = String::from_str(&e, "ipfs://Alice");
    let metadata_bob = String::from_str(&e, "ipfs://Bob");
    let metadata_charlie = String::from_str(&e, "ipfs://Charlie");

    client.register_profile(&alice, &metadata_alice);
    client.register_profile(&bob, &metadata_bob);
    client.register_profile(&charlie, &metadata_charlie);

    assert!(client.get_profile(&alice).is_some());
    assert!(client.get_profile(&bob).is_some());
    assert!(client.get_profile(&charlie).is_some());
}

// ==========================================================================
// Claim Tests
// ==========================================================================

#[test]
fn test_add_claim_success() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer = Address::generate(&e);
    let receiver = Address::generate(&e);
    
    let claim_type = String::from_str(&e, "hackathon_winner");
    let proof_hash = BytesN::random(&e);

    let claim_id = client.add_claim(&issuer, &receiver, &claim_type, &proof_hash);
    assert_eq!(claim_id, 0);

    let claim = client.get_claim(&claim_id).unwrap();
    assert_eq!(claim.issuer, issuer);
    assert_eq!(claim.receiver, receiver);
    assert_eq!(claim.claim_type, claim_type);
    assert_eq!(claim.status, ClaimStatus::Pending);
}

#[test]
fn test_add_multiple_claims() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer = Address::generate(&e);
    let receiver = Address::generate(&e);
    
    let claim_type1 = String::from_str(&e, "skill1");
    let claim_type2 = String::from_str(&e, "skill2");
    let claim_type3 = String::from_str(&e, "skill3");
    let proof_hash = BytesN::random(&e);

    let id1 = client.add_claim(&issuer, &receiver, &claim_type1, &proof_hash);
    let id2 = client.add_claim(&issuer, &receiver, &claim_type2, &proof_hash);
    let id3 = client.add_claim(&issuer, &receiver, &claim_type3, &proof_hash);

    assert_eq!(id1, 0);
    assert_eq!(id2, 1);
    assert_eq!(id3, 2);

    let user_claims = client.get_user_claims(&receiver);
    assert_eq!(user_claims.len(), 3);
}

#[test]
fn test_approve_claim_success() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer = Address::generate(&e);
    let receiver = Address::generate(&e);
    
    let claim_type = String::from_str(&e, "test_skill");
    let proof_hash = BytesN::random(&e);

    let claim_id = client.add_claim(&issuer, &receiver, &claim_type, &proof_hash);
    client.approve_claim(&issuer, &claim_id);
    
    let claim = client.get_claim(&claim_id).unwrap();
    assert_eq!(claim.status, ClaimStatus::Approved);
}

#[test]
fn test_approve_claim_twice_fails() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer = Address::generate(&e);
    let receiver = Address::generate(&e);
    
    let claim_type = String::from_str(&e, "test");
    let proof_hash = BytesN::random(&e);

    let claim_id = client.add_claim(&issuer, &receiver, &claim_type, &proof_hash);
    client.approve_claim(&issuer, &claim_id);
    
    let res = client.try_approve_claim(&issuer, &claim_id);
    assert_eq!(res, Err(Ok(Error::ClaimAlreadyApproved)));
}

#[test]
fn test_approve_nonexistent_claim_fails() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer = Address::generate(&e);

    let res = client.try_approve_claim(&issuer, &999);
    assert_eq!(res, Err(Ok(Error::ClaimNotFound)));
}

#[test]
fn test_unauthorized_approval_fails() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer = Address::generate(&e);
    let receiver = Address::generate(&e);
    let attacker = Address::generate(&e);
    
    let claim_type = String::from_str(&e, "test");
    let proof_hash = BytesN::random(&e);

    let claim_id = client.add_claim(&issuer, &receiver, &claim_type, &proof_hash);

    let res = client.try_approve_claim(&attacker, &claim_id);
    assert_eq!(res, Err(Ok(Error::UnauthorizedApproval)));
}

#[test]
fn test_reject_claim_success() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer = Address::generate(&e);
    let receiver = Address::generate(&e);
    
    let claim_type = String::from_str(&e, "test");
    let proof_hash = BytesN::random(&e);

    let claim_id = client.add_claim(&issuer, &receiver, &claim_type, &proof_hash);
    client.reject_claim(&issuer, &claim_id);
    
    let claim = client.get_claim(&claim_id).unwrap();
    assert_eq!(claim.status, ClaimStatus::Rejected);
}

#[test]
fn test_reject_approved_claim_fails() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer = Address::generate(&e);
    let receiver = Address::generate(&e);
    
    let claim_type = String::from_str(&e, "test");
    let proof_hash = BytesN::random(&e);

    let claim_id = client.add_claim(&issuer, &receiver, &claim_type, &proof_hash);
    client.approve_claim(&issuer, &claim_id);
    
    let res = client.try_reject_claim(&issuer, &claim_id);
    assert_eq!(res, Err(Ok(Error::ClaimAlreadyApproved)));
}

#[test]
fn test_approve_rejected_claim_fails() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer = Address::generate(&e);
    let receiver = Address::generate(&e);
    
    let claim_type = String::from_str(&e, "test");
    let proof_hash = BytesN::random(&e);

    let claim_id = client.add_claim(&issuer, &receiver, &claim_type, &proof_hash);
    client.reject_claim(&issuer, &claim_id);
    
    let res = client.try_approve_claim(&issuer, &claim_id);
    assert_eq!(res, Err(Ok(Error::ClaimAlreadyRejected)));
}

// ==========================================================================
// DID Tests
// ==========================================================================

#[test]
fn test_link_did_success() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let alice = Address::generate(&e);
    let metadata = String::from_str(&e, "ipfs://QmTest");

    client.register_profile(&alice, &metadata);
    
    let did = String::from_str(&e, "did:kilt:4r1WkS3t8rbCb11H8t3tJvGVCynwDXSUBiuGB6sLRHzCLCjs");
    client.link_did(&alice, &did);

    let stored_did = client.get_did(&alice).unwrap();
    assert_eq!(stored_did, did);
    
    let profile = client.get_profile(&alice).unwrap();
    assert_eq!(profile.did, Some(did));
}

#[test]
fn test_link_did_without_profile_fails() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let alice = Address::generate(&e);
    let did = String::from_str(&e, "did:kilt:123456789");

    let res = client.try_link_did(&alice, &did);
    assert_eq!(res, Err(Ok(Error::ProfileNotFound)));
}

#[test]
fn test_link_invalid_did_fails() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let alice = Address::generate(&e);
    let metadata = String::from_str(&e, "ipfs://QmTest");

    client.register_profile(&alice, &metadata);
    
    let did = String::from_str(&e, "short");
    let res = client.try_link_did(&alice, &did);
    assert_eq!(res, Err(Ok(Error::InvalidDid)));
}

#[test]
fn test_update_did() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let alice = Address::generate(&e);
    let metadata = String::from_str(&e, "ipfs://QmTest");

    client.register_profile(&alice, &metadata);
    
    let did1 = String::from_str(&e, "did:kilt:old12345");
    client.link_did(&alice, &did1);
    
    let did2 = String::from_str(&e, "did:kilt:new12345");
    client.link_did(&alice, &did2);

    let stored_did = client.get_did(&alice).unwrap();
    assert_eq!(stored_did, did2);
}

// ==========================================================================
// Getter Tests
// ==========================================================================

#[test]
fn test_get_user_claims() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer1 = Address::generate(&e);
    let issuer2 = Address::generate(&e);
    let receiver = Address::generate(&e);
    
    let claim_type = String::from_str(&e, "skill");
    let proof_hash = BytesN::random(&e);

    client.add_claim(&issuer1, &receiver, &claim_type, &proof_hash);
    client.add_claim(&issuer2, &receiver, &claim_type, &proof_hash);
    client.add_claim(&issuer1, &receiver, &claim_type, &proof_hash);

    let user_claims = client.get_user_claims(&receiver);
    assert_eq!(user_claims.len(), 3);
}

#[test]
fn test_get_issuer_claims() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer = Address::generate(&e);
    let receiver1 = Address::generate(&e);
    let receiver2 = Address::generate(&e);
    let receiver3 = Address::generate(&e);
    
    let claim_type = String::from_str(&e, "endorsement");
    let proof_hash = BytesN::random(&e);

    client.add_claim(&issuer, &receiver1, &claim_type, &proof_hash);
    client.add_claim(&issuer, &receiver2, &claim_type, &proof_hash);
    client.add_claim(&issuer, &receiver3, &claim_type, &proof_hash);

    let issuer_claims = client.get_issuer_claims(&issuer);
    assert_eq!(issuer_claims.len(), 3);
}

#[test]
fn test_get_total_claims() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    let issuer = Address::generate(&e);
    let receiver = Address::generate(&e);
    
    let claim_type = String::from_str(&e, "test");
    let proof_hash = BytesN::random(&e);

    assert_eq!(client.get_total_claims(), 0);
    
    client.add_claim(&issuer, &receiver, &claim_type, &proof_hash);
    assert_eq!(client.get_total_claims(), 1);
    
    client.add_claim(&issuer, &receiver, &claim_type, &proof_hash);
    assert_eq!(client.get_total_claims(), 2);
}

#[test]
fn test_get_nonexistent_profile() {
    let e = Env::default();
    let client = create_contract(&e);
    let alice = Address::generate(&e);
    
    assert_eq!(client.get_profile(&alice), None);
}

#[test]
fn test_get_nonexistent_claim() {
    let e = Env::default();
    let client = create_contract(&e);
    
    assert_eq!(client.get_claim(&999), None);
}

// ==========================================================================
// Integration Tests
// ==========================================================================

#[test]
fn test_full_workflow() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    
    // Create participants
    let issuer = Address::generate(&e);
    let receiver = Address::generate(&e);
    
    // Register profiles
    let issuer_metadata = String::from_str(&e, "ipfs://issuer");
    let receiver_metadata = String::from_str(&e, "ipfs://receiver");
    client.register_profile(&issuer, &issuer_metadata);
    client.register_profile(&receiver, &receiver_metadata);
    
    // Link DIDs
    let issuer_did = String::from_str(&e, "did:kilt:issuer123");
    let receiver_did = String::from_str(&e, "did:kilt:receiver456");
    client.link_did(&issuer, &issuer_did);
    client.link_did(&receiver, &receiver_did);
    
    // Add claims
    let claim_type = String::from_str(&e, "rust_expert");
    let proof_hash = BytesN::random(&e);
    let claim_id = client.add_claim(&issuer, &receiver, &claim_type, &proof_hash);
    
    // Approve claim
    client.approve_claim(&issuer, &claim_id);
    
    // Verify final state
    let issuer_profile = client.get_profile(&issuer).unwrap();
    assert_eq!(issuer_profile.did, Some(issuer_did));
    
    let receiver_profile = client.get_profile(&receiver).unwrap();
    assert_eq!(receiver_profile.did, Some(receiver_did));
    
    let claim = client.get_claim(&claim_id).unwrap();
    assert_eq!(claim.status, ClaimStatus::Approved);
    
    let receiver_claims = client.get_user_claims(&receiver);
    assert_eq!(receiver_claims.len(), 1);
    
    let issuer_claims = client.get_issuer_claims(&issuer);
    assert_eq!(issuer_claims.len(), 1);
}

#[test]
fn test_multiple_issuers_multiple_receivers() {
    let e = Env::default();
    e.mock_all_auths();

    let client = create_contract(&e);
    
    let issuer1 = Address::generate(&e);
    let issuer2 = Address::generate(&e);
    let receiver1 = Address::generate(&e);
    let receiver2 = Address::generate(&e);
    
    let claim_type = String::from_str(&e, "skill");
    let proof_hash = BytesN::random(&e);
    
    // Issuer1 -> Receiver1
    client.add_claim(&issuer1, &receiver1, &claim_type, &proof_hash);
    // Issuer1 -> Receiver2
    client.add_claim(&issuer1, &receiver2, &claim_type, &proof_hash);
    // Issuer2 -> Receiver1
    client.add_claim(&issuer2, &receiver1, &claim_type, &proof_hash);
    // Issuer2 -> Receiver2
    client.add_claim(&issuer2, &receiver2, &claim_type, &proof_hash);
    
    assert_eq!(client.get_user_claims(&receiver1).len(), 2);
    assert_eq!(client.get_user_claims(&receiver2).len(), 2);
    assert_eq!(client.get_issuer_claims(&issuer1).len(), 2);
    assert_eq!(client.get_issuer_claims(&issuer2).len(), 2);
}

