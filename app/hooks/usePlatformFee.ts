import { useEffect, useRef } from "react"
import { useRecoilState, useRecoilValue } from "recoil"

import { runesAtom } from "@/app/recoil/runesAtom"
import { configAtom } from "@/app/recoil/confgsAtom"
import { utxoAtom } from "@/app/recoil/utxoAtom" // BTC UTXOs
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { useParams } from "next/navigation" // Import the useParams hook
import { track } from "@vercel/analytics"
import { useAccounts } from "@particle-network/btc-connectkit"

export const usePlatformFee = () => {
  const { accounts } = useAccounts()
  const account = accounts?.[0]
  const { referrer } = useParams() // Get the referrer from the URL
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom)
  const runes = useRecoilValue(runesAtom) // Rune UTXOs
  const btcUtxos = useRecoilValue(utxoAtom) // BTC UTXOs
  const config = useRecoilValue(configAtom) // Config containing feeCost
  const prevFeeCost = useRef<number | null>(config.feeCost)

  useEffect(() => {
    const updatePlatformFee = () => {
      if (!butterfly || !butterfly.inputs || butterfly.inputs.length === 0)
        return
      if (!runes || !btcUtxos || !config || !config.feeCost) return // Validate required data

      const feeCost = config.feeCost

      // Step 1: Count Rune UTXOs in butterfly inputs and calculate total BTC value from Rune UTXOs
      let runeUtxoCount = 0
      let totalRuneBtcValue = 0 // This will hold the BTC value of the Rune UTXOs

      butterfly.inputs.forEach((input) => {
        // For each input in the butterfly, find the corresponding Rune UTXO and its associated BTC value
        runes.forEach((rune) => {
          rune.utxos.forEach((utxo) => {
            if (utxo.location === `${input.txid}:${input.vout}`) {
              runeUtxoCount++ // Increment Rune UTXO count

              // Find the BTC value for this UTXO in the btcUtxos array
              const btcUtxo = btcUtxos.find(
                (btc) => btc.txid === input.txid && btc.vout === input.vout
              )
              if (btcUtxo) {
                totalRuneBtcValue += btcUtxo.value // Add the BTC value of the Rune UTXO
              }
            }
          })
        })
      })

      // Step 2: Calculate the user's profit based on total Rune UTXO BTC value
      const outputsValuesOfRunesUtxos = butterfly.outputs.reduce(
        (acc, output) => {
          if (output.type === "runes") {
            return acc + output.value
          }
          return acc
        },
        0
      )

      const firstProfit =
        totalRuneBtcValue - feeCost - outputsValuesOfRunesUtxos

      const charge = firstProfit
      const usersProfit = charge * 0.8
      const finalUserProfit = Math.floor(usersProfit)
      const satonomyFees = charge - finalUserProfit
      const platformFee = referrer
        ? Math.floor(satonomyFees * 0.5)
        : Math.floor(satonomyFees * 1)
      const referrerFee = referrer ? Math.floor(satonomyFees * 0.5) : 0
      const difference = Math.floor(satonomyFees - platformFee - referrerFee)

      let userProfitValue = finalUserProfit + difference

      if (runeUtxoCount >= 5 && userProfitValue > 0) {
        const updatedOutputs = butterfly.outputs.map((output) => {
          if (output.type === "platformFee") {
            // Update the existing platform fee in place
            return {
              ...output,
              value: platformFee,
            }
          }
          if (output.type === "referrer") {
            return {
              ...output,
              value: referrerFee,
            }
          }
          return output
        })

        const platformFeeExists = butterfly.outputs.some(
          (output) => output.type === "platformFee"
        )

        // If platformFee doesn't exist, add it to the outputs
        if (!platformFeeExists) {
          updatedOutputs.push({
            value: platformFee,
            address:
              "bc1p88kkz603d5haumns83pd25x5a5ctkp0wzpvkla82ltdvcnezqvzqgwfc93", // Platform fee address
            vout: butterfly.outputs.length + 1,
            type: "platformFee",
          })
        }

        const referrerExists = butterfly.outputs.some(
          (output) => output.type === "referrer"
        )

        if (!referrerExists && referrer) {
          updatedOutputs.push({
            value: referrerFee,
            address: referrer as string,
            vout: butterfly.outputs.length + 2,
            type: "referrer",
          })
        }

        let updatedButterfly = {
          ...butterfly,
          outputs: updatedOutputs,
        }

        if (prevFeeCost.current !== config.feeCost) {
          const inputValues = updatedButterfly.inputs.reduce(
            (acc, cur) => acc + cur.value,
            0
          )
          const outputValues =
            updatedButterfly.outputs.reduce((acc, cur) => acc + cur.value, 0) +
            feeCost

          if (inputValues - outputValues !== 0) {
            const butterflyOutput = updatedButterfly.outputs
              .filter(
                (output) =>
                  output.type !== "OP RETURN" &&
                  output.type !== "runes" &&
                  output.type !== "platformFee"
              )
              ?.sort((a, b) => a.value - b.value)

            const usersOutputLength = butterflyOutput.filter(
              (o) => o.address === account
            )?.length

            const usersOutput = butterflyOutput.find(
              (o) => o.address === account
            )

            if (usersOutput) {
              const outputIndex = butterfly.outputs.indexOf(usersOutput)
              updatedButterfly.outputs[outputIndex] = {
                ...updatedButterfly.outputs[outputIndex],
                value: userProfitValue,
              }
            }
          }

          prevFeeCost.current = config.feeCost
        }

        setButterfly(updatedButterfly) // Update state with the updated or new platform fee

        track(
          "referrer-fee",
          { referrer: referrer as string },
          { flags: ["referrer-fee"] }
        )
      } else {
        // If the platform fee should not exist (profit <= 0 or <= 5 Rune UTXOs)
        const updatedOutputs = butterfly.outputs.filter(
          (output) =>
            output.type !== "platformFee" && output.type !== "referrer"
        )

        let updatedButterfly = {
          ...butterfly,
          outputs: updatedOutputs,
        }

        if (prevFeeCost.current !== config.feeCost) {
          const inputValues = updatedButterfly.inputs.reduce(
            (acc, cur) => acc + cur.value,
            0
          )
          const outputValues =
            updatedButterfly.outputs.reduce((acc, cur) => acc + cur.value, 0) +
            feeCost

          if (inputValues - outputValues != 0) {
            const butterflyOutput = updatedButterfly.outputs
              .filter(
                (output) =>
                  output.type !== "OP RETURN" &&
                  output.type !== "runes" &&
                  output.type !== "platformFee"
              )
              ?.sort((a, b) => b.value - a.value)

            const usersOutput = butterflyOutput.find(
              (o) => o.address === account
            )

            if (usersOutput) {
              const outputIndex = butterfly.outputs.indexOf(usersOutput)

              if (
                runeUtxoCount >= 5 &&
                userProfitValue > 0 &&
                butterflyOutput.length === 1 &&
                inputValues - outputValues > 0
              ) {
                userProfitValue = userProfitValue + (inputValues - outputValues)
              }

              if (runeUtxoCount <= 5 || userProfitValue <= 0) {
                userProfitValue =
                  (updatedButterfly.outputs[outputIndex]?.value || 0) +
                  (prevFeeCost.current || 0) -
                  feeCost
              }

              if (userProfitValue > 0) {
                updatedButterfly.outputs[outputIndex] = {
                  ...updatedButterfly.outputs[outputIndex],
                  value: userProfitValue,
                }
              }
            }
          }

          prevFeeCost.current = config.feeCost
        }

        setButterfly(updatedButterfly) // Update butterfly without platform fee
      }
    }

    updatePlatformFee()
  }, [
    butterfly.inputs,
    runes,
    btcUtxos,
    config.feeCost,
    setButterfly,
    referrer,
  ])

  return butterfly
}
