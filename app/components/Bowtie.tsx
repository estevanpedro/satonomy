import React from "react";
import Image from "next/image";
import { useRecoilState } from "recoil";
import { useAccounts } from "@particle-network/btc-connectkit";

import { useRunes } from "@/app/hooks/useRunes";
import { useInputs } from "@/app/hooks/useInputs";

import { formatNumber } from "@/app/utils/format";
import { useOutputs } from "@/app/hooks/useOutputs";
import { MempoolUTXO } from "@/app/recoil/utxoAtom";
import { Card, CardOutput, EmptyCard } from "@/app/components/Card";

import { useOrdinals } from "@/app/hooks/useOrdinals";
import { butterflyAtom } from "@/app/recoil/butterflyAtom";
import { configAtom } from "@/app/recoil/confgsAtom";
import { useBitcoinPrice } from "@/app/hooks/useBitcoinPrice";

export const Bowtie = () => {
  useRunes();
  useOrdinals();
  useBitcoinPrice();

  const [configs, setConfigs] = useRecoilState(configAtom);
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom);
  const { accounts } = useAccounts();

  const account = accounts[0];
  const inputsCount = butterfly.inputs.length;
  const outputsCount = butterfly.outputs.length;

  const height = 320;
  const inputHeight = 320 * inputsCount;
  const outputHeight = 320 * outputsCount;
  const totalHeight = Math.max(inputHeight, outputHeight);

  const inputPaths = useInputs({
    butterfly,
    totalHeight: inputHeight,
    inputsCount,
    height,
  });

  const outputPaths = useOutputs({
    butterfly,
    totalHeight: outputHeight,
    outputsCount,
    height,
    inputHeight,
    inputsCount,
  });

  const onAddInput = () => {
    setConfigs((prev: any) => ({
      ...prev,
      isInputDeckOpen: !prev.isInputDeckOpen,
    }));
  };

  const onAddOutput = () => {
    setButterfly((prev) => ({
      ...prev,
      outputs: [
        ...prev.outputs,
        {
          value:
            prev.inputs.reduce((acc, cur) => acc + cur.value, 0) -
              prev.outputs.reduce((acc, cur) => acc + cur.value, 0) >
            0
              ? prev.inputs.reduce((acc, cur) => acc + cur.value, 0) -
                prev.outputs.reduce((acc, cur) => acc + cur.value, 0) -
                configs.feeCost
              : 1,
          vout: prev.outputs.length,
          address: account,
        },
      ],
    }));
  };

  const onRemoveOutput = (index: number) => {
    setButterfly((prev) => ({
      ...prev,
      outputs: prev.outputs.filter((_, key) => key !== index),
    }));
  };

  const onRemoveInput = (utxo: MempoolUTXO) => {
    setButterfly((prev) => ({
      ...prev,
      inputs: prev.inputs.filter((input) => input !== utxo),
    }));
  };

  return (
    <>
      <div className="flex mb-2 text-[12px] font-bolds justify-end ">
        <div className="h-60 min-w-52 rounded-xl flex flex-col gap-3 items-center justify-center opacity-50 font-medium border bg-zinc-950">
          Input Total:{" "}
          {formatNumber(
            butterfly.inputs.reduce(
              (acc, cur) => acc + cur.value / 100000000,
              0
            ),
            0,
            8,
            false,
            false
          )}{" "}
          BTC
        </div>

        <div className="h-60 w-full flex mb-2 text-[12px]  justify-end opacity-50">
          <div className="py-6 min-w-52  rounded-xl flex flex-col gap-3 items-center justify-center border bg-zinc-950">
            {Boolean(configs.feeRate) && <div>{configs.feeRate} sat/vb</div>}

            <Image
              className="w-14 h-14"
              src="/bitcoin.png"
              alt="Bitcoin"
              width={54}
              height={54}
            />
            <div className="text-center  font-medium whitespace-nowrap flex flex-col justify-center items-center ">
              <input
                type="number"
                value={configs.feeCost}
                onChange={(e) => {
                  setConfigs((prev: any) => ({
                    ...prev,
                    feeCost: Number(e.target.value),
                  }));
                }}
                placeholder="0"
                className="bg-transparent text-[20px] border text-center outline-none border-transparent w-20 h-12 ml-[16px]"
              />{" "}
              <div className="mt-[-15px] text-[12px]">sats</div>
            </div>
            <div>Network Fee</div>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="flex">
        <div className="w-full">
          <div
            className={`relative ${
              inputHeight ? `h-[${inputHeight + 1}px]` : ""
            } flex flex-col items-end justify-end`}
          >
            {butterfly.inputs.map((utxo, i) => (
              <div
                className="mb-8 h-80 min-h-[320px] flex w-full relative z-2"
                key={`input-${i}`}
              >
                <Card utxo={utxo} onRemove={onRemoveInput} />
              </div>
            ))}
            {inputPaths}
          </div>

          <EmptyCard onClick={onAddInput} />
        </div>

        <div className={`w-full flex flex-col`}>
          <div
            className={`relative ${
              totalHeight ? `h-[${totalHeight + 1}px]` : ""
            } flex flex-col w-full`}
          >
            {outputPaths}

            {butterfly.outputs.map((_, i) => (
              <div
                key={`output-${i}`}
                className="mb-8 h-80 flex w-full relative z-2 justify-end"
              >
                <CardOutput index={i} onRemove={onRemoveOutput} />
              </div>
            ))}
          </div>
          <EmptyCard onClick={onAddOutput} className="self-end" />
        </div>
      </div>
    </>
  );
};
