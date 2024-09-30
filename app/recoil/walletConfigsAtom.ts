import { atom } from "recoil"
import { recoilPersist } from "recoil-persist"

const { persistAtom } = recoilPersist()
interface WalletConfigs {
  wallets: string[]
  prevWallets?: string[]
}
export const walletConfigsAtom = atom<WalletConfigs>({
  key: "walletConfigsAtom",
  default: {
    wallets: [],
    prevWallets: [],
  },
  effects_UNSTABLE: [persistAtom],
})
