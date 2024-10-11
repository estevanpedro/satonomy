import { atom } from "recoil"
import { recoilPersist } from "recoil-persist"

const { persistAtom } = recoilPersist()
export interface WalletConfigs {
  wallets: string[]
  prevWallets?: string[]
  images?: {
    [key: string]: {
      isMagicEden: boolean
      isXVerse: boolean
      isUnisat: boolean
      isOkxWallet: boolean
    }
  }[]
}
export const walletConfigsAtom = atom<WalletConfigs>({
  key: "walletConfigsAtom",
  default: {
    wallets: [],
    prevWallets: [],
  },
  effects_UNSTABLE: [persistAtom],
})
