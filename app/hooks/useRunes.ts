import { runesAtom } from "@/app/recoil/utxo";
import { useAccounts } from "@particle-network/btc-connectkit";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

export const useRunes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [runeStates, setRuneStates] = useRecoilState(runesAtom);
  const { accounts } = useAccounts();
  const account = accounts?.[0];

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

    if (!runeStates && !isLoading && account) fetchRunesUtxos();
  }, [runeStates, isLoading, setRuneStates, account]);

  return { runeStates };
};
