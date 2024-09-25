import { runesAtom } from "@/app/recoil/runesAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { filterBitcoinWallets } from "@/app/utils/filters"
import { useEffect, useRef, useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"

export const useRunes = () => {
  const [isLoading, setIsLoading] = useState(false)
  const setRuneStates = useSetRecoilState(runesAtom)
  const walletConfigs = useRecoilValue(walletConfigsAtom)

  // Ref to store previously fetched wallets
  const fetchedWalletsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const fetchRunesUtxos = async (walletsToFetch: string[]) => {
      const allRuneStates: any[] = []

      for (const wallet of walletsToFetch) {
        try {
          setIsLoading(true)
          const url = `/api/balances?account=${wallet}`
          const response = await fetch(url)
          const data = await response.json()

          if (data) {
            const runesWithWallet = data.map((rune: any) => ({
              ...rune,
              wallet,
            }))
            allRuneStates.push(...runesWithWallet)
          }
        } catch (error) {
          console.error(`Error fetching runes for wallet ${wallet}:`, error)
        }
      }

      if (allRuneStates.length) {
        setRuneStates((prevRuneStates) => [
          ...(prevRuneStates || []),
          ...allRuneStates,
        ])
      }

      // Mark fetched wallets as processed
      for (const wallet of walletsToFetch) {
        fetchedWalletsRef.current.add(wallet)
      }

      setIsLoading(false)
    }

    const walletsFiltered = filterBitcoinWallets(walletConfigs.wallets)
    const walletsToFetch = walletsFiltered.filter(
      (wallet) => !fetchedWalletsRef.current.has(wallet)
    )

    if (walletsToFetch.length > 0) {
      fetchRunesUtxos(walletsToFetch)
    }

    if (walletsFiltered.length === 0) {
      setRuneStates(null) // Clear rune states if no wallets are present
      fetchedWalletsRef.current.clear() // Reset fetched wallets
    }
  }, [walletConfigs.wallets, setRuneStates])

  return { isLoading, runeStates: useRecoilValue(runesAtom) }
}
