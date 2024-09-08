import { atom } from "recoil";

export const recommendedFeesAtom = atom<number | null>({
  key: "recommendedFeesAtom",
  default: null,
});
