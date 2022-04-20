// import { getStakedAssets } from './utils/atomic';
import Fastify from 'fastify';
import * as fs from 'fs';
import { Stake } from './types/staking';
import { getStakedAssets } from './utils/atomic';
import { getCollectedDMPs, getStakes, getStakingConfig } from './utils/staking';
interface StakingInfo {
  address: string;
  totalDMPPerDay: number;
  totalStaked1D: number;
  totalStakedLock: number;
}

export async function main() {
  fs.writeFileSync("readme.txt", "This file is written to search for file location.")

  // const stakes = _stakes as Stake[];
  // const stakedAssets = _stakedAssets as Asset[];

  const stakes = await getStakes();
  console.log('Get all stakes');
  fs.writeFile('stakes.json', JSON.stringify(stakes), () => {
    console.log('Staking data written successfully');
  });

  const stakingConfigs = await getStakingConfig();
  console.log('Get all staking configs');

  const stakedAssets = await getStakedAssets();
  console.log('Get all staked assets');
  fs.writeFile(
    'staked-assets.json',
    JSON.stringify(stakedAssets),
    () => {
      console.log('Staked assets written successfully');
    },
  );

  const collectedDMPs = await getCollectedDMPs();

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

  const getTotalDMP = (stake: Stake) => {
    let sum = 0;
    const nowInSeconds = Math.floor(Date.now() / 1000);

    for (const lockedStake of stake.staked_nfts_Fixed) {
      const timeSinceStaked = (nowInSeconds - lockedStake.time) / 60 / 60 / 24;
      const template_id = stakedAssets.find(
        (asset) => asset.asset_id === lockedStake.asset_id,
      )?.template_id;
      const config = stakingConfigs.find(
        (stakingConfig) => stakingConfig.template_id.toString() === template_id,
      );
      sum += (Number(config?.reward.split(' ')[0] || 0) * 4) * timeSinceStaked;
    }
    for (const lockedStake of stake.staked_nfts_1D) {
      const timeSinceStaked = (nowInSeconds - lockedStake.time) / 60 / 60 / 24;
      const template_id = stakedAssets.find(
        (asset) => asset.asset_id === lockedStake.asset_id,
      )?.template_id;
      const config = stakingConfigs.find(
        (stakingConfig) => stakingConfig.template_id.toString() === template_id,
      );
      sum += Number(config?.reward.split(' ')[0] || 0) * timeSinceStaked;
    }
    return sum;
  }

  const leaderboard: StakingInfo[] = [];
  for (const stake of stakes) {
    const dmpPerDay = getDMPPerDay(stake);
    const uncollectedDMP = getTotalDMP(stake);
    const collectedDMP = collectedDMPs.find((entry) => entry.owner === stake.owner);
    const totalDMP = uncollectedDMP + collectedDMP;

    const entry = {
      address: stake.owner,
      totalDMPPerDay: dmpPerDay,
      uncollectedDMP,
      collectedDMP,
      totalDMP,
      totalStaked1D: stake.staked_nfts_1D.length,
      totalStakedLock: stake.staked_nfts_Fixed.length,
    };
    leaderboard.push(entry);
  }

  fs.writeFileSync('leaderboard.json', JSON.stringify(leaderboard));
  console.log("Completed")
}

main();
setInterval(() => {
  main();
}, 15 * 60 * 1000);

const fastify = Fastify({ logger: true });

fastify.get('/', (_, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET");
  reply.code(200).send("Welcome to Deepmine Stats Server")
});

fastify.get('/leaderboard', (_, reply) => {
  const leaderboard = JSON.parse(
    fs.readFileSync('leaderboard.json', 'utf8'),
  );
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET");
  reply.type('application/json').code(200).send({
    lastUpdateAt: new Date().toISOString(),
    leaderboard
  })
});

fastify.listen(process.env.PORT || 8080, "0.0.0.0", (error) => {
  if (error) throw error;
});
