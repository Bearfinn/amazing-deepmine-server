import { JsonRpc } from "eosjs";
import fetch from "node-fetch"

export const account = process.env.ACCOUNT as string;

export const rpc = new JsonRpc(process.env.NEXT_PUBLIC_RPC_URL || "https://wax.pink.gg", { fetch });
export interface GetTableRowParams {
  json?: boolean;
  code?: string;
  scope?: string;
  table?: string;
  lower_bound?: any;
  upper_bound?: any;
  index_position?: number;
  key_type?: string;
  limit?: number;
  reverse?: boolean;
  show_payer?: boolean;
}

export type GetTableRowOptions = Omit<GetTableRowParams, "table"> & {
  query?: string;
}

export const getData = async ({
  game = "deepminestak",
  table,
  options = {},
}: {
  game?: string;
  table: string;
  options?: GetTableRowOptions;
}) => {
  const { upper_bound, lower_bound, query, ...rest } = options;
  const { rows } = await rpc.get_table_rows({
    json: true,
    code: game,
    scope: game,
    table,
    limit: 100,
    upper_bound: query || upper_bound || null,
    lower_bound: query || lower_bound || null,
    ...rest,
  });
  return rows;
};

export const sleepRandomly = async () => {
  const sleepTime = Math.random() * 7000 + 3000; // Sleep for 3 - 10 seconds
  return new Promise((resolve) => {
    setTimeout(resolve, sleepTime);
  });
};

export const getOraclePrice = async () => {
  const response = await rpc.get_table_rows({
    json: true,
    code: "delphioracle",
    scope: "waxpusd",
    table: "datapoints",
    lower_bound: "",
    upper_bound: "",
    index_position: 3,
    key_type: "i64",
    limit: 1,
    reverse: true,
    show_payer: false,
  });

  const { median, value } = response.rows[0];
  
  return { median, value }
}