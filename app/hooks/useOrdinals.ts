import { Ordinals, ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { filterBitcoinWallets } from "@/app/utils/filters"
import { useEffect, useRef, useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"

export const useOrdinals = () => {
  const [isLoading, setIsLoading] = useState(false)
  const setOrdinals = useSetRecoilState(ordinalsAtom)
  const walletConfigs = useRecoilValue(walletConfigsAtom)

  // Ref to store previously fetched wallets
  const fetchedWalletsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const fetchOrdinals = async (walletsToFetch: string[]) => {
      const allOrdinals: Ordinals[] = []

      for (const wallet of walletsToFetch) {
        try {
          setIsLoading(true)
          const url = `/api/ordinals?account=${wallet}`
          const response = await fetch(url)
          const data: Ordinals = await response.json()

          if (data) {
            allOrdinals.push(data)
          }
        } catch (error) {
          console.error(`Error fetching ordinals for wallet ${wallet}:`, error)
        }
      }

      if (allOrdinals.length) {
        setOrdinals((prevOrdinals) => [...(prevOrdinals || []), ...allOrdinals])
      }

      // Mark the fetched wallets as processed
      for (const wallet of walletsToFetch) {
        fetchedWalletsRef.current.add(wallet)
      }

      setIsLoading(false)
    }

    const walletsFiltered = filterBitcoinWallets(walletConfigs.wallets)
    const walletsToFetch = walletsFiltered.filter(
      (wallet) => !fetchedWalletsRef.current.has(wallet)
    )

    if (walletsToFetch.length > 0 && !isLoading) {
      fetchOrdinals(walletsToFetch)
    }

    if (walletsFiltered.length === 0) {
      setOrdinals(null) // Clear ordinals if no wallets are present
      fetchedWalletsRef.current.clear() // Reset fetched wallets
    }
  }, [walletConfigs.wallets, setOrdinals])

  return { isLoading, ordinals: useRecoilValue(ordinalsAtom) }
}
