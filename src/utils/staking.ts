import { Stake, StakingConfig } from '../types/staking';
import { getData, GetTableRowOptions } from './wax';

export const getDeepmineStakingData = async (
  table: string,
  options: GetTableRowOptions,
) => {
  return getData({
    game: 'deepminestak',
    table,
    options,
  });
};

export const getStakes = async (): Promise<Stake[]> => {
  let result = [];
  let next = null
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rows = await getDeepmineStakingData('stake', {
      lower_bound: next,
      limit: 1000,
    });
    const last = rows.pop()
    if (rows.length === 0) break;
    result = [...result, ...rows]
    next = last.owner
  }
  return result;
};

export const getStakingConfig = async (): Promise<StakingConfig[]> => {
  const rows = getDeepmineStakingData('stakingconf', {});
  return rows;
};

export const getCollectedDMPs = async (): Promise<any> => {
  let result = [];
  let next = null
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rows = await getDeepmineStakingData('collected', {
      lower_bound: next,
      limit: 1000,
    });
    const last = rows.pop()
    if (rows.length === 0) break;
    result = [...result, ...rows]
    next = last.owner
  }
  return result;
}