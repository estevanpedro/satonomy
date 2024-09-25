import { atom } from "recoil"

export interface Status {
  confirmed: boolean
  block_height: number
  block_hash: string
  block_time: number
}

export interface MempoolUTXO {
  txid: string
  vout: number
  status: Status
  value: number
  wallet?: string
}

export const utxoAtom = atom<MempoolUTXO[] | null>({
  key: "utxoAtom",
  default: [],
})
