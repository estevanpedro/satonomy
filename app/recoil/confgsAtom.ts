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
  fullDeckSearchWallet: "",
  fullDeckSearchType: "all",
}

export const configsAtom = atom({
  key: "configsAtom",
  default: DEFAULT_CONFIGS,
})
