import { Stake } from './types/staking';
import { getStakes, getStakingConfig } from './utils/staking';
import { getAssets } from './utils/atomic';
/**
 * Some predefined delay values (in milliseconds).
 */
export enum Delays {
  Short = 500,
  Medium = 2000,
  Long = 5000,
}

/**
 * Returns a Promise<string> that resolves after a given time.
 *
 * @param {string} name - A name.
 * @param {number=} [delay=Delays.Medium] - A number of milliseconds to delay resolution of the Promise.
 * @returns {Promise<string>}
 */
function delayedHello(
  name: string,
  delay: number = Delays.Medium,
): Promise<string> {
  return new Promise((resolve: (value?: string) => void) =>
    setTimeout(() => resolve(`Hello, ${name}`), delay),
  );
}

// Below are examples of using ESLint errors suppression
// Here it is suppressing a missing return type definition for the greeter function.

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function greeter(name: string) {
  return await delayedHello(name, Delays.Long);
}

export async function main() {
  const stakes = await getStakes();
  const stakingConfigs = await getStakingConfig();

  const getDMPPerDay = async (stake: Stake) => {
    let sum = 0;
    const asset_ids = stake.staked_nfts_1D
      .map((asset) => asset.asset_id)
      .concat(stake.staked_nfts_Fixed.map((asset) => asset.asset_id));
    const assets = await getAssets(asset_ids);
    for (const lockedStake of stake.staked_nfts_Fixed) {
      const template_id = assets.find(
        (asset) => asset.asset_id === lockedStake.asset_id,
      )?.template_id;
      const config = stakingConfigs.find(
        (stakingConfig) => stakingConfig.template_id.toString() === template_id,
      );
      sum += Number(config?.reward.split(' ')[0]) * 4;
    }
    for (const lockedStake of stake.staked_nfts_1D) {
      const template_id = assets.find(
        (asset) => asset.asset_id === lockedStake.asset_id,
      )?.template_id;
      const config = stakingConfigs.find(
        (stakingConfig) => stakingConfig.template_id.toString() === template_id,
      );
      sum += Number(config?.reward.split(' ')[0]);
    }
    return sum;
  };

  const leaderboard = [];
  for (const stake of stakes) {
    const dmpPerDay = await getDMPPerDay(stake)
    leaderboard.push(dmpPerDay)
    console.log(dmpPerDay)
  }
}

main()