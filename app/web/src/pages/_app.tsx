import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { WalletProvider } from '@/context/WalletContext';
import { CONTRACT_CONFIG } from '@/config/contract';
import { Layout } from '@/components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider rpcUrl={CONTRACT_CONFIG.rpcUrl}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </WalletProvider>
  );
}

