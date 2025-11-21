export enum ClaimType {
  JobCompleted = 'JobCompleted',
  HackathonWin = 'HackathonWin',
  RepoContribution = 'RepoContribution',
  SkillEndorsement = 'SkillEndorsement',
  Other = 'Other',
}

export interface Profile {
  owner: string;
  metadataUri: string;
  createdAt: number;
}

export interface Claim {
  id: number;
  issuer: string;
  receiver: string;
  claimType: ClaimType;
  proofHash: string;
  approved: boolean;
  timestamp: number;
}

export interface ProtocolOfferHubClientOptions {
  network: string;
  contractId: string;
  rpcUrl: string;
}

