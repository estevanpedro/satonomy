import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { formatNumber } from "@/app/utils/format"
import { useAccounts } from "@particle-network/btc-connectkit"
import { useEffect, useRef, useState, useCallback } from "react"
import { useRecoilState, useRecoilValue } from "recoil"

export const useFeeRate = () => {
  const butterfly = useRecoilValue(butterflyAtom)
  const [configs, setConfigs] = useRecoilState(configsAtom)
  const { accounts } = useAccounts()
  const account = accounts?.[0]
  const requestCounter = useRef(0)
  const lastRequestTime = useRef(0)
  const throttleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchEstimatedFee = useCallback(async () => {
    if (!butterfly.inputs?.length || !butterfly.outputs?.length) return
    const editedButterfly = {
      ...butterfly,
      outputs: butterfly.outputs.map((output) => ({
        ...output,
        value: output.value <= 0 ? 1 : output.value,
      })),
    }

    const currentRequest = ++requestCounter.current

    const inputsWithZeroValues = editedButterfly.inputs.filter(
      (input) => input.value <= 0
    )
    const outputsWithZeroValues = editedButterfly.outputs.filter(
      (output) => output.value <= 0
    )
    const noZerosValue = [...inputsWithZeroValues, ...outputsWithZeroValues]

    if (noZerosValue.length > 0) return

    const feePayer =
      butterfly.inputs.find((input) => input.wallet && input.value > 10000) ||
      butterfly.inputs.find((input) => input.wallet && input.value > 546) ||
      butterfly.inputs.find((input) => input.wallet)

    try {
      const res = await fetch("/api/estimateFeeRate", {
        next: { revalidate: 3600 },
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          butterfly: editedButterfly,
          address: feePayer?.wallet || account,
          feeCost: configs?.feeCost,
        }),
      })

      if (currentRequest === requestCounter.current) {
        // Only process the latest request
        const result = await res.json()
        if (result) {
          const previousFeeRate = configs?.feeRate
          setConfigs((prev) => ({
            ...prev,
            feeRateEstimated: result,
            feeType:
              formatNumber(previousFeeRate, 0, 2, false, false) ===
              formatNumber(result, 0, 2, false, false)
                ? prev.feeType
                : "estimated",
          }))
        }
      }
    } catch (error) {
      console.error(error)
      if (currentRequest === requestCounter.current) {
        console.error(error)
      }
    }
  }, [butterfly, account, configs?.feeCost, setConfigs])

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime.current

    if (timeSinceLastRequest >= 300) {
      lastRequestTime.current = now
      fetchEstimatedFee()
    } else {
      // Clear previous timeout and set a new one for the latest change
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current)
      }
      throttleTimeout.current = setTimeout(() => {
        lastRequestTime.current = Date.now()
        fetchEstimatedFee()
      }, 300 - timeSinceLastRequest)
    }
  }, [butterfly, configs?.feeRate, account, fetchEstimatedFee])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current)
      }
    }
  }, [])
}
