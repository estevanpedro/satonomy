import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import { Modal } from "@/app/components/Modal";
import { OptimizationCard } from "@/app/components/OptimizationCard";
import { runesAtom, RunesUtxo } from "@/app/recoil/runesAtom";
import { useAccounts } from "@particle-network/btc-connectkit";
import { formatAddress } from "@/app/utils/format";
import Image from "next/image";
import { track } from "@vercel/analytics";
import { Tooltip } from "react-tooltip";
import { ConnectButton } from "@/app/components/Connect";
import { OrdinalData, ordinalsAtom } from "@/app/recoil/ordinalsAtom";
import { OptimizationOrdinals } from "@/app/components/OptimizationOrdinals";

export const Optimizations = () => {
  const { accounts } = useAccounts();
  const ordinals = useRecoilValue(ordinalsAtom);
  const runes = useRecoilValue(runesAtom);

  const [isOpen, setIsOpen] = useState(true);
  const [runesOptimizations, setRunesOptimizations] = useState<
    RunesUtxo[] | []
  >([]);
  const [ordinalsOptimizations, setOrdinalsOptimizations] = useState<
    OrdinalData[] | []
  >([]);

  const account = accounts?.[0];
  const onClose = () => setIsOpen(false);

  useEffect(() => {
    const ordinalsOptimizationsFiltered = ordinals?.inscription?.filter(
      (o) => o.utxo.satoshi > 546
    );

    if (ordinalsOptimizationsFiltered?.length) {
      setOrdinalsOptimizations(ordinalsOptimizationsFiltered);
    }
    const runesOptimizations = runes?.filter((r) => r.utxos.length >= 5);

    if (runesOptimizations) {
      const hasSavedOnLocalStorage = localStorage.getItem("runesOptimizations");
      if (!hasSavedOnLocalStorage) {
        localStorage.setItem("runesOptimizations", "saved");
        setIsOpen(true);
      }
      setRunesOptimizations(runesOptimizations);
    }
  }, [runes, ordinals?.inscription]);

  const [optimizationSelected, setOptimizationSelected] = useState(false);
  const onOptimizeSelection = () => {
    setOptimizationSelected(true);
  };

  const [referralUrl, setReferralUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setReferralUrl(`https://${window.location.hostname}/${account}`);
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
      {
        <div className={`items-center mt-4 ${account ? "" : "hidden sm:flex"}`}>
          <div
            className="flex gap-2 cursor-pointer -mt-4"
            onClick={() => setIsOpen(true)}
          >
            <span className="text-[#52525B] hover:text-white border px-3 py-1 -mr-3  rounded hover:border-white">
              Optimize
            </span>{" "}
            <span className="relative flex h-3 w-3">
              {Boolean(runesOptimizations?.length) && !optimizationSelected && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </>
              )}
            </span>
          </div>
        </div>
      }

      <Modal isOpen={isOpen} onClose={onClose}>
        <Tooltip
          id={"Optimizations"}
          className="max-w-[300px] bg-gray-600"
          style={{ backgroundColor: "#292929", color: "white" }}
        />
        <h2 className="text-[20px] font-bold mb-4 flex gap-2">
          Optimizations{" "}
          <Image
            src="/info.svg"
            alt="Help"
            width={14}
            height={14}
            className="mt-[1px] cursor-help"
            data-tooltip-id={"Optimizations"}
            data-tooltip-content={
              "Create a transaction that consolidates all of your UTXOs into one and extracts the locked sats. An examples: each mint a new 546 sats UTXO is created, if you minted 10 times, you would have 10 x 546 = 5460 sats locked. This optimization will consolidate all of those UTXOs into one of 546, pay the fees and extract the locked sats."
            }
            data-tooltip-place="right"
          />
        </h2>

        <p className="mb-4 text-zinc-200 text-[12px]">
          Extract locked sats. Keep the same amount of ordinals and runes
          merging into a single UTXO.
        </p>

        {Boolean(!runesOptimizations.length) &&
          Boolean(!ordinalsOptimizations.length) && (
            <div className="flex justify-start items-start w-full h-full border p-2">
              <div className="flex items-center gap-2">
                <div className="min-w-[38px] h-[38px] rounded bg-gray-800 border-[1px] border-gray-600 flex justify-center items-center text-[20px]">
                  <span>?</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold">
                    No optimizations available
                  </span>
                  <span className="text-[10px]">
                    You do not have enough UTXOs to optimize
                  </span>
                </div>
              </div>
            </div>
          )}

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

        {ordinalsOptimizations.length > 0 && (
          <>
            {ordinalsOptimizations.map((ordinal, index) => {
              return (
                <div key={index}>
                  <OptimizationOrdinals
                    ordinal={ordinal}
                    onClose={onClose}
                    index={index}
                    onOptimizeSelection={onOptimizeSelection}
                  />
                </div>
              );
            })}
          </>
        )}

        <div className="border-t-[1px] mt-4">
          <p className="mt-3 text-[12px]">
            Invite a friend and earn 50% of their fees! Click below to copy and
            share your referral link.
          </p>

          {!Boolean(account) && (
            <p className="mt-4 opacity-50 text-[12px]">
              <ConnectButton />
            </p>
          )}
          {Boolean(account) && (
            <p
              onClick={copyToClipboard}
              className="text-[12px] mt-2 opacity-50 flex gap-2 hover:opacity-100 cursor-pointer "
            >
              {typeof window !== "undefined" &&
                `${window?.location?.hostname.replace(
                  "www.",
                  ""
                )}/${formatAddress(account || "")}`}

              <Image
                src="/copy.png"
                width={16}
                height={16}
                alt="Copy"
                className="w-4 h-4 mt-[2px]"
              />

              {isCopied ? (
                <span className="text-[10px] opacity-50 mt-[2px] h-[14px]">
                  Copied!
                </span>
              ) : (
                ""
              )}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};
