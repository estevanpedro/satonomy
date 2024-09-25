import { atom } from "recoil"
import { recoilPersist } from "recoil-persist"

const { persistAtom } = recoilPersist()
interface WalletConfigs {
  wallets: string[]
}
export const walletConfigsAtom = atom<WalletConfigs>({
  key: "walletConfigsAtom",
  default: {
    wallets: [],
  },
  effects_UNSTABLE: [persistAtom],
})
