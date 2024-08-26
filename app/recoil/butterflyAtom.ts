import { MempoolUTXO } from "@/app/recoil/utxoAtom";
import { atom } from "recoil";

export interface Output {
  vout: number;
  value: number;
  address: string;
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
