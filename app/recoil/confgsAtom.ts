import { atom } from "recoil"

export const DEFAULT_CONFIGS = {
  isInputDeckOpen: false,
  isInputFullDeckOpen: false,
  fullDeckPage: 1,
  isOutputDeckOpen: false,
  feeRate: 0,
  feeRateEstimated: 0,
  feeCost: 0,
  isOpenModalTxId: false,
  isConfirmedModalTxId: false,
  txid: "",
  proMode: false,
  notConfirmed: false,
  feeType: "custom",
}

export const configAtom = atom({
  key: "configAtom",
  default: DEFAULT_CONFIGS,
})
