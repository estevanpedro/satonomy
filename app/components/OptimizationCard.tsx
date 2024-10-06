"use client"
import { btcPriceAtom } from "@/app/recoil/btcPriceAtom"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { DEFAULT_PSBT_SIGNED, psbtSignedAtom } from "@/app/recoil/psbtAtom"
import { recommendedFeesAtom } from "@/app/recoil/recommendedFeesAtom"
import { RunesUtxo } from "@/app/recoil/runesAtom"
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom"

import { formatNumber } from "@/app/utils/format"
import { useAccounts } from "@particle-network/btc-connectkit"
import { track } from "@vercel/analytics"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"

export const OptimizationCard = ({
  rune,
  onClose,
  index,
  onOptimizeSelection,
}: {
  rune: RunesUtxo
  onClose: () => void
  index: number
  onOptimizeSelection?: () => void
}) => {
  const [showSats, setShowSats] = useState<number | null>(null) // Track which card is hovered
  const setPsbtSigned = useSetRecoilState(psbtSignedAtom)
  const setButterfly = useSetRecoilState(butterflyAtom)
  const [configs, setConfigs] = useRecoilState(configsAtom)
  const recommendedFeeRate = useRecoilValue(recommendedFeesAtom)
  const utxos = useRecoilValue(utxoAtom)
  const btcUsdPrice = useRecoilValue(btcPriceAtom)
  // const { accounts } = useAccounts()
  // const address = accounts[0]
  const length = rune?.utxos.length
  const [feeCost, setFeeCost] = useState<number>(500)
  const { referrer } = useParams()

  const selectedFeeRate = configs.feeRate || recommendedFeeRate?.hourFee

  const profitMocked = length * 546 - feeCost - 546

  const [profit, setProfit] = useState<number>(profitMocked)
  const profitInSats = profit
  const profitInUsd = (profit / 100000000) * btcUsdPrice

  useEffect(() => {
    if (!rune) return

    const utxosSorted = (
      JSON.parse(JSON.stringify(utxos)) as MempoolUTXO[]
    )?.sort((a, b) => a.value - b.value)

    let allBtcInputsValue = rune.utxos.reduce(
      (acc, curr) =>
        acc +
        Number(
          utxos?.find((u) => curr.location === `${u.txid}:${u.vout}`)?.value
        ),
      0
    )

    const inputUtxos =
      utxos?.filter((utxo) =>
        rune.utxos.find((r) => r.location === `${utxo.txid}:${utxo.vout}`)
      ) || []

    const address = inputUtxos[0]?.wallet

    const charge = allBtcInputsValue - 546 - feeCost

    const usersProfit = Math.floor(charge * 0.8)
    const platformFee = Math.floor(charge - usersProfit)

    setProfit(usersProfit)

    const fetchFees = async () => {
      try {
        if (!inputUtxos) {
          console.log("No inputUtxos found")
          return
        }

        const referrerFee = !referrer
          ? 0
          : Math.ceil(usersProfit - usersProfit * 0.9)

        const referrerOutput = referrer
          ? [
              {
                value: referrerFee,
                address: referrer as string,
                vout: 5,
                type: "referrer",
              },
            ]
          : []

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
        ]

        const newButterfly = {
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
            ...chargeOutput,
          ],
        }

        const body = JSON.stringify({
          newButterfly,
          address,
          feeRate: selectedFeeRate,
        })

        const res = await fetch(`/api/estimateFees`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        })
        const result = await res.json()

        if (!result?.error) {
          setFeeCost(result)
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (!feeCost || feeCost === 500) fetchFees()
  }, [feeCost, rune, utxos, selectedFeeRate])

  const onSelect = (rune: RunesUtxo) => {
    onOptimizeSelection?.()
    onClose()
    setPsbtSigned(DEFAULT_PSBT_SIGNED)

    setConfigs((prev) => ({
      ...prev,
      feeCost: feeCost,
      isInputDeckOpen: false,
      isInputFullDeckOpen: false,
      isOutputDeckOpen: false,
    }))

    let allBtcInputsValue = rune.utxos.reduce(
      (acc, curr) =>
        acc +
        Number(
          utxos?.find((u) => curr.location === `${u.txid}:${u.vout}`)?.value
        ),
      0
    )

    const inputUtxos =
      utxos?.filter((utxo) =>
        rune.utxos.find((r) => r.location === `${utxo.txid}:${utxo.vout}`)
      ) || []

    const address = `${inputUtxos[0]?.wallet}`

    const charge = allBtcInputsValue - 546 - feeCost
    const usersProfit = charge * 0.8
    const finalUserProfit = Math.floor(usersProfit)
    const satonomyFees = charge - finalUserProfit // 20%
    const platformFee = referrer
      ? Math.floor(satonomyFees * 0.5)
      : Math.floor(satonomyFees * 1)
    const referrerFee = referrer ? Math.floor(satonomyFees * 0.5) : 0
    const difference = Math.floor(satonomyFees - platformFee - referrerFee)

    const referrerOutput = referrer
      ? [
          {
            value: referrerFee,
            address: referrer as string,
            vout: 5,
            type: "referrer",
          },
        ]
      : []

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
    ]

    const newButterfly = {
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
        ...chargeOutput,
      ],
    }

    setButterfly(newButterfly)

    track("optimization-clicked", {
      wallet: address,
      inputs: newButterfly.inputs.length,
    })
  }

  if (profitInSats < 0) return null

  return (
    <button
      className={`flex justify-start items-start w-full h-full border p-2  ${
        !Boolean(profitInSats) || !Boolean(profitInUsd)
          ? "opacity-50 cursor-progress"
          : "opacity-100 hover:border-gray-50 cursor-pointer"
      }`}
      onClick={() => {
        if (!Boolean(profitInSats) || !Boolean(profitInUsd)) {
        } else {
          onSelect(rune)
        }
      }}
      onMouseEnter={() => setShowSats(index)} // Show sats on hover
      onMouseLeave={() => setShowSats(null)} // Hide sats when not hovered
    >
      <div className="justify-center items-center flex text-center text-[52px] mr-4">
        <div className="min-w-[38px] h-[38px] rounded bg-gray-800 border-[1px] border-gray-600 flex justify-center items-center text-[20px]">
          {rune?.symbol}
        </div>
      </div>

      <div className="flex flex-col gap-[4px] justify-center items-start">
        <span className="text-[12px] font-bold">{rune?.spacedRune}</span>
        <span className="text-[10px]">{rune?.runeid}</span>
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
        <span className="text-[10px] font-bold ">{length} merges</span>
      </div>
    </button>
  )
}
