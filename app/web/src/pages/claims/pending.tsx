/**
 * Pending Claims page - redirects to issued-claims since claims are created as Approved
 * NOTE: Claims are now created directly as Approved, so this page redirects to issued-claims
 */

import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PendingClaimsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to issued-claims since claims are created as Approved
    router.replace('/issued-claims');
  }, [router]);

  return (
    <>
      <Head>
        <title>Pending Claims - Protocol Offer Hub</title>
        <meta name="description" content="Redirecting to issued claims" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-600">Redirecting to issued claims...</p>
          </div>
        </div>
      </main>
    </>
  );
}


