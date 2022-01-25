import { Stake, StakingConfig } from "../types/staking";
import { getData, GetTableRowOptions } from "./wax";

export const getDeepmineStakingData = async (
  table: string,
  options: GetTableRowOptions
) => {
  return getData({
    game: "deepminestak",
    table,
    options,
  });
};

export const getStakes = async (): Promise<Stake[]> => {
  const rows = getDeepmineStakingData("stake", {
 
  })
  return rows
}

export const getStakingConfig = async (): Promise<StakingConfig[]> => {
  const rows = getDeepmineStakingData("stakingconf", {})
  return rows
}