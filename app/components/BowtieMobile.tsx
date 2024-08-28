import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useAccounts } from "@particle-network/btc-connectkit";

import { formatNumber } from "@/app/utils/format";
import { useOutputs } from "@/app/hooks/useOutputs";
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom";
import {
  CardMobile,
  CardOutput,
  CardOutputMobile,
  EmptyCardMobile,
} from "@/app/components/Card";

import { butterflyAtom } from "@/app/recoil/butterflyAtom";
import { configAtom } from "@/app/recoil/confgsAtom";
import { useInputsMobile } from "@/app/hooks/useInputsMobile";
import { useOutputsMobile } from "@/app/hooks/useOutputsMobile";
import Image from "next/image";
import { AddOutput } from "@/app/components/AddOutput";

export const BowtieMobile = () => {
  const utxos = useRecoilValue(utxoAtom);
  const [configs, setConfigs] = useRecoilState(configAtom);
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom);
  const { accounts } = useAccounts();

  const account = accounts[0];
  const inputsCount = butterfly.inputs.length;
  const outputsCount = butterfly.outputs.length;

  const height = 116;
  const inputHeight = 116 * inputsCount;
  const outputHeight = 116 * outputsCount;
  const totalHeight = Math.max(inputHeight, outputHeight);

  const inputPaths = useInputsMobile({
    butterfly,
    totalHeight: inputHeight,
    inputsCount,
    height,
  });

  const outputPaths = useOutputsMobile({
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

  const inputTotalBtc = butterfly.inputs.reduce(
    (acc, cur) => acc + cur.value / 100000000,
    0
  );

  const bestUtxo = JSON.parse(JSON.stringify(utxos))?.sort(
    (a: MempoolUTXO, b: MempoolUTXO) => b.value - a.value
  )[0];

  const selectNewUtxoInput = (utxo: MempoolUTXO) => {
    setConfigs((prev: any) => ({
      ...prev,
      isInputDeckOpen: false,
      feeCost: prev.feeCost ? prev.feeCost : 1000,
    }));

    const outputSum = butterfly.outputs.reduce(
      (acc, cur) => acc + cur.value,
      0
    );

    const inputSum =
      butterfly.inputs.reduce((acc, cur) => acc + cur.value, 0) + utxo.value;

    setButterfly((prev: any) => ({
      ...prev,
      inputs: [...prev.inputs, utxo],
    }));

    if (inputSum - outputSum > 0) {
      let outputsUpdated = [...butterfly.outputs];

      outputsUpdated[butterfly.outputs.length - 1] = {
        ...outputsUpdated[butterfly.outputs.length - 1],
        value:
          inputSum -
          configs.feeCost -
          outputSum -
          configs.feeCost +
          (inputSum - utxo.value),
      };

      setButterfly((prev) => ({
        ...prev,
        outputs: [...outputsUpdated],
      }));
    }
  };

  const inputValues = butterfly.inputs.reduce((acc, cur) => acc + cur.value, 0);
  const outputValues =
    butterfly.outputs.reduce((acc, cur) => acc + cur.value, 0) +
    configs.feeCost;

  const difference = inputValues - outputValues;
  const isConfirmDisabled =
    difference !== 0 || outputValues - configs.feeCost < 0;

  const usersOutputs = butterfly.outputs.filter((o) => o.address === account);
  const isTransfer = usersOutputs.length < butterfly.outputs.length;
  const isSplit = usersOutputs.length === butterfly.outputs.length;

  const confirmTooltip = utxos?.length
    ? isConfirmDisabled
      ? difference > 0 || outputValues < 0
        ? `Adjust the fee or outputs. UTXO balance is ${formatNumber(
            inputValues - outputValues,
            0,
            0,
            false,
            false
          )} sats; it should be 0.`
        : `Add more inputs ${
            outputValues ? "or adjust the output" : ""
          }. UTXO balance is ${formatNumber(
            inputValues - outputValues,
            0,
            0,
            false,
            false
          )} sats; it should be 0.`
      : "Create PSBT and sign"
    : "No UTXOs";

  return (
    <>
      <div className=" flex sm:hidden px-8 mb-20 w-[360px] mt-36 relative">
        <div className="absolute -top-24 left-0 opacity-50 text-[12px]">
          Inputs
        </div>
        <div className="absolute -top-24 right-0 opacity-50 text-[12px]">
          Outputs
        </div>
        <div className="flex mb-2 text-[12px]  justify-end opacity-50 absolute right-8 -top-[76px]  flex-col">
          <div className="text-[10px] pl-2">Network Fee</div>
          <div className="  rounded-xl flex flex-col  items-center justify-center border bg-zinc-950 h-[40px] min-w-[100px] w-[100px]">
            <div className="mt-1 text-[12px] text-center text-white font-medium whitespace-nowrap flex justify-center items-center ">
              <input
                type="number"
                value={configs.feeCost}
                onChange={(e) => {
                  setConfigs((prev) => ({
                    ...prev,
                    feeCost: Number(e.target.value),
                  }));
                }}
                placeholder="0"
                className="text-[12px] bg-transparent border text-end outline-none  w-[50px] h-10 border-transparent mt-[-8px]" //
              />{" "}
              <div className=" text-[10px] pl-1 mt-[-8px]">sats</div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div
            className={`relative ${
              inputHeight ? `h-[${inputHeight + 1}px]` : ""
            } flex flex-col items-end justify-end`}
          >
            {butterfly.inputs.map((utxo, i) => (
              <div
                className="mb-8 flex w-full relative z-2"
                key={`input-${i}-mobile`}
              >
                <CardMobile utxo={utxo} onRemove={onRemoveInput} />
              </div>
            ))}
            {inputPaths}
          </div>

          <EmptyCardMobile onClick={onAddInput} />
        </div>

        <div className={`w-full flex flex-col`}>
          <div
            className={`relative ${
              totalHeight ? `h-[${totalHeight + 1}px]` : ""
            } flex flex-col w-full`}
          >
            {configs.feeCost > 0 ? outputPaths : null}

            {butterfly.outputs.map((_, i) => (
              <div
                key={`output-${i}--mobile`}
                className="mb-8 flex w-full relative z-2 justify-end"
              >
                <CardOutputMobile index={i} onRemove={onRemoveOutput} />
              </div>
            ))}
          </div>
          <AddOutput onClick={onAddOutput} />
        </div>
      </div>
    </>
  );
};
