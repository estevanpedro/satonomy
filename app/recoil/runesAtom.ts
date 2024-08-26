import { atom } from "recoil";

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

export const runesAtom = atom<RunesUtxo[] | null>({
  key: "runesAtom",
  default: null,
});
