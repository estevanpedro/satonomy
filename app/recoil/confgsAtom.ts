import { atom } from "recoil";

export const configAtom = atom({
  key: "configAtom",
  default: {
    isInputDeckOpen: false,
    isInputFullDeckOpen: false,
    fullDeckPage: 1,
    isOutputDeckOpen: false,
    feeRate: 0,
    feeCost: 0,
    isOpenModalTxId: false,
    isConfirmedModalTxId: false,
    txid: "",
    proMode: false,
  },
});
