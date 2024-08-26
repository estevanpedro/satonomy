import { utxoState } from "@/app/recoil/utxo";
import { utxoServices } from "@/app/services/utxoServices";
import { useAccounts } from "@particle-network/btc-connectkit";
import { track } from "@vercel/analytics";
import { useEffect } from "react";
import { useRecoilState } from "recoil";

export const useMempool = () => {
  const [utxo, setUtxo] = useRecoilState(utxoState);
  const { accounts } = useAccounts();
  const wallet = accounts?.[0];

  useEffect(() => {
    const fetchUtxos = async () => {
      track("utxo-fetch", { wallet: wallet });
      const res = await utxoServices.getUtxos(wallet);
      if (res?.length) {
        setUtxo(res as []);
      } else {
        setUtxo(null);
      }
    };
    if (wallet && !utxo?.length) {
      fetchUtxos();
    }
  }, [wallet, utxo, setUtxo]);
};
