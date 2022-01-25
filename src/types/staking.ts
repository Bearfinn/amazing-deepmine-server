export interface StakedAsset {
  asset_id: string;
  time: number;
  initial_stake_time: number;
}

export interface Stake {
  owner: string;
  staked_nfts_Fixed: StakedAsset[];
  staked_nfts_1D: StakedAsset[];
}

export interface StakingConfig {
  template_id: string;
  reward: string;
}

export interface Asset {
  asset_id: string;
  template_id: string;
  name: string;
  rarity: string;
  type: string;
  src: string;
}