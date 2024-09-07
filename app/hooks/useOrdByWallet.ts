import { ordByWalletAtom } from "@/app/recoil/ordByWalletAtom";
import { useAccounts } from "@particle-network/btc-connectkit";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

export const useOrdByWallet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ord, setOrd] = useRecoilState(ordByWalletAtom);
  const { accounts } = useAccounts();
  const account =
    "bc1p9ua9ef49lkztkkvkc0ljly3ugx3ky7d4dxgehpdg0jn3cnkfz6zq4le8xh";

  useEffect(() => {
    const fetchOrdinals = async () => {
      try {
        setIsLoading(true);

        const url = `/api/satributes?wallet=${account}`;
        const response = await fetch(url, {
          next: { revalidate: 60 * 5 },
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        if (data) {
          setOrd(data);
          setIsLoading(false);
        }
      } catch (error) {
        setOrd(null);
        console.error(error);
      }
    };

    if (ord === undefined && !isLoading && account) fetchOrdinals();
  }, [ord, isLoading, setOrd, account]);

  return { ord };
};
