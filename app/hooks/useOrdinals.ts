import { ordinalsAtom } from "@/app/recoil/ordinalsAtom";
import { useAccounts } from "@particle-network/btc-connectkit";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";

export const useOrdinals = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ordinals, setOrdinals] = useRecoilState(ordinalsAtom);
  const { accounts } = useAccounts();
  const account = accounts?.[0];

  const previousWallet = useRef<string | undefined>(undefined);

  useEffect(() => {
    const fetchOrdinals = async () => {
      try {
        setIsLoading(true);
        const url = `/api/ordinals?account=${account}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data) {
          setOrdinals(data);
          setIsLoading(false);
        }
      } catch (error) {
        setOrdinals(null);
        console.error(error);
      }
    };

    if (!isLoading && account && previousWallet.current !== account) {
      fetchOrdinals();
      previousWallet.current = account;
    }

    if (!account) {
      previousWallet.current = undefined;
      setOrdinals(null);
    }
  }, [ordinals, isLoading, setOrdinals, account]);

  return { ordinals };
};
