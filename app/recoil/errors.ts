import { atom } from "recoil"

interface IError {
  walletErrorList: string[]
}

export const errorsAtom = atom<IError>({
  key: "errorsAtom",
  default: {
    walletErrorList: [],
  },
})
