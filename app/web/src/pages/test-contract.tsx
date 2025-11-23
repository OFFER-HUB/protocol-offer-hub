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
    updateProfileData,
    getUserClaims,
    getIssuerClaims,
    getClaim
  } = useOfferHubContract();

  // State for registration inputs
  const [metadataUri, setMetadataUri] = useState('ipfs://test-metadata');
  const [displayName, setDisplayName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [emailHash, setEmailHash] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState<Array<{platform: string, handle: string}>>([]);
  const [newAccountPlatform, setNewAccountPlatform] = useState('github');
  const [newAccountHandle, setNewAccountHandle] = useState('');
  
  // State for claim inputs
  const [receiverAddress, setReceiverAddress] = useState('');
  const [claimType, setClaimType] = useState('job_completed');
  const [proofHash, setProofHash] = useState('00'.repeat(32));
  
  // State for query inputs
  const [profileToQuery, setProfileToQuery] = useState('');
  const [userClaimsAddress, setUserClaimsAddress] = useState('');
  const [issuerClaimsAddress, setIssuerClaimsAddress] = useState('');
  const [claimIdToQuery, setClaimIdToQuery] = useState('');
  
  // State for outputs
  const [logs, setLogs] = useState<string[]>([]);
  const [totalClaims, setTotalClaims] = useState<number | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userClaimsResult, setUserClaimsResult] = useState<any[] | null>(null);
  const [issuerClaimsResult, setIssuerClaimsResult] = useState<any[] | null>(null);
  const [claimResult, setClaimResult] = useState<any | null>(null);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  // State for tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'claims' | 'read'>('profile');
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // State for tabs (internal to Profile Card)
  const [profileTab, setProfileTab] = useState<'register' | 'update'>('register');

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    addLog(`Uploading image: ${file.name}...`);

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result?.toString().split(',')[1];
        
        if (!base64String) throw new Error('Failed to convert image');

        // Send to our internal API
        const response = await fetch('/api/upload-to-ipfs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            contentBase64: base64String
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Upload failed');
        }

        const data = await response.json();
        addLog(`✅ Image uploaded to IPFS: ${data.uri}`);
        setMetadataUri(data.uri);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      addLog(`❌ Upload Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (isReady) {
      addLog('Contract Ready');
      handleGetTotalClaims();
      // Check if user has a profile to switch to update mode
      if (publicKey) {
        getProfile(publicKey).then(p => {
          if (p) {
            setIsUpdateMode(true);
            setProfileTab('update'); // Auto-switch to update
            setDisplayName(p.display_name);
            setMetadataUri(p.metadata_uri);
            setCountryCode(p.country_code || '');
            setLinkedAccounts(p.linked_accounts);
            addLog(`Profile found. Switched to Update mode.`);
          }
        }).catch(() => {}); // Ignore error if no profile
      }
    }
  }, [isReady, publicKey]);

  // -- Handlers --

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      addLog('Error: Display name is required');
      return;
    }
    
    try {
      setIsRegistering(true);
      addLog(`Updating profile for ${displayName}...`);
      
      let emailHashBytes: Uint8Array | undefined;
      if (emailHash.trim()) {
        const encoder = new TextEncoder();
        const data = encoder.encode(emailHash.trim().toLowerCase());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        emailHashBytes = new Uint8Array(hashBuffer);
      }
      
      await updateProfileData({ 
        metadata_uri: metadataUri || 'ipfs://placeholder',
        display_name: displayName,
        country_code: countryCode || undefined,
        linked_accounts: linkedAccounts,
        email_hash: emailHashBytes
      });
      
      addLog(`✅ Success: Profile updated!`);
    } catch (e: any) {
      console.error('Update error:', e);
      addLog(`❌ Error: ${e.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegisterProfile = async () => {
    if (!displayName.trim()) {
      addLog('Error: Display name is required');
      return;
    }
    
    try {
      setIsRegistering(true);
      addLog(`Registering profile for ${displayName}...`);
      
      // Convert email to hash if provided
      let emailHashBytes: Uint8Array | undefined;
      if (emailHash.trim()) {
        const encoder = new TextEncoder();
        const data = encoder.encode(emailHash.trim().toLowerCase());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        emailHashBytes = new Uint8Array(hashBuffer);
        addLog(`Email hash generated: ${Array.from(emailHashBytes).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)}...`);
      }
      
      await registerProfile({ 
        metadata_uri: metadataUri || 'ipfs://placeholder',
        display_name: displayName,
        country_code: countryCode || undefined,
        linked_accounts: linkedAccounts,
        email_hash: emailHashBytes
      });
      
      addLog(`✅ Success: Profile registered! Display Name: ${displayName}`);
      if (linkedAccounts.length > 0) {
        addLog(`   Linked accounts: ${linkedAccounts.map(a => `${a.platform}:${a.handle}`).join(', ')}`);
      }
    } catch (e: any) {
      console.error('Registration error:', e);
      addLog(`❌ Error: ${e.message || e.toString() || 'Unknown error'}`);
      if (e.stack) {
        addLog(`   Stack: ${e.stack.substring(0, 200)}...`);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAddLinkedAccount = () => {
    if (!newAccountHandle.trim()) {
      addLog('Error: Handle is required');
      return;
    }
    setLinkedAccounts([...linkedAccounts, { platform: newAccountPlatform, handle: newAccountHandle }]);
    setNewAccountHandle('');
    addLog(`Added ${newAccountPlatform}: ${newAccountHandle}`);
  };

  const handleRemoveLinkedAccount = (index: number) => {
    const removed = linkedAccounts[index];
    setLinkedAccounts(linkedAccounts.filter((_, i) => i !== index));
    addLog(`Removed ${removed.platform}: ${removed.handle}`);
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
            
            {/* Write Functions Column */}
            <div className="space-y-8">
              <div className="p-6 bg-white rounded-lg shadow">
                
                {/* Internal Tabs for Profile */}
                <div className="flex space-x-4 border-b border-gray-200 mb-6">
                  <button 
                    className={`pb-2 font-semibold ${profileTab === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setProfileTab('register')}
                  >
                    📝 Register
                  </button>
                  <button 
                    className={`pb-2 font-semibold ${profileTab === 'update' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                    onClick={() => setProfileTab('update')}
                  >
                    ✏️ Update
                  </button>
                </div>

                {/* Header & Context */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {profileTab === 'register' ? 'Create New Profile' : 'Edit Existing Profile'}
                  </h2>
                  {isUpdateMode && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">Profile Exists</span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Josué Dev"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
                      <input
                        type="text"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                        placeholder="MX"
                        maxLength={2}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                      <input
                        type="email"
                        value={emailHash}
                        onChange={(e) => setEmailHash(e.target.value)}
                        placeholder={profileTab === 'update' && isUpdateMode ? "(Hidden on-chain)" : "Hashes automatically"}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Linked Accounts <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    
                    {linkedAccounts.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {linkedAccounts.map((acc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                            <span className="flex items-center gap-2">
                              <span className="font-semibold text-blue-700 capitalize">{acc.platform}:</span>
                              <span className="text-gray-700">{acc.handle}</span>
                            </span>
                            <button
                              onClick={() => handleRemoveLinkedAccount(idx)}
                              className="text-red-600 hover:text-red-800 font-bold"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <select
                        value={newAccountPlatform}
                        onChange={(e) => setNewAccountPlatform(e.target.value)}
                        className="p-2 border rounded text-sm bg-gray-50"
                      >
                        <option value="github">GitHub</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">Twitter</option>
                      </select>
                      <input
                        type="text"
                        value={newAccountHandle}
                        onChange={(e) => setNewAccountHandle(e.target.value)}
                        placeholder="username"
                        className="flex-1 p-2 border rounded text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && newAccountHandle.trim() && handleAddLinkedAccount()}
                      />
                      <button
                        onClick={handleAddLinkedAccount}
                        disabled={!newAccountHandle.trim()}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium disabled:opacity-50"
                      >Add</button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image (Metadata URI)</label>
                    <div className="space-y-2">
                       {/* Upload Button */}
                       <div className="flex items-center gap-2">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100
                            "
                          />
                          {isUploading && <span className="text-sm text-gray-500 animate-pulse">Uploading...</span>}
                       </div>

                       {/* Preview or Manual Input */}
                       <div className="relative">
                  <input
                    type="text"
                    value={metadataUri}
                    onChange={(e) => setMetadataUri(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-xs text-gray-500 bg-gray-50"
                            placeholder="ipfs://..."
                            readOnly
                          />
                          {metadataUri && !metadataUri.startsWith('ipfs://placeholder') && (
                            <div className="mt-2 border rounded p-1 w-20 h-20 bg-gray-100 overflow-hidden">
                               {/* Handle IPFS gateway for preview */}
                               <img 
                                 src={metadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} 
                                 alt="Preview" 
                                 className="w-full h-full object-cover"
                                 onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error' }}
                               />
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={profileTab === 'update' ? handleUpdateProfile : handleRegisterProfile}
                    disabled={isRegistering || !displayName.trim()}
                    className={`w-full px-4 py-2 rounded text-white font-medium transition-colors shadow-sm
                      ${profileTab === 'update' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isRegistering ? 'Processing...' : (profileTab === 'update' ? '💾 Update Profile' : '🚀 Register Profile')}
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">🏆 Add Claim</h2>
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

            {/* Read Functions & Logs Column */}
            <div className="space-y-8">
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">🔎 Read Data</h2>
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
