import { Ordinals, ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { filterBitcoinWallets } from "@/app/utils/filters"
import { useEffect, useRef, useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"

export const useOrdinals = () => {
  const [isLoading, setIsLoading] = useState(false)
  const setOrdinals = useSetRecoilState(ordinalsAtom)
  const walletConfigs = useRecoilValue(walletConfigsAtom)

  // Store fetched wallets to prevent fetching them again
  const fetchedWalletsRef = useRef<Set<string>>(new Set())
  // Store wallets currently being fetched to avoid double fetches
  const fetchingWalletsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const fetchOrdinals = async (walletsToFetch: string[]) => {
      if (walletsToFetch.length === 0) return

      setIsLoading(true)
      const newOrdinals: Ordinals[] = []

      for (const wallet of walletsToFetch) {
        try {
          // Skip if this wallet is already being fetched
          if (fetchingWalletsRef.current.has(wallet)) continue

          fetchingWalletsRef.current.add(wallet)
          const url = `/api/ordinals?account=${wallet}`
          const response = await fetch(url)
          const data: Ordinals = await response.json()

          if (data) {
            newOrdinals.push(data)
          }
        } catch (error) {
          console.error(`Error fetching ordinals for wallet ${wallet}:`, error)
        } finally {
          // Mark this wallet as processed
          fetchingWalletsRef.current.delete(wallet)
          fetchedWalletsRef.current.add(wallet)
        }
      }

      if (newOrdinals.length) {
        setOrdinals((prevOrdinals) => {
          const prevOrdinalsSet = new Set(
            prevOrdinals?.map((o) => JSON.stringify(o)) || []
          )
          const filteredNewOrdinals = newOrdinals.filter(
            (o) => !prevOrdinalsSet.has(JSON.stringify(o))
          )
          return [...(prevOrdinals || []), ...filteredNewOrdinals]
        })
      }

      setIsLoading(false)
    }

    const walletsFiltered = filterBitcoinWallets(walletConfigs.wallets)

    // Filter wallets that haven't been fetched yet
    const walletsToFetch = walletsFiltered.filter(
      (wallet) => !fetchedWalletsRef.current.has(wallet)
    )

    if (walletsToFetch.length > 0 && !isLoading) {
      fetchOrdinals(walletsToFetch)
    }

    // Clear ordinals and reset fetched wallets if no wallets are available
    if (walletsFiltered.length === 0) {
      setOrdinals(null)
      fetchedWalletsRef.current.clear()
    }
  }, [walletConfigs.wallets, setOrdinals])

  return { isLoading, ordinals: useRecoilValue(ordinalsAtom) }
}
