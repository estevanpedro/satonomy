import { RunesUtxo, RuneTransaction } from "@/app/recoil/runesAtom";
import { MempoolUTXO } from "@/app/recoil/utxoAtom";

const mempoolURL = "https://mempool.space/api";
const unisatURL = "https://open-api.unisat.io/v1/indexer/address";
const meURL = "https://api-mainnet.magiceden.dev/v2/ord/btc/runes/utxos/wallet";

const nextRevalidate = { next: { revalidate: 3600 } };

export const utxoServices = {
  fetchTransactionHex: async (txId: string): Promise<string> => {
    try {
      const res = await fetch(`${mempoolURL}/tx/${txId}/hex`, nextRevalidate);
      const data = await res.text();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getUtxos: async (address: string) => {
    const mempool = await fetch(`${mempoolURL}/address/${address}/utxo`);
    const utxos: MempoolUTXO[] = await mempool.json();
    return utxos;
  },
  getRunesBalances: async (wallet: string): Promise<RunesUtxo[]> => {
    const response = await fetch(`${unisatURL}/${wallet}/runes/balance-list`, {
      ...nextRevalidate,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_UNISAT_API_KEY}`,
      },
    });
    const balances = await response.json();
    return (balances?.data?.detail as RunesUtxo[]) || [];
  },
  getInscriptions: async (wallet: string): Promise<RunesUtxo[]> => {
    const response = await fetch(`${unisatURL}/${wallet}/inscription-data`, {
      ...nextRevalidate,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_UNISAT_API_KEY}`,
      },
    });
    const data = await response.json();
    return data.data;
  },
  getRunesUTXOs: async (address: string, rune: string) => {
    const res = await fetch(
      `${meURL}/${address}?rune=${rune.replaceAll("•", "")}`,
      {
        ...nextRevalidate,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MAGIC_EDEN_API_KEY}`,
        },
      }
    );
    const result = await res.json();
    const items = result?.utxos || [];
    return items as RuneTransaction[];
  },
};
