import { InscriptionData, ordAtom } from "@/app/recoil/ordAtom";
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom";
import { useAccounts } from "@particle-network/btc-connectkit";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

export const useOrd = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ord, setOrd] = useRecoilState(ordAtom);
  const ordinals = useRecoilValue(ordinalsAtom);

  const { accounts } = useAccounts();
  const account = accounts?.[0];

  const previousWallet = useRef<string | undefined>(undefined);

  useEffect(() => {
    const fetchOrdinals = async () => {
      try {
        if (!ordinals?.inscription) return;

        setIsLoading(true);

        const responsesPromises = ordinals.inscription.map(async (ordinal) => {
          const url = `/api/ord?inscriptionId=${ordinal.inscriptionId}`;
          const response = await fetch(url);
          return await response.json();
        });

        const data: InscriptionData[] = await Promise.all(responsesPromises);

        if (data) {
          setOrd(data);
          setIsLoading(false);
        }
      } catch (error) {
        setOrd(null);
        console.error(error);
      }
    };

    if (!isLoading && account && previousWallet.current !== account) {
      fetchOrdinals();
      previousWallet.current = account;
    }

    if (!account) {
      previousWallet.current = undefined;
      setOrd(null);
    }
  }, [ord, isLoading, setOrd, account, ordinals?.inscription]);

  return { ord };
};
