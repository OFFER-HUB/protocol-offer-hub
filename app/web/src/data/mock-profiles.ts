/**
 * Mock profiles data for explore page
 */

import type { Profile } from '@/types/contract-types';

export const MOCK_PROFILES: Array<{ address: string; profile: Profile }> = [
  {
    address: 'GAKTV3W3X2EBXJMQC4MTC3TM5VJT4JP5KAY7QSLNXJ2LCL5UKSZTKLKA',
    profile: {
      owner: 'GAKTV3W3X2EBXJMQC4MTC3TM5VJT4JP5KAY7QSLNXJ2LCL5UKSZTKLKA',
      metadata_uri: 'https://example.com/profile/1',
      display_name: 'Alice Developer',
      country_code: 'US',
      email_hash: null,
      linked_accounts: [
        { platform: 'GitHub', handle: 'alice-dev' },
        { platform: 'LinkedIn', handle: 'alice-developer' },
      ],
      joined_at: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
    },
  },
  {
    address: 'GBUFHWMF2GCVS3MEBM7Q55XR73UHUVI5VYUDHSEXTHAJXORYULOX274N',
    profile: {
      owner: 'GBUFHWMF2GCVS3MEBM7Q55XR73UHUVI5VYUDHSEXTHAJXORYULOX274N',
      metadata_uri: 'https://example.com/profile/2',
      display_name: 'Bob Blockchain',
      country_code: 'CA',
      email_hash: null,
      linked_accounts: [
        { platform: 'GitHub', handle: 'bob-blockchain' },
        { platform: 'Twitter', handle: '@bobblockchain' },
      ],
      joined_at: Date.now() - 120 * 24 * 60 * 60 * 1000, // 120 days ago
    },
  },
  {
    address: 'GDPUKWTENDBVJBU4EMHJKSQ2EHQOGRDDULNK3A4MGQF4H5BSYR354NOD',
    profile: {
      owner: 'GDPUKWTENDBVJBU4EMHJKSQ2EHQOGRDDULNK3A4MGQF4H5BSYR354NOD',
      metadata_uri: 'https://example.com/profile/3',
      display_name: 'Carol Crypto',
      country_code: 'GB',
      email_hash: null,
      linked_accounts: [
        { platform: 'GitHub', handle: 'carol-crypto' },
        { platform: 'LinkedIn', handle: 'carol-crypto' },
      ],
      joined_at: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
    },
  },
  {
    address: 'GAJWEFGDTDM2ICBF6Q7AO5VA2QOJKROWBR7XJQ7OISXW6UQACQUUDVNG',
    profile: {
      owner: 'GAJWEFGDTDM2ICBF6Q7AO5VA2QOJKROWBR7XJQ7OISXW6UQACQUUDVNG',
      metadata_uri: 'https://example.com/profile/4',
      display_name: 'David DeFi',
      country_code: 'DE',
      email_hash: null,
      linked_accounts: [
        { platform: 'GitHub', handle: 'david-defi' },
        { platform: 'Twitter', handle: '@daviddefi' },
      ],
      joined_at: Date.now() - 150 * 24 * 60 * 60 * 1000, // 150 days ago
    },
  },
  {
    address: 'GDVDE6ZERJ56JER6RNUNUHA22NYDUXSTOZRHSRMCWNLFEHYSD3WEKFYE',
    profile: {
      owner: 'GDVDE6ZERJ56JER6RNUNUHA22NYDUXSTOZRHSRMCWNLFEHYSD3WEKFYE',
      metadata_uri: 'https://example.com/profile/5',
      display_name: 'Eve Ethereum',
      country_code: 'FR',
      email_hash: null,
      linked_accounts: [
        { platform: 'GitHub', handle: 'eve-ethereum' },
        { platform: 'LinkedIn', handle: 'eve-ethereum' },
      ],
      joined_at: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    },
  },
  {
    address: 'GD6S6D25NDG2EQ6YI5YFTZSHEQXD4YPBNKNBW62P6XR2I7SRPIF3PPNH',
    profile: {
      owner: 'GD6S6D25NDG2EQ6YI5YFTZSHEQXD4YPBNKNBW62P6XR2I7SRPIF3PPNH',
      metadata_uri: 'https://example.com/profile/6',
      display_name: 'Frank Finance',
      country_code: 'AU',
      email_hash: null,
      linked_accounts: [
        { platform: 'GitHub', handle: 'frank-finance' },
        { platform: 'Twitter', handle: '@frankfinance' },
      ],
      joined_at: Date.now() - 200 * 24 * 60 * 60 * 1000, // 200 days ago
    },
  },
];

