import { OrdinalData } from "@/app/recoil/ordinalsAtom"
import { RunesUtxo } from "@/app/recoil/runesAtom"
import { MempoolUTXO } from "@/app/recoil/utxoAtom"
import { atom } from "recoil"

export interface Output {
  vout: number
  value: number
  address: string
  type?: string
  rune?: RunesUtxo
  runesValue?: number
  inscription?: OrdinalData
}

export interface Butterfly {
  inputs: MempoolUTXO[]
  outputs: Output[]
}
export const DEFAULT_BUTTERFLY: Butterfly = {
  inputs: [],
  outputs: [],
}

export const butterflyAtom = atom<Butterfly>({
  key: "butterflyState",
  default: DEFAULT_BUTTERFLY,
})

export const butterflyUrlAtom = atom<string | null>({
  key: "butterflyUrlState",
  default: null,
})
