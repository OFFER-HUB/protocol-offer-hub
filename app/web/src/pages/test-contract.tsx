import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useOfferHubContract } from '@/hooks/use-offer-hub-contract';
import { WalletButton } from '@/components/WalletButton';
import { Layout } from '@/components/Layout';

export default function TestContractPage() {
  const { isConnected, publicKey } = useWallet();
  const { 
    isReady, 
    error: contractError,
    registerProfile,
    addClaim,
    getProfile,
    getReputationScore,
    getTotalClaims,
    getDid,
    getUserClaims,
    getIssuerClaims,
    getClaim
  } = useOfferHubContract();

  // State for inputs
  const [metadataUri, setMetadataUri] = useState('ipfs://test-metadata');
  const [displayName, setDisplayName] = useState('Test User');
  const [countryCode, setCountryCode] = useState('US');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [claimType, setClaimType] = useState('test_claim');
  const [proofHash, setProofHash] = useState('00'.repeat(32)); // 32 bytes hex
  const [profileToQuery, setProfileToQuery] = useState('');
  const [userClaimsAddress, setUserClaimsAddress] = useState('');
  const [issuerClaimsAddress, setIssuerClaimsAddress] = useState('');
  const [claimIdToQuery, setClaimIdToQuery] = useState('');
  
  // State for outputs
  const [logs, setLogs] = useState<string[]>([]);
  const [totalClaims, setTotalClaims] = useState<number | null>(null);
  const [userClaimsResult, setUserClaimsResult] = useState<any[] | null>(null);
  const [issuerClaimsResult, setIssuerClaimsResult] = useState<any[] | null>(null);
  const [claimResult, setClaimResult] = useState<any | null>(null);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  // Load initial data
  useEffect(() => {
    if (isReady) {
      addLog('Contract Ready');
      handleGetTotalClaims();
    }
  }, [isReady]);

  // -- Handlers --

  const handleRegisterProfile = async () => {
    try {
      addLog(`Registering profile for ${displayName}...`);
      await registerProfile({ 
        metadata_uri: metadataUri,
        display_name: displayName,
        country_code: countryCode,
        linked_accounts: [],
        email_hash: undefined
      });
      addLog('Success: Profile registered!');
    } catch (e: any) {
      addLog(`Error: ${e.message}`);
    }
  };

  const handleAddClaim = async () => {
    try {
      addLog(`Adding claim to ${receiverAddress}...`);
      // Convert simple hex string to Uint8Array
      const proofBytes = new Uint8Array(Buffer.from(proofHash, 'hex'));
      if (proofBytes.length !== 32) {
         throw new Error('Proof hash must be 32 bytes (64 hex chars)');
      }
      
      const claimId = await addClaim({
        receiver: receiverAddress,
        claim_type: claimType,
        proof_hash: proofBytes
      });
      addLog(`Success: Claim added! Claim ID: ${claimId}`);
      handleGetTotalClaims();
    } catch (e: any) {
      addLog(`Error: ${e.message}`);
    }
  };

  const handleGetProfile = async () => {
    try {
      const addr = profileToQuery || publicKey;
      if (!addr) return;
      
      addLog(`Querying profile for ${addr}...`);
      const profile = await getProfile(addr);
      let score = 0;
      if (profile) {
         score = await getReputationScore(addr);
      }
      addLog(`Result: ${profile ? JSON.stringify({...profile, reputation: score}) : 'No profile found'}`);
    } catch (e: any) {
      addLog(`Error: ${e.message}`);
    }
  };

  const handleGetTotalClaims = async () => {
    try {
      const total = await getTotalClaims();
      setTotalClaims(total);
      addLog(`Total claims: ${total}`);
    } catch (e: any) {
      addLog(`Error getting total: ${e.message}`);
    }
  };

  const handleGetUserClaims = async () => {
    try {
      const addr = userClaimsAddress || publicKey;
      if (!addr) {
        addLog('Error: No address provided');
        return;
      }
      
      addLog(`Querying user claims for ${addr}...`);
      const claims = await getUserClaims(addr);
      setUserClaimsResult(claims);
      addLog(`Result: Found ${claims.length} claim(s)`);
      if (claims.length > 0) {
        claims.forEach((claim, idx) => {
          addLog(`  Claim ${idx + 1}: ID=${claim.id}, Type=${claim.claim_type}, Issuer=${claim.issuer.substring(0, 8)}...`);
        });
      }
    } catch (e: any) {
      addLog(`Error: ${e.message}`);
      setUserClaimsResult(null);
    }
  };

  const handleGetIssuerClaims = async () => {
    try {
      const addr = issuerClaimsAddress || publicKey;
      if (!addr) {
        addLog('Error: No address provided');
        return;
      }
      
      addLog(`Querying issuer claims for ${addr}...`);
      const claims = await getIssuerClaims(addr);
      setIssuerClaimsResult(claims);
      addLog(`Result: Found ${claims.length} claim(s) issued`);
      if (claims.length > 0) {
        claims.forEach((claim, idx) => {
          addLog(`  Claim ${idx + 1}: ID=${claim.id}, Type=${claim.claim_type}, Receiver=${claim.receiver.substring(0, 8)}...`);
        });
      }
    } catch (e: any) {
      addLog(`Error: ${e.message}`);
      setIssuerClaimsResult(null);
    }
  };

  const handleGetClaim = async () => {
    try {
      if (!claimIdToQuery) {
        addLog('Error: Claim ID is required');
        return;
      }
      
      const claimId = parseInt(claimIdToQuery, 10);
      if (isNaN(claimId)) {
        addLog('Error: Invalid claim ID (must be a number)');
        return;
      }
      
      addLog(`Querying claim ID ${claimId}...`);
      const claim = await getClaim(claimId);
      setClaimResult(claim);
      if (claim) {
        addLog(`Result: Claim found`);
        addLog(`  ID: ${claim.id}`);
        addLog(`  Type: ${claim.claim_type}`);
        addLog(`  Issuer: ${claim.issuer}`);
        addLog(`  Receiver: ${claim.receiver}`);
        addLog(`  Status: ${claim.status}`);
      } else {
        addLog(`Result: Claim not found`);
      }
    } catch (e: any) {
      addLog(`Error: ${e.message}`);
      setClaimResult(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Contract Integration Test</h1>
        
        {/* Wallet Section */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">1. Wallet Connection</h2>
          <div className="flex items-center gap-4">
            <WalletButton />
            <div className="text-sm">
              <div>Status: <span className={isConnected ? "text-green-600 font-bold" : "text-red-600"}>{isConnected ? 'Connected' : 'Disconnected'}</span></div>
              <div>Contract: <span className={isReady ? "text-green-600 font-bold" : "text-yellow-600"}>{isReady ? 'Ready' : 'Not Ready'}</span></div>
            </div>
          </div>
          {contractError && (
            <div className="mt-2 p-2 bg-red-50 text-red-700 rounded border border-red-200">
              Contract Error: {contractError}
            </div>
          )}
        </div>

        {isConnected && isReady ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Write Functions */}
            <div className="space-y-8">
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Register Profile</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="Country Code (e.g. US)"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={metadataUri}
                    onChange={(e) => setMetadataUri(e.target.value)}
                    placeholder="Metadata URI (ipfs://...)"
                    className="w-full p-2 border rounded"
                  />
                  <button 
                    onClick={handleRegisterProfile}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Register Profile
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Add Claim</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    placeholder="Receiver Address (G...)"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    placeholder="Claim Type"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={proofHash}
                    onChange={(e) => setProofHash(e.target.value)}
                    placeholder="Proof Hash (64 hex chars)"
                    className="w-full p-2 border rounded font-mono text-sm"
                  />
                  <button 
                    onClick={handleAddClaim}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Add Claim
                  </button>
                </div>
              </div>
            </div>

            {/* Read Functions & Logs */}
            <div className="space-y-8">
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Read Data</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>Total Claims:</span>
                    <span className="font-bold text-lg">{totalClaims ?? '...'}</span>
                    <button onClick={handleGetTotalClaims} className="text-sm text-blue-600 hover:underline">Refresh</button>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Get Profile</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={profileToQuery}
                        onChange={(e) => setProfileToQuery(e.target.value)}
                        placeholder="Address (defaults to self)"
                        className="flex-1 p-2 border rounded text-sm"
                      />
                      <button 
                        onClick={handleGetProfile}
                        className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
                      >
                        Query
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Get User Claims</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userClaimsAddress}
                        onChange={(e) => setUserClaimsAddress(e.target.value)}
                        placeholder="Address (defaults to self)"
                        className="flex-1 p-2 border rounded text-sm"
                      />
                      <button 
                        onClick={handleGetUserClaims}
                        className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
                      >
                        Query
                      </button>
                    </div>
                    {userClaimsResult !== null && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="font-semibold mb-1">Result: {userClaimsResult.length} claim(s)</div>
                        {userClaimsResult.length > 0 && (
                          <pre className="overflow-x-auto text-xs">
                            {JSON.stringify(userClaimsResult, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Get Issuer Claims</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={issuerClaimsAddress}
                        onChange={(e) => setIssuerClaimsAddress(e.target.value)}
                        placeholder="Address (defaults to self)"
                        className="flex-1 p-2 border rounded text-sm"
                      />
                      <button 
                        onClick={handleGetIssuerClaims}
                        className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
                      >
                        Query
                      </button>
                    </div>
                    {issuerClaimsResult !== null && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="font-semibold mb-1">Result: {issuerClaimsResult.length} claim(s)</div>
                        {issuerClaimsResult.length > 0 && (
                          <pre className="overflow-x-auto text-xs">
                            {JSON.stringify(issuerClaimsResult, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Get Claim by ID</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={claimIdToQuery}
                        onChange={(e) => setClaimIdToQuery(e.target.value)}
                        placeholder="Claim ID (number)"
                        className="flex-1 p-2 border rounded text-sm"
                      />
                      <button 
                        onClick={handleGetClaim}
                        className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
                      >
                        Query
                      </button>
                    </div>
                    {claimResult !== null && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="font-semibold mb-1">Claim Found</div>
                        <pre className="overflow-x-auto text-xs">
                          {JSON.stringify(claimResult, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-900 text-green-400 rounded-lg shadow h-[400px] overflow-y-auto font-mono text-sm">
                <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                  <h2 className="font-semibold text-white">Activity Log</h2>
                  <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-white">Clear</button>
                </div>
                <div className="space-y-1">
                  {logs.length === 0 && <div className="text-gray-600 italic">No logs yet...</div>}
                  {logs.map((log, i) => (
                    <div key={i} className="break-all">{log}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Connect wallet to test contract functions</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

