import { atom } from "recoil";

interface InscriptionInfo {
  id: string;
  number: number;
  address: string;
  content: string;
  contentType: string;
  genesisFee: number;
  timestamp: string;
  location: string;
  trendingScore: string;
  keywords: string | null;
  safeSearch: string | null;
  createdAt: string;
  updatedAt: string;
  nsfw: boolean;
  objects: string | null;
  contentSize: number;
  genesisAddress: string;
  genesisBlockHash: string;
  genesisBlockHeight: number;
  genesisTxId: string;
  mimeType: string;
  offset: string;
  output: string;
  satCoinbaseHeight: number;
  satOrdinal: string;
  satRarity: string;
  txId: string;
  value: string;
  genesisTimestamp: string;
  totalScore: number;
  collectionSlug: string | null;
  collectionId: string | null;
  commentCount: number;
  parentInscriptionId: string | null;
  sequenceNumber: number;
  delegate: string;
  isParent: boolean;
  isRuneInscription: boolean;
  score: number;
}

interface MetaValues {
  timestamp: string[];
  trendingScore: string[];
  createdAt: string[];
  updatedAt: string[];
  satOrdinal: string[];
  genesisTimestamp: string[];
}

interface Meta {
  values: MetaValues;
}

export interface InscriptionData {
  json: InscriptionInfo;
  meta: Meta;
}

export interface InscriptionResult {
  result: {
    data: InscriptionData;
  };
}

export const ordAtom = atom<InscriptionData[] | null>({
  key: "ordAtom",
  default: undefined,
});
