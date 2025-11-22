/**
 * Header component with contextual navigation
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { WalletButton } from './WalletButton';
import { useWallet } from '@/context/WalletContext';
import { useUserProfile } from '@/hooks/use-user-profile';

export function Header() {
  const router = useRouter();
  const [logoError, setLogoError] = useState(false);
  const { isConnected } = useWallet();
  const { hasProfile } = useUserProfile();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            {!logoError ? (
              <>
                <img
                  src="/offer_hub_logo.png"
                  alt="OFFER-HUB"
                  width={160}
                  height={40}
                  className="h-12 w-auto"
                  onError={() => setLogoError(true)}
                />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-base font-bold text-gray-900 leading-tight">OFFER-HUB</span>
                  <span className="text-base font-bold text-primary-600 leading-tight -mt-0.5">PROTOCOL</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-start leading-tight">
                <span className="text-base font-bold text-gray-900 leading-tight">OFFER-HUB</span>
                <span className="text-base font-bold text-primary-600 leading-tight -mt-0.5">PROTOCOL</span>
              </div>
            )}
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            
            {isConnected && (
              <>
                {/* Freelancer Section */}
                {hasProfile && (
                  <>
                    <Link
                      href="/profile"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/profile')
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/my-claims"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/my-claims')
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      My Claims
                    </Link>
                  </>
                )}

                {/* Client Section */}
                <Link
                  href="/claims/new"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/claims/new')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Issue Claim
                </Link>
                <Link
                  href="/issued-claims"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/issued-claims')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Issued Claims
                </Link>
              </>
            )}

            {/* Common Section */}
            <Link
              href="/explore"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/explore')
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              Explore
            </Link>
          </nav>

          {/* Wallet Button */}
          <div className="flex items-center">
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}

