import { atom } from "recoil";

export interface MempoolBlock {
  blockSize: number;
  blockVSize: number;
  nTx: number;
  totalFees: number;
  medianFee: number;
  feeRange: number[];
}
export interface Conversions {
  time: number;
  USD: number;
  EUR: number;
  GBP: number;
  CAD: number;
  CHF: number;
  AUD: number;
  JPY: number;
}

interface BlockDetails {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  bits: number;
  nonce: number;
  difficulty: number;
  merkle_root: string;
  tx_count: number;
  size: number;
  weight: number;
  previousblockhash: string;
  mediantime: number;
  stale: boolean;
  extras: Extras;
}

interface Extras {
  reward: number;
  coinbaseRaw: string;
  orphans: any[];
  medianFee: number;
  feeRange: number[];
  totalFees: number;
  avgFee: number;
  avgFeeRate: number;
  utxoSetChange: number;
  avgTxSize: number;
  totalInputs: number;
  totalOutputs: number;
  totalOutputAmt: number;
  segwitTotalTxs: number;
  segwitTotalSize: number;
  segwitTotalWeight: number;
  feePercentiles: number | null;
  virtualSize: number;
  coinbaseAddress: string;
  coinbaseSignature: string;
  coinbaseSignatureAscii: string;
  header: string;
  utxoSetSize: number | null;
  totalInputAmt: number | null;
  pool: Pool;
  matchRate: number;
  expectedFees: number;
  expectedWeight: number;
  similarity: number;
}

interface Pool {
  id: number;
  name: string;
  slug: string;
}

export interface Mempool {
  block?: BlockDetails;
  conversions?: Conversions;
  mempoolBlocks?: MempoolBlock[];
}

const mempoolDefault = {
  block: undefined,
  conversions: undefined,
  mempoolBlocks: undefined,
};

export const mempoolAtom = atom<Mempool>({
  key: "mempoolAtom",
  default: mempoolDefault,
});
