import { atom } from "recoil";

export const configAtom = atom({
  key: "configAtom",
  default: {
    isInputDeckOpen: false,
    feeRate: 0,
    feeCost: 0,
  },
});
