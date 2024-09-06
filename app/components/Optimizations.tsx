import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import { Modal } from "@/app/components/Modal";
import { OptimizationCard } from "@/app/components/OptimizationCard";
import { runesAtom, RunesUtxo } from "@/app/recoil/runesAtom";

export const Optimizations = () => {
  const [isOpen, setIsOpen] = useState(false);
  const runes = useRecoilValue(runesAtom);
  const [runesOptimizations, setRunesOptimizations] = useState<
    RunesUtxo[] | []
  >([]);

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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
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
              <OptimizationCard rune={rune} onClose={onClose} index={index} />
            </div>
          );
        })}

        <p className="mt-4 text-zinc-500 text-[11px]">
          Create a transaction that consolidates all of your UTXOs into one and
          extracts the locked sats. It is recommended to perform at least 5
          merges.
        </p>
      </Modal>
    </>
  );
};
