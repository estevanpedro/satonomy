import { atom } from "recoil";
interface Rune {
  symbol: string;
  name: string;
}

interface Inscription {
  id: string;
  number: number;
  contentType: string;
  contentSize: number;
  delegate: string | null;
  content: string;
  nsfw: boolean;
  timestamp: string;
  trendingScore: number;
  totalScore: number;
  collectionId: number | null;
  satOrdinal: number;
  commentCount: number;
  rune: Rune | null;
  satributes: any[]; // Assuming satributes could be any array type, adjust based on actual structure
  score: number;
}

interface InscriptionsData {
  inscriptions: Inscription[];
  nextCursor: string | null;
}

interface MetaValuesExtended {
  [key: string]: string[]; // To handle the dynamic keys for each timestamp in inscriptions
}

interface MetaExtended {
  values: MetaValuesExtended;
}

export interface DataInscriptions {
  json: InscriptionsData;
  meta: MetaExtended;
}

export const ordByWalletAtom = atom<DataInscriptions | null>({
  key: "ordByWalletAtom",
  default: undefined,
});
