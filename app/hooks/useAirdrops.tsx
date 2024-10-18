import { CSVData } from "@/app/components/AirdropRunes"
import { toastOptions } from "@/app/components/Toast"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { recommendedFeesAtom } from "@/app/recoil/recommendedFeesAtom"
import { runesAtom, RunesUtxo, RuneTransaction } from "@/app/recoil/runesAtom"
import { utxoAtom } from "@/app/recoil/utxoAtom"
import { formatNumber } from "@/app/utils/format"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"

export const useAirdrops = ({
  csvData,
  airdropSelected,
}: {
  csvData: CSVData[]
  airdropSelected: RunesUtxo | undefined
}) => {
  const [configs, setConfigs] = useRecoilState(configsAtom)
  const utxos = useRecoilValue(utxoAtom)
  const ordinals = useRecoilValue(ordinalsAtom)
  const runes = useRecoilValue(runesAtom)
  const [errorMsg, setErrorMsg] = useState("")
  const setButterfly = useSetRecoilState(butterflyAtom)
  const recommendedFeeRate = useRecoilValue(recommendedFeesAtom)
  const selectedFeeRate = configs.feeRate || recommendedFeeRate?.hourFee
  const [feeCost, setFeeCost] = useState<number>(500)

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const totalAmountToAirdrop = csvData.reduce(
          (acc, curr) => acc + curr.amount,
          0
        )
        const totalOfBtcValueInRunes = csvData.length * 546

        const utxosWithBtcOnly = []
        let accumulatedBtcValue = 0

        const utxosFound: RuneTransaction[] = []
        let accumulatedBalance = 0

        for (const btcUtxo of utxos || []) {
          const isOrdinals = ordinals?.find((o) =>
            o.inscription.find(
              (i) =>
                i.utxo.txid === btcUtxo.txid && i.utxo.vout === btcUtxo.vout
            )
          )
          if (isOrdinals) continue

          const isRunes = runes?.find((r) =>
            r.utxos.find(
              (u) => u.location === `${btcUtxo.txid}:${btcUtxo.vout}`
            )
          )

          if (isRunes) continue

          if (!btcUtxo.status.confirmed) continue

          if (btcUtxo.value <= 546) {
            continue
          }

          utxosWithBtcOnly.push(btcUtxo)
          accumulatedBtcValue += btcUtxo.value

          if (accumulatedBtcValue >= totalOfBtcValueInRunes + feeCost) {
            break
          }
        }

        if (airdropSelected?.utxos) {
          for (const r of airdropSelected.utxos) {
            const matchedUtxo = utxos?.find(
              (u) => r.location === `${u.txid}:${u.vout}` && u.status.confirmed
            )

            if (matchedUtxo) {
              utxosFound.push(r) // Add the current UTXO to the list
              accumulatedBalance += Number(r.formattedBalance) // Add the UTXO balance to accumulated total

              // If the accumulated balance is equal or greater than the total amount needed, stop
              if (accumulatedBalance >= totalAmountToAirdrop) {
                break
              }
            }
          }
        }

        const mempoolUTXOs = utxos?.filter((mempoolUtxo) =>
          utxosFound?.find(
            (uf) => uf.location === `${mempoolUtxo.txid}:${mempoolUtxo.vout}`
          )
        )

        const inputs = [...(mempoolUTXOs || []), ...utxosWithBtcOnly]

        const allBtcInputsValue = inputs.reduce(
          (acc, curr) => acc + Number(curr.value),
          0
        )

        // const feeCost = 5000
        const change =
          allBtcInputsValue - totalOfBtcValueInRunes - feeCost - 546

        const changeOutput =
          change > 0
            ? [
                {
                  value: change,
                  address: utxosWithBtcOnly[0]?.wallet || "",
                  vout: csvData.length + 2,
                },
              ]
            : []

        let outputs = []

        outputs = csvData.map((data, index) => {
          return {
            vout: index + 1,
            address: data.address,
            value: 546,
            type: "runes",
            rune: airdropSelected,
            runesValue: data.amount,
          }
        })

        const runesChangeValue = accumulatedBalance - totalAmountToAirdrop

        const runesChangeValueOutput =
          runesChangeValue > 0
            ? [
                {
                  vout: csvData.length + 1,
                  address: mempoolUTXOs?.[0]?.wallet || "",
                  value: 546,
                  type: "runes",
                  rune: airdropSelected,
                  runesValue: runesChangeValue,
                },
              ]
            : []

        outputs = [
          {
            type: "OP RETURN",
            value: 0,
            address: "",
            vout: 0,
            rune: airdropSelected,
          },
          ...outputs,
          ...runesChangeValueOutput,
          ...changeOutput,
        ]

        const newButterfly = {
          inputs: [...inputs],
          outputs: [...outputs],
        }
        const address = utxosWithBtcOnly[0]?.wallet || ""

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

    if ((!feeCost || feeCost === 500) && airdropSelected && csvData.length) {
      fetchFees()
    }
  }, [feeCost, utxos, selectedFeeRate, airdropSelected, csvData])

  const handleConfirmAirdrop = () => {
    const totalAmountToAirdrop = csvData.reduce(
      (acc, curr) => acc + curr.amount,
      0
    )
    const totalOfBtcValueInRunes = csvData.length * 546

    const utxosWithBtcOnly = []
    let accumulatedBtcValue = 0

    const utxosFound: RuneTransaction[] = []
    let accumulatedBalance = 0

    for (const btcUtxo of utxos || []) {
      const isOrdinals = ordinals?.find((o) =>
        o.inscription.find(
          (i) => i.utxo.txid === btcUtxo.txid && i.utxo.vout === btcUtxo.vout
        )
      )
      if (isOrdinals) continue

      const isRunes = runes?.find((r) =>
        r.utxos.find((u) => u.location === `${btcUtxo.txid}:${btcUtxo.vout}`)
      )

      if (isRunes) continue

      if (!btcUtxo.status.confirmed) continue

      if (btcUtxo.value <= 546) {
        continue
      }

      utxosWithBtcOnly.push(btcUtxo)
      accumulatedBtcValue += btcUtxo.value

      if (accumulatedBtcValue >= totalOfBtcValueInRunes + feeCost) {
        break
      }
    }

    if (airdropSelected?.utxos) {
      for (const r of airdropSelected.utxos) {
        const matchedUtxo = utxos?.find(
          (u) => r.location === `${u.txid}:${u.vout}` && u.status.confirmed
        )

        if (matchedUtxo) {
          utxosFound.push(r) // Add the current UTXO to the list
          accumulatedBalance += Number(r.formattedBalance) // Add the UTXO balance to accumulated total

          // If the accumulated balance is equal or greater than the total amount needed, stop
          if (accumulatedBalance >= totalAmountToAirdrop) {
            break
          }
        }
      }
    }

    const mempoolUTXOs = utxos?.filter((mempoolUtxo) =>
      utxosFound?.find(
        (uf) => uf.location === `${mempoolUtxo.txid}:${mempoolUtxo.vout}`
      )
    )

    const inputs = [...(mempoolUTXOs || []), ...utxosWithBtcOnly]

    const allBtcInputsValue = inputs.reduce(
      (acc, curr) => acc + Number(curr.value),
      0
    )

    // const feeCost = 5000
    const change = allBtcInputsValue - totalOfBtcValueInRunes - feeCost - 546

    const changeOutput =
      change > 0
        ? [
            {
              value: change,
              address: utxosWithBtcOnly[0]?.wallet || "",
              vout: csvData.length + 2,
            },
          ]
        : []

    let outputs = []

    outputs = csvData.map((data, index) => {
      return {
        vout: index + 1,
        address: data.address,
        value: 546,
        type: "runes",
        rune: airdropSelected,
        runesValue: data.amount,
      }
    })

    const runesChangeValue = accumulatedBalance - totalAmountToAirdrop

    const runesChangeValueOutput =
      runesChangeValue > 0
        ? [
            {
              vout: csvData.length + 1,
              address: mempoolUTXOs?.[0]?.wallet || "",
              value: 546,
              type: "runes",
              rune: airdropSelected,
              runesValue: runesChangeValue,
            },
          ]
        : []

    outputs = [
      {
        type: "OP RETURN",
        value: 0,
        address: mempoolUTXOs?.[0]?.wallet || "",
        vout: 0,
        rune: airdropSelected,
      },
      ...outputs,
      ...runesChangeValueOutput,
      ...changeOutput,
    ]

    const hasNegativeValues = outputs.find((o) => o.value < 0)
    const allBtcOutputValue = outputs.reduce((acc, curr) => acc + curr.value, 0)

    if (hasNegativeValues) {
      setErrorMsg(`Missing ${formatNumber(hasNegativeValues.value)} satoshis`)
      toast.error(
        <div>
          <p>Balance not enough. </p>
          <p>Missing {formatNumber(hasNegativeValues.value)} satoshis</p>
        </div>,
        toastOptions
      )
      return
    }

    const difference = allBtcInputsValue - allBtcOutputValue - feeCost

    if (difference < 0) {
      setErrorMsg(
        `Missing satoshis. Difference is ${formatNumber(difference)} sats`
      )
      toast.error(
        <div>
          <p>Balance difference. </p>
          <p>Missing {formatNumber(difference)} sats</p>
        </div>,
        toastOptions
      )
      return
    }

    setConfigs((prev) => ({
      ...prev,
      feeCost: feeCost,
    }))

    setButterfly({
      inputs: inputs,
      outputs: outputs,
    })
  }

  return { errorMsg, handleConfirmAirdrop, setErrorMsg, feeCost }
}
