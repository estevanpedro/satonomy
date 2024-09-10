"use client";
import { OrdinalRendering } from "@/app/components/Ordinals";
import { btcPriceAtom } from "@/app/recoil/btcPriceAtom";
import { butterflyAtom } from "@/app/recoil/butterflyAtom";
import { configAtom } from "@/app/recoil/confgsAtom";
import { OrdinalData } from "@/app/recoil/ordinalsAtom";
import { recommendedFeesAtom } from "@/app/recoil/recommendedFeesAtom";
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom";

import { formatNumber } from "@/app/utils/format";
import { useAccounts } from "@particle-network/btc-connectkit";
import { track } from "@vercel/analytics";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export const OptimizationOrdinals = ({
  ordinal,
  onClose,
  index,
  onOptimizeSelection,
}: {
  ordinal: OrdinalData;
  onClose: () => void;
  index: number;
  onOptimizeSelection?: () => void;
}) => {
  const [showSats, setShowSats] = useState<number | null>(null); // Track which card is hovered

  const setButterfly = useSetRecoilState(butterflyAtom);
  const setConfigs = useSetRecoilState(configAtom);
  const recommendedFeeRate = useRecoilValue(recommendedFeesAtom);
  const utxos = useRecoilValue(utxoAtom);
  const btcUsdPrice = useRecoilValue(btcPriceAtom);
  const { accounts } = useAccounts();
  const address = accounts[0];
  const length = 1;
  const [feeCost, setFeeCost] = useState<number>(500);
  const { referrer } = useParams();

  const profitMocked = length * 546 - feeCost - 546;

  const [profit, setProfit] = useState<number>(profitMocked);
  const profitInSats = profit;
  const profitInUsd = (profit / 100000000) * btcUsdPrice;

  useEffect(() => {
    if (!ordinal) return;

    const utxosSorted = (
      JSON.parse(JSON.stringify(utxos)) as MempoolUTXO[]
    )?.sort((a, b) => a.value - b.value);

    let allBtcInputsValue = ordinal.utxo.satoshi;

    const inputUtxos =
      utxos?.filter((utxo) => ordinal.utxo.txid === utxo.txid) || [];

    if (allBtcInputsValue < feeCost) {
      const bestBtcInput = (utxosSorted || [])?.find(
        (utxo) => utxo.value > feeCost && utxo.value > 546
      );

      if (!bestBtcInput?.value) {
        console.log("No BTC input found to pay fees");
        return;
      }
      if (bestBtcInput) {
        inputUtxos.push(bestBtcInput);
      }

      allBtcInputsValue += bestBtcInput.value;
    }

    const charge = allBtcInputsValue - 546 - feeCost;

    const usersProfit = Math.floor(charge * 0.8);
    const platformFee = Math.floor(charge - usersProfit);

    setProfit(usersProfit);

    const fetchFees = async () => {
      try {
        if (!inputUtxos) {
          console.log("No inputUtxos found");
          return;
        }

        const referrerFee = !referrer
          ? 0
          : Math.ceil(usersProfit - usersProfit * 0.9);

        const referrerOutput = referrer
          ? [
              {
                value: referrerFee,
                address: referrer as string,
                vout: 5,
                type: "referrer",
              },
            ]
          : [];

        const chargeOutput = [
          {
            value: usersProfit,
            address: address,
            vout: 3,
          },
          {
            value: platformFee,
            address:
              "bc1p88kkz603d5haumns83pd25x5a5ctkp0wzpvkla82ltdvcnezqvzqgwfc93",
            vout: 4,
            type: "platformFee",
          },
          ...referrerOutput,
        ];

        const newButterfly = {
          inputs: [...inputUtxos],
          outputs: [
            {
              type: "OP RETURN",
              value: 0,
              address: address,
              vout: 1,
              ordinal: ordinal,
            },
            {
              type: "runes",
              value: 546,
              address: address,
              ordinal: ordinal,
              vout: 2,
            },
            ...chargeOutput,
          ],
        };

        const body = JSON.stringify({
          newButterfly,
          address,
          feeRate: recommendedFeeRate,
        });

        const res = await fetch(`/api/estimateFees`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        });
        const result = await res.json();

        if (!result?.error) {
          setFeeCost(result);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (!feeCost || feeCost === 500) fetchFees();
  }, [feeCost, address, ordinal, utxos, recommendedFeeRate]);

  const onSelect = (ordinal: OrdinalData) => {
    onOptimizeSelection?.();
    onClose();

    const utxosSorted = (
      JSON.parse(JSON.stringify(utxos)) as MempoolUTXO[]
    )?.sort((a, b) => a.value - b.value);

    let allBtcInputsValue = ordinal.utxo.satoshi;

    const inputUtxos =
      utxos?.filter((utxo) => ordinal.utxo.txid === utxo.txid) || [];

    if (allBtcInputsValue < feeCost) {
      const bestBtcInput = (utxosSorted || [])?.find(
        (utxo) => utxo.value > feeCost && utxo.value > 546
      );

      if (!bestBtcInput?.value) {
        console.log("No BTC input found to pay fees");
        return;
      }
      if (bestBtcInput) {
        inputUtxos.push(bestBtcInput);
      }

      allBtcInputsValue += bestBtcInput.value;
    }

    setConfigs((prev) => ({
      ...prev,
      feeCost: feeCost,
      isInputDeckOpen: false,
      isInputFullDeckOpen: false,
      isOutputDeckOpen: false,
    }));

    const charge = allBtcInputsValue - 546 - feeCost;
    const usersProfit = charge * 0.8;
    const finalUserProfit = Math.floor(usersProfit);
    const satonomyFees = charge - finalUserProfit; // 20%
    const platformFee = referrer
      ? Math.floor(satonomyFees * 0.5)
      : Math.floor(satonomyFees * 1);
    const referrerFee = referrer ? Math.floor(satonomyFees * 0.5) : 0;
    const difference = Math.floor(satonomyFees - platformFee - referrerFee);

    const referrerOutput = referrer
      ? [
          {
            value: referrerFee,
            address: referrer as string,
            vout: 5,
            type: "referrer",
          },
        ]
      : [];

    const chargeOutput = [
      {
        value: finalUserProfit + difference,
        address: address,
        vout: 3,
      },
      {
        value: platformFee,
        address:
          "bc1p88kkz603d5haumns83pd25x5a5ctkp0wzpvkla82ltdvcnezqvzqgwfc93",
        vout: 4,
        type: "platformFee",
      },
      ...referrerOutput,
    ];

    const newButterfly = {
      inputs: [...inputUtxos],
      outputs: [
        {
          type: "OP RETURN",
          value: 0,
          address: address,
          vout: 1,
          ordinal: ordinal,
        },
        {
          type: "runes",
          value: 546,
          address: address,
          ordinal: ordinal,
          vout: 2,
        },
        ...chargeOutput,
      ],
    };

    setButterfly(newButterfly);

    track("optimization-clicked", {
      wallet: address,
      inputs: newButterfly.inputs.length,
    });
  };

  if (profitInSats < 0) return null;

  return (
    <button
      data-tooltip-id={"Optimizations"}
      data-tooltip-content={"Coming Soon"}
      data-tooltip-place="right"
      className={`cursor-progress flex justify-start items-start w-full h-full border p-2  ${
        !Boolean(profitInSats) || !Boolean(profitInUsd)
          ? "opacity-50 cursor-progress"
          : "opacity-100 hover:border-gray-50 cursor-pointer"
      }`}
      onMouseEnter={() => setShowSats(index)} // Show sats on hover
      onMouseLeave={() => setShowSats(null)} // Hide sats when not hovered
    >
      <div className="justify-center items-center flex text-center text-[52px] mr-4">
        <div className="min-w-[38px] h-[38px] rounded bg-gray-800 border-[1px] border-gray-600 flex justify-center items-center text-[20px]">
          {!ordinal.utxo.inscriptions[0].isBRC20 &&
            !ordinal.contentType.includes("text") &&
            !ordinal.contentType.includes("xml") &&
            ordinal.contentType.includes("image") && (
              <OrdinalRendering
                utxo={ordinal.utxo as unknown as MempoolUTXO}
                setIsBrc20={() => {}}
                size={40}
              />
            )}
        </div>
      </div>

      <div className="flex flex-col gap-[4px] justify-center items-start">
        <span className="text-[12px] font-bold whitespace-nowrap">
          {ordinal.contentType}
        </span>
        <span className="text-[10px]">
          {ordinal.utxo.inscriptions[0]?.inscriptionNumber}
        </span>
      </div>

      <div className="flex-end flex items-end justify-end w-full flex-col">
        {Boolean(profitInSats) && Boolean(profitInUsd) && (
          <span className="text-[16px] font-bold text-green-500">
            {showSats === index
              ? `+ ${profitInSats} sats`
              : `+ $${formatNumber(profitInUsd, 0, 2, false, false)}`}
          </span>
        )}
        {(!Boolean(profitInSats) || !Boolean(profitInUsd)) && (
          <div>
            <span className="text-[16px] font-bold text-green-500">
              + <span className="animate-pulse">...</span>
            </span>
          </div>
        )}
        <span className="text-[10px] font-bold ">{length} merge</span>
      </div>
    </button>
  );
};
