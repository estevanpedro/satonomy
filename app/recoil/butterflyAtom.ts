import { RunesUtxo } from "@/app/recoil/runesAtom";
import { MempoolUTXO } from "@/app/recoil/utxoAtom";
import { atom } from "recoil";

export interface Output {
  vout: number;
  value: number;
  address: string;
  type?: string;
  rune?: RunesUtxo;
  runesValue?: number;
}

export interface Butterfly {
  inputs: MempoolUTXO[];
  outputs: Output[];
  configs: any;
}

export const butterflyAtom = atom<Butterfly>({
  key: "butterflyState",
  default: {
    inputs: [],
    outputs: [],
    configs: {},
  },
});
