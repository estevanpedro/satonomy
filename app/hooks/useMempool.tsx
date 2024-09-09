import { configAtom } from "@/app/recoil/confgsAtom";
import { utxoAtom } from "@/app/recoil/utxoAtom";
import { utxoServices } from "@/app/services/utxoServices";
import { useAccounts } from "@particle-network/btc-connectkit";
import { track } from "@vercel/analytics";
import { useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export const useMempool = () => {
  const setUtxo = useSetRecoilState(utxoAtom);
  const { accounts } = useAccounts();
  const wallet = accounts?.[0];
  const configs = useRecoilValue(configAtom);
  const notConfirmed = configs.notConfirmed;

  const previousWallet = useRef<string | undefined>(undefined);

  useEffect(() => {
    const fetchUtxos = async () => {
      track("utxo-fetch", { wallet });
      const res = await utxoServices.getUtxos(wallet, notConfirmed);
      if (res?.length) {
        setUtxo(res as []);

        track(
          "utxo-length",
          { wallet, length: res.length },
          { flags: ["utxosLengths"] }
        );
      } else {
        setUtxo(null);
      }
    };

    if (wallet && previousWallet.current !== wallet) {
      fetchUtxos();
      previousWallet.current = wallet; // Update previous wallet to the current one
    }

    if (!wallet) {
      previousWallet.current = undefined; // Reset previousWallet if wallet disconnects
      setUtxo(null); // Clear utxo on wallet disconnect
    }
  }, [wallet, setUtxo, notConfirmed]);
};
