import { atom } from "recoil";

export const btcPriceAtom = atom<number>({ key: "btcPrice", default: 0 });
