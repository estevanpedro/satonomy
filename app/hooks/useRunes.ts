import { runesAtom } from "@/app/recoil/runesAtom";
import { useAccounts } from "@particle-network/btc-connectkit";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";

export const useRunes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [runeStates, setRuneStates] = useRecoilState(runesAtom);
  const { accounts } = useAccounts();
  const account = accounts?.[0];

  const previousWallet = useRef<string | undefined>(undefined);

  useEffect(() => {
    const fetchRunesUtxos = async () => {
      try {
        setIsLoading(true);
        const url = `/api/balances?account=${account}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data) {
          setRuneStates(data);
          setIsLoading(false);
        }
      } catch (error) {
        setRuneStates([]);
        console.error(error);
      }
    };

    if (!isLoading && account && previousWallet.current !== account) {
      fetchRunesUtxos();
      previousWallet.current = account;
    }

    if (!account) {
      previousWallet.current = undefined; // Reset previousWallet if wallet disconnects
      setRuneStates(null); // Clear utxo on wallet disconnect
    }
  }, [runeStates, isLoading, setRuneStates, account]);

  return { runeStates };
};
