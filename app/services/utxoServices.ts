import { MempoolUTXO } from "@/app/recoil/utxo";

export interface RunesUtxo {
  amount: string;
  divisibility: number;
  rune: string;
  runeid: string;
  symbol: string;
  spacedRune: string;
  utxos: RuneTransaction[];
  ordinal: RuneData | null;
}

export interface RuneTransaction {
  location: string;
  address: string;
  rune: string;
  balance: number;
  formattedBalance: string;
  spent: boolean;
  pure: boolean;
  costSats: number;
}

export type RuneData = {
  title: string;
  number: string;
  timestamp: string;
  etchingBlock: string;
  etchingTransaction: string;
  mint: string;
  supply: string;
  mintProgress: string;
  premine: string;
  preminePercentage: string;
  burned: string;
  divisibility: string;
  symbol: string;
  turbo: string;
  etching: string;
  parent: string;
};

const mempoolURL = "https://mempool.space/api";

export const utxoServices = {
  fetchTransactionHex: async (txId: string): Promise<string> => {
    try {
      const res = await fetch(`https://mempool.space/api/tx/${txId}/hex`, {
        next: { revalidate: 3600 },
      });
      const data = await res.text();
      return data;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw error;
    }
  },
  getUtxos: async (address: string) => {
    const mempool = await fetch(`${mempoolURL}/address/${address}/utxo`);
    const utxos: MempoolUTXO[] = await mempool.json();
    return utxos;
  },
  getRunesBalances: async (wallet: string): Promise<RunesUtxo[]> => {
    const response = await fetch(
      `https://open-api.unisat.io/v1/indexer/address/${wallet}/runes/balance-list`,
      {
        next: { revalidate: 3600 },
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.UNISAT_API_KEY}`,
        },
      }
    );
    const balances = await response.json();
    return (balances?.data?.detail as RunesUtxo[]) || [];
  },
  getInscriptions: async (wallet: string): Promise<RunesUtxo[]> => {
    const response = await fetch(
      `https://open-api.unisat.io/v1/indexer/address/${wallet}/inscription-data`,
      {
        next: { revalidate: 3600 },
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.UNISAT_API_KEY}`,
        },
      }
    );
    const data = await response.json();
    return data.data;
  },
  getRunesUTXOs: async (address: string, rune: string) => {
    const res = await fetch(
      `https://api-mainnet.magiceden.dev/v2/ord/btc/runes/utxos/wallet/${address}?rune=${rune.replaceAll(
        "•",
        ""
      )}`,
      {
        next: { revalidate: 3600 },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MAGIC_EDEN_API_KEY}`,
        },
      }
    );

    const result = await res.json();

    const items = result?.utxos || [];

    return items as RuneTransaction[];
  },
};
