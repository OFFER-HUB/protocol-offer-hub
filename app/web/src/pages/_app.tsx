import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { WalletProvider } from '@/context/WalletContext';
import { CONTRACT_CONFIG } from '@/config/contract';
import { Layout } from '@/components/Layout';
import { ProfileConnectionGuard } from '@/components/profile-connection-guard';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <ProfileConnectionGuard />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </WalletProvider>
  );
}

