import { atom } from "recoil";

export interface Ordinals {
  cursor: number;
  total: number;
  totalConfirmed: number;
  totalUnconfirmed: number;
  totalUnconfirmedSpend: number;
  inscription: OrdinalData[];
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

interface OrdinalUTXO {
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

export interface OrdinalData {
  utxo: OrdinalUTXO;
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
  brc20: any;
  detail: any;
}

export const ordinalsAtom = atom<Ordinals | null>({
  key: "ordinalsAtom",
  default: null,
});
