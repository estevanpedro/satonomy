import { MempoolUTXO } from "@/app/recoil/utxoAtom"
import { atom } from "recoil"

interface PsbtSigned {
  psbtHexSigned: string | undefined
  inputsSigned: MempoolUTXO[]
  broadcasted?: boolean
  txid?: string
}
export const DEFAULT_PSBT_SIGNED: PsbtSigned = {
  psbtHexSigned: undefined,
  inputsSigned: [],
  broadcasted: false,
  txid: "",
}
export const psbtSignedAtom = atom<PsbtSigned>({
  key: "psbtSignedAtom",
  default: DEFAULT_PSBT_SIGNED,
})
