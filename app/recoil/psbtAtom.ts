import { MempoolUTXO } from "@/app/recoil/utxoAtom"
import { atom } from "recoil"

interface PsbtSigned {
  psbtHexSigned: string | undefined
  inputsSigned: MempoolUTXO[]
  broadcasted?: boolean
  txid?: string
}
export const psbtSignedAtom = atom<PsbtSigned>({
  key: "psbtSignedAtom",
  default: {
    psbtHexSigned: undefined,
    inputsSigned: [],
    broadcasted: false,
    txid: "",
  },
})
