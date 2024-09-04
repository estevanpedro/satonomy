import React from "react";
import Image from "next/image";
import { useRecoilState, useRecoilValue } from "recoil";
import { useAccounts } from "@particle-network/btc-connectkit";

import { useRunes } from "@/app/hooks/useRunes";
import { useInputs } from "@/app/hooks/useInputs";

import { formatNumber } from "@/app/utils/format";
import { useOutputs } from "@/app/hooks/useOutputs";
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom";
import { CardOption, CardOutput, EmptyCard } from "@/app/components/Card";

import { useOrdinals } from "@/app/hooks/useOrdinals";
import { butterflyAtom } from "@/app/recoil/butterflyAtom";
import { configAtom } from "@/app/recoil/confgsAtom";
import { useBitcoinPrice } from "@/app/hooks/useBitcoinPrice";
import { Tooltip } from "react-tooltip";
import { useOrdByWallet } from "@/app/hooks/useOrdByWallet";
import { runesAtom } from "@/app/recoil/runesAtom";

export const Bowtie = () => {
  useRunes();
  useOrdinals();
  useBitcoinPrice();
  useOrdByWallet();

  const utxos = useRecoilValue(utxoAtom);
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

  const runes = useRecoilValue(runesAtom);
  const onAddOutput = () => {
    const runeIndex = runes?.findIndex((r) =>
      butterfly.inputs.find((i) =>
        r.utxos.find((u) => u.location === `${i.txid}:${i.vout}`)
      )
    );

    const rune = runes?.[runeIndex!];

    if (rune) {
      setConfigs((prev) => ({
        ...prev,
        isOutputDeckOpen: !prev.isOutputDeckOpen,
      }));
      return;
    }

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
    const hasOpReturn = butterfly.outputs.find((o) => o.type === "OP RETURN");
    const isThisRune = runes?.find((r) =>
      r.utxos.find((u) => u.location === `${utxo.txid}:${utxo.vout}`)
    );
    const runesInputLength = butterfly.inputs.filter((i) =>
      runes?.find((r) =>
        r.utxos.find((u) => u.location === `${i.txid}:${i.vout}`)
      )
    ).length;

    setButterfly((prev) => ({
      ...prev,
      inputs: prev.inputs.filter((input) => input !== utxo),
      outputs:
        isThisRune && runesInputLength <= 1
          ? prev.outputs.filter(
              (o) => !(o.type === "runes" || o.type === "OP RETURN")
            )
          : prev.outputs,
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

  const usersOutputs = butterfly.outputs.filter((o) => o.address === account);
  const isTransfer = usersOutputs.length < butterfly.outputs.length;
  const isSplit = usersOutputs.length === butterfly.outputs.length;

  // const confirmTooltip = utxos?.length
  //   ? isConfirmDisabled
  //     ? difference > 0 || outputValues < 0
  //       ? `Adjust the fee or outputs. UTXO balance is ${formatNumber(
  //           inputValues - outputValues,
  //           0,
  //           0,
  //           false,
  //           false
  //         )} sats; it should be 0.`
  //       : `Add more inputs ${
  //           outputValues ? "or adjust the output" : ""
  //         }. UTXO balance is ${formatNumber(
  //           inputValues - outputValues,
  //           0,
  //           0,
  //           false,
  //           false
  //         )} sats; it should be 0.`
  //     : "Create PSBT and sign"
  //   : "No UTXOs";

  const rune = runes?.find((r) =>
    r.utxos.find((u) =>
      butterfly.inputs.find((i) => u.location === `${i.txid}:${i.vout}`)
    )
  );

  const runesInputSum =
    rune?.utxos.reduce((acc, cur) => {
      const utxoIsInInput = butterfly.inputs.find(
        (i) => i.txid === cur.location.split(":")[0]
      );
      if (utxoIsInInput) {
        const utxoFormattedBalance = cur.formattedBalance;
        return acc + Number(utxoFormattedBalance);
      }

      return acc;
    }, 0) || 0;

  const runesOutputSum = butterfly.outputs.reduce((acc, cur) => {
    return (cur?.runesValue || 0) + acc;
  }, 0);

  const runesButterflyBalance = runesInputSum - runesOutputSum;

  const isConfirmDisabled =
    difference !== 0 ||
    outputValues - configs.feeCost < 0 ||
    runesButterflyBalance !== 0;

  return (
    <>
      <div className="mt-16 mb-2 text-[12px] font-bolds justify-end relative hidden sm:flex">
        <div className="h-60 min-w-52 max-w-52 p-3 pt-8 rounded-xl flex flex-col gap-3 items-center justify-center  font-medium border bg-zinc-950 text-center text-zinc-300 relative">
          <div className="absolute -top-6 left-0 opacity-50">Inputs</div>
          <p className="font-bold text-[16px]">Tutorial</p>
          <div>
            {!account && (
              <span>
                1. Connect your bitcoin wallet to start building a transaction.{" "}
              </span>
            )}
            {inputsCount === 0 && !configs.isInputDeckOpen && account && (
              <span>
                2. Add inputs to start building your transaction{" "}
                <span onClick={onAddInput} className="cursor-pointer">
                  [+]
                </span>
              </span>
            )}
            {inputsCount === 0 && configs.isInputDeckOpen && account && (
              <span>
                3. Choose the UTXO you wish to split or transfer. The most
                valuable one is{" "}
                <span
                  onClick={() => selectNewUtxoInput(bestUtxo)}
                  className="cursor-pointer mb-[-4px] font-bold text-white opacity-100"
                >
                  {formatNumber(bestUtxo?.value)} sats [+]
                </span>
              </span>
            )}
            {inputsCount > 0 && outputsCount === 0 && (
              <span>
                4. Add a new output to your transaction{" "}
                <span
                  onClick={onAddOutput}
                  className="cursor-pointer font-bold"
                >
                  [+]
                </span>
              </span>
            )}
            {inputsCount > 0 && outputsCount > 0 && !isConfirmDisabled && (
              <div className="gap-1 flex flex-col items-start text-start mb-[-24px]">
                <p className="mb-2">
                  6. PSBT is <strong>ready</strong> to be signed.
                </p>
                <p>Inputs: {inputsCount}</p>
                <p>Outputs: {outputsCount}</p>
                <p>
                  Type:{" "}
                  {!isSplit &&
                    (outputsCount > 1 && isTransfer
                      ? "Multi Transfer"
                      : "Transfer")}
                  {!isTransfer &&
                    (outputsCount > 1 && isSplit
                      ? "Split UTXOs"
                      : "Self Transfer")}
                </p>
                <p>
                  Cost: {formatNumber(inputTotalBtc, 0, 8, false, false)} BTC
                </p>
                {rune?.rune ? (
                  <p>
                    Runes: {formatNumber(runesInputSum, 0, 8, false, true)}{" "}
                    {rune.symbol}
                  </p>
                ) : null}
              </div>
            )}
            {inputsCount !== 0 &&
              isConfirmDisabled &&
              outputsCount !== 0 &&
              inputValues - outputValues !== 0 && (
                <div>
                  {utxos?.length ? (
                    isConfirmDisabled ? (
                      difference > 0 || outputValues < 0 ? (
                        <p>
                          Adjust the fee or outputs. UTXO balance is{" "}
                          <span
                            className={`${
                              inputValues - outputValues > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatNumber(
                              inputValues - outputValues,
                              0,
                              0,
                              false,
                              false
                            )}{" "}
                            sats
                          </span>
                          ; it should be 0.
                        </p>
                      ) : (
                        <p>
                          Add more inputs{" "}
                          {outputValues ? "or adjust the output" : ""}. UTXO
                          balance is{" "}
                          <span
                            className={`${
                              inputValues - outputValues > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatNumber(
                              inputValues - outputValues,
                              0,
                              0,
                              false,
                              false
                            )}{" "}
                            sats
                          </span>
                          ; it should be 0.
                        </p>
                      )
                    ) : (
                      "Create PSBT and sign"
                    )
                  ) : (
                    "No UTXOs"
                  )}
                </div>
              )}
            <br />
            {runesButterflyBalance !== 0 && (
              <>
                <p className="mt-2">
                  {runesButterflyBalance > 0 ? (
                    <span>Add outputs for runes. </span>
                  ) : (
                    <span>Add more inputs or update outputs. </span>
                  )}
                  Balance of {rune?.spacedRune} is{" "}
                  <span
                    className={`${
                      runesButterflyBalance > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatNumber(runesButterflyBalance)} {rune?.symbol}
                  </span>{" "}
                </p>
              </>
            )}

            <br />
            <br />
          </div>
        </div>

        <div className="h-60 w-full flex mb-2 text-[12px] justify-end relative">
          <div className="absolute -top-6 right-0 opacity-50">Outputs</div>
          <div
            className="py-6 min-w-52  rounded-xl flex flex-col gap-3 items-center justify-center border bg-zinc-950 "
            data-tooltip-id={"fee-tool"}
            data-tooltip-content={"Type the total fee cost in sats"}
            data-tooltip-place="right"
          >
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
                  setConfigs((prev) => ({
                    ...prev,
                    feeCost: Number(e.target.value),
                  }));
                }}
                placeholder="0"
                className="bg-transparent text-[20px] border text-center outline-none border-transparent w-20 h-12 ml-[16px]"
              />{" "}
              <div className="mt-[-15px] text-[12px]">sats</div>
            </div>
            <Tooltip
              id={"fee-tool"}
              className="max-w-[150px] bg-gray-600"
              style={{ backgroundColor: "#292929", color: "white" }}
            />
            <div>Network Fee</div>
          </div>
        </div>
      </div>

      <div className=" hidden sm:flex">
        <div className="w-full">
          <div
            className={`relative ${
              inputHeight ? `h-[${inputHeight + 1}px]` : ""
            } flex flex-col items-end justify-end`}
          >
            {butterfly.inputs.map((utxo, i) => (
              <div
                className="mb-8 h-80 min-h-[320px] flex w-full relative z-0"
                key={`input-${i}`}
              >
                <CardOption
                  utxo={utxo}
                  onRemove={onRemoveInput}
                  isSelected={true}
                />
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
