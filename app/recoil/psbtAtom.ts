import { MempoolUTXO } from "@/app/recoil/utxoAtom"
import { atom } from "recoil"

interface PsbtSigned {
  psbtHexSigned: string | undefined
  inputsSigned: MempoolUTXO[]
}
export const psbtSignedAtom = atom<PsbtSigned>({
  key: "psbtSignedAtom",
  default: {
    psbtHexSigned: undefined,
    inputsSigned: [],
  },
})
