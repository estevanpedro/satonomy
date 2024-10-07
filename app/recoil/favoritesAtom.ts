import { atom } from "recoil"
import { recoilPersist } from "recoil-persist"
const { persistAtom } = recoilPersist()
export interface Favorites {
  utxos: string[]
}

export const favoritesAtom = atom<Favorites>({
  key: "favoritesAtom",
  default: {
    utxos: [],
  },
  effects_UNSTABLE: [persistAtom],
})
