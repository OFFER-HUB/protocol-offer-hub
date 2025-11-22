import React from 'react';
import { useWallet } from '@/context/WalletContext';
import { LinkedDidCard } from '@/components/my-profile/linked-did-card';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useSkillchainProfile } from '@/hooks/use-skillchain-profile';

export default function ProfilePage() {
  const { isConnected: walletConnected, connect: connectWallet, publicKey } = useWallet();
  const offerHub = useSkillchainProfile();
  const [isRefreshingLinked, setIsRefreshingLinked] = React.useState(false);
  const [linkedDid, setLinkedDid] = React.useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      {!walletConnected && (
        <div className="max-w-2xl mx-auto">
          <ErrorAlert message="Connect your Stellar wallet to continue." />
          <div className="mt-4">
            <button
              className="inline-flex items-center px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <LinkedDidCard
          onChainDid={linkedDid}
          isReady={offerHub.isReady}
          error={offerHub.contractError || null}
          isRefreshing={isRefreshingLinked}
          onRefresh={async () => {
            if (!publicKey) return;
            setIsRefreshingLinked(true);
            try {
              const did = await offerHub.getDid(publicKey);
              setLinkedDid(did);
            } finally {
              setIsRefreshingLinked(false);
            }
          }}
        />
      </div>
    </div>
  );
}
