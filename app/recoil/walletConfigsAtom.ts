import { atom } from "recoil"

interface WalletConfigs {
  wallets: string[]
}
export const walletConfigsAtom = atom<WalletConfigs>({
  key: "walletConfigsAtom",
  default: {
    wallets: [],
  },
})
