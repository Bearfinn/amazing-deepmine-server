import { Stake } from './types/staking';
import { getStakes, getStakingConfig } from './utils/staking';
import { getStakedAssets } from './utils/atomic';
import Fastify from 'fastify';
import * as fs from 'fs';
interface StakingInfo {
  address: string;
  totalDMPPerDay: number;
  totalStaked1D: number;
  totalStakedLock: number;
}

export async function main() {
  const stakes = await getStakes();
  console.log('Get all stakes');
  fs.writeFile('src/files/stakes.json', JSON.stringify(stakes), () => {
    console.log('Staking data written successfully');
  });

  const stakingConfigs = await getStakingConfig();
  console.log('Get all staking configs');

  const stakedAssets = await getStakedAssets();
  console.log('Get all staked assets');
  fs.writeFile(
    'src/files/staked-assets.json',
    JSON.stringify(stakedAssets),
    () => {
      console.log('Staked assets written successfully');
    },
  );

  const getDMPPerDay = (stake: Stake) => {
    let sum = 0;

    for (const lockedStake of stake.staked_nfts_Fixed) {
      const template_id = stakedAssets.find(
        (asset) => asset.asset_id === lockedStake.asset_id,
      )?.template_id;
      const config = stakingConfigs.find(
        (stakingConfig) => stakingConfig.template_id.toString() === template_id,
      );
      sum += Number(config?.reward.split(' ')[0] || 0) * 4;
    }
    for (const lockedStake of stake.staked_nfts_1D) {
      const template_id = stakedAssets.find(
        (asset) => asset.asset_id === lockedStake.asset_id,
      )?.template_id;
      const config = stakingConfigs.find(
        (stakingConfig) => stakingConfig.template_id.toString() === template_id,
      );
      sum += Number(config?.reward.split(' ')[0] || 0);
    }
    return sum;
  };

  const leaderboard: StakingInfo[] = [];
  for (const stake of stakes) {
    const dmpPerDay = getDMPPerDay(stake);
    const entry = {
      address: stake.owner,
      totalDMPPerDay: dmpPerDay,
      totalStaked1D: stake.staked_nfts_1D.length,
      totalStakedLock: stake.staked_nfts_Fixed.length,
    };
    leaderboard.push(entry);
  }

  fs.writeFileSync('src/files/leaderboard.json', JSON.stringify(leaderboard));
}

setInterval(() => {
  main();
}, 15 * 60 * 1000);

const fastify = Fastify({ logger: true });

fastify.get('/', (_, reply) => {
  reply.code(200).send("Welcome to Deepmine Stats Server")
});

fastify.get('/leaderboard', (_, reply) => {
  const leaderboard = JSON.parse(
    fs.readFileSync('src/files/leaderboard.json', 'utf8'),
  );
  reply.type('application/json').code(200).send({
    lastUpdateAt: new Date().toISOString(),
    leaderboard
  })
});

fastify.listen(8080, (error) => {
  if (error) throw error;
});
