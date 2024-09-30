import React from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { useAccounts, useBTCProvider } from "@particle-network/btc-connectkit"

import { useRunes } from "@/app/hooks/useRunes"
import { useInputs } from "@/app/hooks/useInputs"

import { formatNumber } from "@/app/utils/format"
import { useOutputs } from "@/app/hooks/useOutputs"
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom"
import { CardOption, CardOutput, EmptyCard } from "@/app/components/Card"

import { useOrdinals } from "@/app/hooks/useOrdinals"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { configAtom } from "@/app/recoil/confgsAtom"
import { useBitcoinPrice } from "@/app/hooks/useBitcoinPrice"

import { useOrdByWallet } from "@/app/hooks/useOrdByWallet"
import { runesAtom } from "@/app/recoil/runesAtom"
import { Tutorial } from "@/app/components/Tutorial"
import { useRecommendedFees } from "@/app/hooks/useRecommendedFees"
import { usePlatformFee } from "@/app/hooks/usePlatformFee"
import { psbtService } from "@/app/services/psbtService"
import { track } from "@vercel/analytics"
import { NetworkFee } from "@/app/components/NetworkFee"
import { useFeeRate } from "@/app/hooks/useFeeRate"
import { recommendedFeesAtom } from "@/app/recoil/recommendedFeesAtom"
import { useUrlButterfly } from "@/app/hooks/useUrlButterfly"
import { psbtSignedAtom } from "@/app/recoil/psbtAtom"

export const Bowtie = () => {
  useRunes()
  useOrdinals()
  useBitcoinPrice()
  useOrdByWallet()
  useRecommendedFees()
  usePlatformFee()
  useFeeRate()
  useUrlButterfly()
  const utxos = useRecoilValue(utxoAtom)
  const [configs, setConfigs] = useRecoilState(configAtom)
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom)
  const [psbtSigned, setPsbtSigned] = useRecoilState(psbtSignedAtom)
  const { accounts } = useAccounts()

  const account = accounts[0]
  const inputsCount = butterfly.inputs.length
  const outputsCount = butterfly.outputs.length

  const height = 320
  const inputHeight = 320 * inputsCount
  const outputHeight = 320 * outputsCount
  const totalHeight = Math.max(inputHeight, outputHeight)

  const inputPaths = useInputs({
    butterfly,
    totalHeight: inputHeight,
    inputsCount,
    height,
  })

  const outputPaths = useOutputs({
    butterfly,
    totalHeight: outputHeight,
    outputsCount,
    height,
    inputHeight,
    inputsCount,
  })

  const onAddInput = () => {
    setConfigs((prev: any) => ({
      ...prev,
      isInputDeckOpen: !prev.isInputDeckOpen,
    }))
  }

  const runes = useRecoilValue(runesAtom)
  const onAddOutput = () => {
    const runeIndex = runes?.findIndex((r) =>
      butterfly.inputs.find((i) =>
        r.utxos.find((u) => u.location === `${i.txid}:${i.vout}`)
      )
    )

    const rune = runes?.[runeIndex!]

    if (rune) {
      setConfigs((prev) => ({
        ...prev,
        isOutputDeckOpen: !prev.isOutputDeckOpen,
      }))
      return
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
    }))
  }

  const onRemoveOutput = (index: number) => {
    setButterfly((prev) => ({
      ...prev,
      outputs: prev.outputs.filter((_, key) => key !== index),
    }))
  }

  const onRemoveInput = (utxo: MempoolUTXO) => {
    const isThisRune = runes?.find((r) =>
      r.utxos.find((u) => u.location === `${utxo.txid}:${utxo.vout}`)
    )
    const runesInputLength = butterfly.inputs.filter((i) =>
      runes?.find((r) =>
        r.utxos.find((u) => u.location === `${i.txid}:${i.vout}`)
      )
    ).length

    setButterfly((prev) => ({
      ...prev,
      inputs: prev.inputs.filter((input) => input !== utxo),
      outputs:
        isThisRune && runesInputLength <= 1
          ? prev.outputs.filter(
              (o) => !(o.type === "runes" || o.type === "OP RETURN")
            )
          : prev.outputs,
    }))
  }

  const inputTotalBtc = butterfly.inputs.reduce(
    (acc, cur) => acc + cur.value / 100000000,
    0
  )

  const bestUtxo = JSON.parse(JSON.stringify(utxos))?.sort(
    (a: MempoolUTXO, b: MempoolUTXO) => b.value - a.value
  )[0]

  const recommendedFees = useRecoilValue(recommendedFeesAtom)

  const getSelectedFeeRate = (feeType: string) => {
    if (!recommendedFees) return 0
    switch (feeType) {
      case "slow":
        return recommendedFees.minimumFee + 0.25
      case "mid":
        return (
          (recommendedFees.minimumFee + 0.25 + recommendedFees.fastestFee) / 2
        )
      case "fast":
        return recommendedFees.fastestFee
      default:
        return recommendedFees?.hourFee
    }
  }

  const selectNewUtxoInput = (utxo: MempoolUTXO) => {
    const selectedFeeRate = getSelectedFeeRate(configs.feeType)

    setConfigs((prev) => ({
      ...prev,
      isInputDeckOpen: false,
      feeCost: prev.feeCost ? prev.feeCost : 500,
    }))

    const outputSum = butterfly.outputs.reduce((acc, cur) => acc + cur.value, 0)

    const inputSum =
      butterfly.inputs.reduce((acc, cur) => acc + cur.value, 0) + utxo.value

    setButterfly((prev: any) => ({
      ...prev,
      inputs: [...prev.inputs, utxo],
    }))

    if (inputSum - outputSum > 0) {
      let outputsUpdated = [...butterfly.outputs]

      outputsUpdated[butterfly.outputs.length - 1] = {
        ...outputsUpdated[butterfly.outputs.length - 1],
        value:
          inputSum -
          configs.feeCost -
          outputSum -
          configs.feeCost +
          (inputSum - utxo.value),
      }

      setButterfly((prev) => ({
        ...prev,
        outputs: [...outputsUpdated],
      }))
    }
  }

  const inputValues = butterfly.inputs.reduce((acc, cur) => acc + cur.value, 0)
  const outputValues =
    butterfly.outputs.reduce((acc, cur) => acc + cur.value, 0) + configs.feeCost

  const difference = inputValues - outputValues

  const rune = runes?.find((r) =>
    r.utxos?.find((u) =>
      butterfly.inputs.find((i) => u.location === `${i.txid}:${i.vout}`)
    )
  )

  const runesInputSum =
    rune?.utxos.reduce((acc, cur) => {
      const utxoIsInInput = butterfly.inputs.find(
        (i) => cur.location === `${i.txid}:${i.vout}`
      )
      if (utxoIsInInput) {
        const utxoFormattedBalance = cur.formattedBalance
        return acc + Number(utxoFormattedBalance)
      }

      return acc
    }, 0) || 0

  const runesOutputSum = butterfly.outputs.reduce((acc, cur) => {
    return (cur?.runesValue || 0) + acc
  }, 0)

  const runesButterflyBalance = runesInputSum - runesOutputSum

  const isConfirmDisabled =
    difference !== 0 ||
    outputValues - configs.feeCost < 0 ||
    runesButterflyBalance !== 0

  const { provider } = useBTCProvider()

  const onSignWithWallet = async (e: any) => {
    e.preventDefault()
    try {
      if (psbtSigned.psbtHexSigned) {
        const alreadyPsbtHexSigned = psbtSigned.psbtHexSigned
        const psbtHexSigned = await provider.signPsbt(alreadyPsbtHexSigned)
        console.log("✌️psbtHexSigned --->", psbtHexSigned)

        const inputsSigned = butterfly.inputs.filter(
          (i) => i.wallet === account
        )

        setPsbtSigned({
          psbtHexSigned,
          inputsSigned: [...psbtSigned.inputsSigned, ...inputsSigned],
        })

        const txidRes = await psbtService.broadcastUserPSBT(psbtHexSigned)
        console.log("✌️txidRes --->", txidRes)
        if (txidRes) {
          track("psbt-sign", { wallet: account })
          setConfigs((prev) => ({
            ...prev,
            txid: txidRes,
            isOpenModalTxId: true,
            isConfirmedModalTxId: true,
          }))
        } else {
          track("error-psbt-sign", { wallet: account })
        }

        return
      }

      const res = await fetch("/api/psbt", {
        method: "POST",
        body: JSON.stringify({ butterfly, account }),
      })
      const result = await res.json()

      if (result?.psbtHex) {
        track("psbt-created", { wallet: account })

        const psbtHexSigned = await provider.signPsbt(result.psbtHex)

        const txidRes = await psbtService.broadcastUserPSBT(psbtHexSigned)
        if (txidRes) {
          track("psbt-sign", { wallet: account })
          setConfigs((prev) => ({
            ...prev,
            txid: txidRes,
            isOpenModalTxId: true,
            isConfirmedModalTxId: true,
          }))
        } else {
          track("error-psbt-sign", { wallet: account })
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const hasSomeSigned = Boolean(
    psbtSigned.inputsSigned.find((i) =>
      butterfly.inputs.find(
        (input) => input.txid === i.txid && input.vout === i.vout
      )
    )
  )

  return (
    <>
      <div className="mt-16 mb-2 text-[12px] justify-end relative hidden sm:flex">
        <div className="h-60 min-w-52 max-w-52 p-3 pt-8 rounded-xl flex flex-col gap-3 items-center justify-center  font-medium border bg-zinc-950 text-center text-zinc-300 relative">
          <div className="absolute -top-6 left-0 opacity-50">Inputs</div>
          <div className=" text-[16px] flex gap-2 -mr-4 items-center">
            <span className="font-bold">Tutorial</span> <Tutorial />
          </div>
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
                {/* <p>
                  Type:{" "}
                  {!isSplit &&
                    (outputsCount > 1 && isTransfer
                      ? "Multi Transfer"
                      : "Transfer")}
                  {!isTransfer &&
                    (outputsCount > 1 && isSplit
                      ? "Split UTXOs"
                      : "Self Transfer")}
                </p> */}
                <p>
                  Cost: {formatNumber(inputTotalBtc, 0, 8, false, false)} BTC
                </p>
                {rune?.rune ? (
                  <p>
                    Runes: {formatNumber(runesInputSum, 0, 8, false, true)}{" "}
                    {rune.symbol}
                  </p>
                ) : null}
                {
                  <button
                    className="font-bold mt-2 w-full items-center justify-center text-center hover:opacity-80"
                    onClick={onSignWithWallet}
                  >
                    Sign with wallet
                  </button>
                }
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
          <NetworkFee />
        </div>
      </div>

      <div className="hidden sm:flex pb-[100px]">
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
                  onSignClick={onSignWithWallet}
                />
              </div>
            ))}
            {inputPaths}
          </div>

          {!hasSomeSigned && <EmptyCard onClick={onAddInput} />}
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
          {!hasSomeSigned && (
            <EmptyCard onClick={onAddOutput} className="self-end" />
          )}
        </div>
      </div>
    </>
  )
}
