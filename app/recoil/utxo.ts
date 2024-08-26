import { RuneData } from "@/app/services/ordinalService";
import { RunesUtxo } from "@/app/services/utxoServices";
import { atom } from "recoil";
import { Edict } from "runelib";

export interface Status {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}

export interface MempoolUTXO {
  txid: string;
  vout: number;
  status: Status;
  value: number;
}

export interface Output {
  vout: number;
  value: number;
  address: string;
}

export interface Input extends MempoolUTXO {}

export const utxoState = atom<MempoolUTXO[] | null>({
  key: "utxoState",
  default: [],
});

export interface Butterfly {
  inputs: Input[];
  outputs: Output[];
  configs: any;
}

export const butterflyState = atom<Butterfly>({
  key: "butterflyState",
  default: {
    inputs: [],
    outputs: [],
    configs: {},
  },
});

export const runesAtom = atom<RunesUtxo[] | null>({
  key: "runesAtom",
  default: null,
});

export interface Ordinals {
  cursor: number;
  total: number;
  totalConfirmed: number;
  totalUnconfirmed: number;
  totalUnconfirmedSpend: number;
  inscription: DataStructure[];
}

interface Inscription {
  inscriptionNumber: number;
  inscriptionId: string;
  offset: number;
  moved: boolean;
  sequence: number;
  isCursed: boolean;
  isVindicate: boolean;
  isBRC20: boolean;
}

interface UTXO {
  txid: string;
  vout: number;
  satoshi: number;
  scriptType: string;
  scriptPk: string;
  codeType: number;
  address: string;
  height: number;
  idx: number;
  isOpInRBF: boolean;
  isSpent: boolean;
  inscriptions: Inscription[];
}

interface DataStructure {
  utxo: UTXO;
  address: string;
  offset: number;
  inscriptionIndex: number;
  inscriptionNumber: number;
  inscriptionId: string;
  hasPointer: boolean;
  hasParent: boolean;
  hasDeligate: boolean;
  hasMetaProtocal: boolean;
  hasMetadata: boolean;
  hasContentEncoding: boolean;
  pointer: number;
  parent: string;
  deligate: string;
  metaprotocol: string;
  metadata: string;
  contentEncoding: string;
  contentType: string;
  contentLength: number;
  contentBody: string;
  height: number;
  timestamp: number;
  inSatoshi: number;
  outSatoshi: number;
  brc20: any; // You can replace 'any' with the appropriate type if known
  detail: any; // You can replace 'any' with the appropriate type if known
}

export const ordinalsAtom = atom<Ordinals | null>({
  key: "ordinalsAtom",
  default: null,
});

export interface CustomEdict extends Edict, RuneData {}

export const edictsRunesAtom = atom<{ [txId: string]: CustomEdict[] } | null>({
  key: "edictsRunesAtom",
  default: null,
});
