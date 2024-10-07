import { atom } from "recoil"
import { recoilPersist } from "recoil-persist"
const { persistAtom } = recoilPersist()
interface History {
  inputs: number
  outputs: number
  txid: string
  url: string
  timestamp: string
}

export const historyAtom = atom<History[]>({
  key: "historyAtom",
  default: [],
  effects_UNSTABLE: [persistAtom],
})
