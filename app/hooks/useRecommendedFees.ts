import { ordinalsAtom } from "@/app/recoil/ordinalsAtom";
import { recommendedFeesAtom } from "@/app/recoil/recommendedFeesAtom";
import { useAccounts } from "@particle-network/btc-connectkit";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

export const useRecommendedFees = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [feeHour, setFeeHour] = useRecoilState(recommendedFeesAtom);
  const { accounts } = useAccounts();
  const account = accounts?.[0];

  useEffect(() => {
    const fetchOrdinals = async () => {
      try {
        setIsLoading(true);
        const url = `/api/fees`;
        const response = await fetch(url);
        const data = await response.json();

        if (data) {
          setFeeHour(data);
          setIsLoading(false);
        }
      } catch (error) {
        setFeeHour(null);
        console.error(error);
      }
    };

    if (!feeHour && !isLoading && account) fetchOrdinals();
  }, [feeHour, isLoading, setFeeHour, account]);
};
