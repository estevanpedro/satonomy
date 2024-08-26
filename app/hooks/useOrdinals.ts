import { ordinalsAtom } from "@/app/recoil/ordinalsAtom";
import { useAccounts } from "@particle-network/btc-connectkit";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

export const useOrdinals = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ordinals, setOrdinals] = useRecoilState(ordinalsAtom);
  const { accounts } = useAccounts();
  const account = accounts?.[0];

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

    if (!ordinals && !isLoading && account) fetchOrdinals();
  }, [ordinals, isLoading, setOrdinals, account]);

  return { ordinals };
};
