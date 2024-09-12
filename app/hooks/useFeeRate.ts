import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { configAtom } from "@/app/recoil/confgsAtom"
import { formatNumber } from "@/app/utils/format"
import { useAccounts } from "@particle-network/btc-connectkit"
import { useEffect, useRef, useState, useCallback } from "react"
import { useRecoilState, useRecoilValue } from "recoil"

export const useFeeRate = () => {
  const butterfly = useRecoilValue(butterflyAtom)
  const [configs, setConfigs] = useRecoilState(configAtom)
  const { accounts } = useAccounts()
  const account = accounts?.[0]
  const requestCounter = useRef(0)
  const lastRequestTime = useRef(0)
  const throttleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchEstimatedFee = useCallback(async () => {
    if (!butterfly.inputs?.length || !butterfly.outputs?.length) return

    const currentRequest = ++requestCounter.current
    console.log("✌️currentRequest --->", currentRequest)

    const inputsWithZeroValues = butterfly.inputs.filter(
      (input) => input.value <= 0
    )
    const outputsWithZeroValues = butterfly.outputs.filter(
      (output) => output.value <= 0
    )
    const noZerosValue = [...inputsWithZeroValues, ...outputsWithZeroValues]
    console.log("✌️noZerosValue --->", noZerosValue)

    if (noZerosValue.length > 0) return

    try {
      const res = await fetch("/api/estimateFeeRate", {
        next: { revalidate: 3600 },
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          butterfly: butterfly,
          address: account,
          feeCost: configs?.feeCost,
        }),
      })

      console.log("✌️res --->", res)

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
      console.log("✌️timeSinceLastRequest --->", timeSinceLastRequest)
      // If enough time has passed, make the request immediately
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
