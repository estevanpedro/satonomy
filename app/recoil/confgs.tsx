import { atom } from "recoil";

export const configState = atom({
  key: "configState",
  default: {
    isInputDeckOpen: false,
    feeRate: 0,
    feeCost: 0,
  },
});
