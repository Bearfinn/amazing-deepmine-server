/**
 *
 * @returns
 * @see https://wax.api.atomicassets.io/docs/
 */

import { Asset } from "../types/staking";
import fetch from "node-fetch";

export const getLowestPriceOfRarity = async (rarity: string) => {
  const params = {
    symbol: "WAX",
    collection_name: "officelandio",
    schema_name: "staffs",
    limit: 1,
    "template_data.rarity": rarity,
  };
  const paramsString = Object.entries(params)
    .map(([key, value]: [key: string, value: any]) => `${key}=${value}`)
    .join("&");
  const res = await fetch(
    `https://wax.api.atomicassets.io/atomicmarket/v1/sales/templates?${paramsString}`
  );
  const data = await res.json();
  return data.data?.[0];
};

export const getAssets = async (asset_ids: string[]): Promise<Asset[]> => {
  const params = {
    ids: asset_ids.join(","),
  };
  const paramsString = Object.entries(params)
    .map(([key, value]: [key: string, value: any]) => `${key}=${value}`)
    .join("&");
  const res = await fetch(
    `https://wax.api.atomicassets.io/atomicassets/v1/assets?${paramsString}`
  );
  const data = await res.json();
  if (!data.data) return [];

  const assets = data.data.map((asset: any) => {
    return {
      asset_id: asset.asset_id,
      template_id: asset.template.template_id,
      name: asset.data.name,
      rarity: asset.data.rarity,
      type: asset.data.type,
      src: asset.data.backimg,
    };
  });
  return assets;
};
