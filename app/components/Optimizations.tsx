import { Modal } from "@/app/components/Modal";
import { btcPriceAtom } from "@/app/recoil/btcPriceAtom";
import { butterflyAtom } from "@/app/recoil/butterflyAtom";
import { configAtom } from "@/app/recoil/confgsAtom";
import { runesAtom, RunesUtxo } from "@/app/recoil/runesAtom";
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom";
import { formatNumber } from "@/app/utils/format";
import { useAccounts } from "@particle-network/btc-connectkit";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export const Optimizations = () => {
  const [isOpen, setIsOpen] = useState(false);
  const btcUsdPrice = useRecoilValue(btcPriceAtom);
  const runes = useRecoilValue(runesAtom);
  const runesOptimizations = runes?.filter((r) => r.utxos.length >= 3);
  const { accounts } = useAccounts();
  const address = accounts[0];

  const onClose = () => setIsOpen(false);
  const utxos = useRecoilValue(utxoAtom);
  const setButterfly = useSetRecoilState(butterflyAtom);
  const setConfigs = useSetRecoilState(configAtom);

  const onSelect = (rune: RunesUtxo) => {
    onClose();

    const inputUtxos =
      utxos?.filter((utxo) =>
        rune.utxos.find((r) => r.location === `${utxo.txid}:${utxo.vout}`)
      ) || [];

    const utxosSorted = (
      JSON.parse(JSON.stringify(utxos)) as MempoolUTXO[]
    )?.sort((a, b) => a.value - b.value);

    const bestBtcInput = (utxosSorted || [])?.find(
      (utxo) => utxo.value > 10001
    );

    if (bestBtcInput) {
      inputUtxos.push(bestBtcInput);
    }
    const feeCost = 1500;
    setConfigs((prev) => ({
      ...prev,
      feeCost: feeCost,
      isInputDeckOpen: false,
      isOutputDeckOpen: false,
    }));

    setButterfly((prev) => ({
      ...prev,

      inputs: [...inputUtxos],
      outputs: [
        {
          type: "OP RETURN",
          value: 0,
          address: address,
          vout: 1,
          rune: rune,
        },
        {
          type: "runes",
          value: 546,
          address: address,
          rune: rune,
          runesValue: rune.utxos.reduce(
            (acc, curr) => acc + Number(curr.formattedBalance),
            0
          ),
          vout: 2,
        },
        {
          value:
            (bestBtcInput?.value || 0) +
            (rune.utxos?.length || 0) * 546 -
            feeCost -
            546,
          address: address,
          vout: 3,
        },
      ],
    }));
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <h2 className="text-[20px] font-bold mb-2">Optimizations </h2>

        <p className="mb-4 text-zinc-200 text-[12px]">
          Extract locked sats from your runes. Keep the same amount of runes,
          but merge them into a single UTXO.
        </p>
        {/*  */}
        {runesOptimizations?.map((rune, index) => {
          const expectedFeeCost = 700;
          const length = rune?.utxos.length;
          const profit = length * 546 - expectedFeeCost - 546;

          const profitInUsd = (profit / 100000000) * btcUsdPrice;
          return (
            <div
              className="flex justify-start items-start w-full h-full border p-2 hover:border-gray-50 cursor-pointer"
              key={index}
              onClick={() => onSelect(rune)}
            >
              <div className="justify-center items-center flex text-center text-[52px] mr-4">
                <div className="min-w-[38px] h-[38px] rounded bg-gray-800 border-[1px] border-gray-600 flex justify-center items-center text-[20px]">
                  {rune?.symbol}
                </div>
              </div>

              <div className="flex flex-col gap-[4px] justify-center items-start">
                <span className="text-[12px] font-bold">
                  {rune?.spacedRune}
                </span>
                <span className="text-[10px]">{rune?.runeid}</span>
              </div>

              <div className="flex-end flex items-end justify-end w-full flex-col">
                <span className="text-[16px] font-bold text-green-500">
                  + ${formatNumber(profitInUsd, 0, 2, false, false)}
                </span>
                <span className="text-[10px] font-bold ">{length} merges</span>
              </div>
            </div>
          );
        })}

        <p className="mt-2 text-zinc-500 text-[12px]">
          Notes: create a transaction merging all of your UTXOs into one, and
          extract locked sats from your Runes.
        </p>

        <br />
        <Link
          href={"https://satonomy.gitbook.io/satonomy"}
          className="text-[12px] font-normal text-zinc-500 hover:text-zinc-300 flex gap-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/gitbook.svg" alt="Help" width={16} height={16} />
          Check our docs
        </Link>
      </Modal>
    </>
  );
};
