import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import { Modal } from "@/app/components/Modal";
import { OptimizationCard } from "@/app/components/OptimizationCard";
import { runesAtom, RunesUtxo } from "@/app/recoil/runesAtom";
import { useAccounts } from "@particle-network/btc-connectkit";
import { formatAddress } from "@/app/utils/format";
import Image from "next/image";
import { track } from "@vercel/analytics";

export const Optimizations = () => {
  const [isOpen, setIsOpen] = useState(false);
  const runes = useRecoilValue(runesAtom);
  console.log("✌️runes --->", runes);
  const [runesOptimizations, setRunesOptimizations] = useState<
    RunesUtxo[] | []
  >([]);

  const { accounts } = useAccounts();
  const account = accounts?.[0];
  const onClose = () => setIsOpen(false);

  useEffect(() => {
    const runesOptimizations = runes?.filter((r) => r.utxos.length >= 5);
    if (runesOptimizations) {
      const hasSavedOnLocalStorage = localStorage.getItem("runesOptimizations");
      if (!hasSavedOnLocalStorage) {
        localStorage.setItem("runesOptimizations", "saved");
        setIsOpen(true);
      }
      setRunesOptimizations(runesOptimizations);
    }
  }, [runes]);

  const [optimizationSelected, setOptimizationSelected] = useState(false);
  const onOptimizeSelection = () => {
    setOptimizationSelected(true);
  };

  const [referralUrl, setReferralUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setReferralUrl(`${window.location.hostname}/${account}`);
    }
  }, [account]);

  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    setIsCopied(true);
    track("referrer-copied", { wallet: account }, { flags: ["copy"] });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl).then(
        () => console.log("Text copied to clipboard"),
        (err) => console.error("Could not copy text: ", err)
      );
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = referralUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        console.log("Text copied to clipboard");
      } catch (err) {
        console.error("Could not copy text: ", err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <>
      {Boolean(runesOptimizations?.length) && (
        <div className=" items-center mt-4">
          <div
            className="flex gap-2 cursor-pointer -mt-4"
            onClick={() => setIsOpen(true)}
          >
            <span className="text-[#52525B] hover:text-white border px-3 py-1 -mr-3  rounded hover:border-white">
              Optimize
            </span>{" "}
            <span className="relative flex h-3 w-3">
              {!optimizationSelected && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </>
              )}
            </span>
          </div>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <h2 className="text-[20px] font-bold mb-4">Optimizations </h2>

        <p className="mb-4 text-zinc-200 text-[12px]">
          Extract locked sats. Keep the same amount of runes merging into a
          single UTXO.
        </p>

        {runesOptimizations?.map((rune, index) => {
          return (
            <div key={index}>
              <OptimizationCard
                rune={rune}
                onClose={onClose}
                index={index}
                onOptimizeSelection={onOptimizeSelection}
              />
            </div>
          );
        })}

        <p className="mt-4 text-zinc-500 text-[11px]">
          Create a transaction that consolidates all of your UTXOs into one and
          extracts the locked sats. It is recommended to perform at least 5
          merges.
        </p>

        <div className="border-t-[1px] mt-4">
          <p className="mt-6 text-[12px]">
            Invite a friend and earn 50% of their optimization fees! Copy your
            referral code below.
          </p>
          <p
            onClick={copyToClipboard}
            className="text-[12px] mt-2 opacity-50 flex gap-2 hover:opacity-100 cursor-pointer "
          >
            {typeof window !== "undefined" &&
              `${window?.location?.hostname}/${formatAddress(account || "")}`}

            <Image src="/copy.png" width={16} height={16} alt="Copy" />

            {isCopied ? (
              <span className="text-[10px] opacity-50 mt-[2px]">Copied!</span>
            ) : (
              ""
            )}
          </p>
        </div>
      </Modal>
    </>
  );
};
