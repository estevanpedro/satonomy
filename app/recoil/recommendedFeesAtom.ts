import { atom } from "recoil";

export interface RecommendedFeeSatVb {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
  slowFee: number;
}

export const recommendedFeesAtom = atom<RecommendedFeeSatVb | null>({
  key: "recommendedFeesAtom",
  default: null,
});
