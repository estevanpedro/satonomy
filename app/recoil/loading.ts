import { atom } from "recoil"

interface ILoading {
  mempoolUtxoIsLoading?: boolean
  runesIsLoading?: boolean
  ordinalsIsLoading?: boolean
  recommendedFeesIsLoading?: boolean
  broadcastIsLoading?: boolean
  signIsLoading?: boolean
}

export const loadingAtom = atom<ILoading>({
  key: "loadingAtom",
  default: {
    mempoolUtxoIsLoading: true,
    runesIsLoading: true,
    ordinalsIsLoading: true,
    recommendedFeesIsLoading: true,
    broadcastIsLoading: true,
    signIsLoading: true,
  },
})
