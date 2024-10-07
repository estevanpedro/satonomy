import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { ordByWalletAtom } from "@/app/recoil/ordByWalletAtom"
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { filterBitcoinWallets } from "@/app/utils/filters"
import { useAccounts } from "@particle-network/btc-connectkit"
import { useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"

export const useOrdByWallet = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [ord, setOrd] = useRecoilState(ordByWalletAtom)
  const walletConfigs = useRecoilValue(walletConfigsAtom)
  const { accounts } = useAccounts()
  const butterfly = useRecoilValue(butterflyAtom)
  const ordinals = useRecoilValue(ordinalsAtom)
  const wallets = [...walletConfigs.wallets, ...accounts]
  const walletsFiltered = filterBitcoinWallets(wallets)
  const previousWallets = useRef<Set<string>>(new Set())
  const ordinalInscriptionsData = ordinals?.flatMap((o) => o.inscription) || []
  const hasOrdSelected = butterfly?.inputs?.some((input) =>
    ordinalInscriptionsData?.find(
      (i) => i.utxo.txid === input.txid && i.utxo.vout === input.vout
    )
  )

  useEffect(() => {
    const fetchOrdinals = async (wallet: string) => {
      try {
        setIsLoading(true)

        const url = `/api/satributes?wallet=${wallet}`
        const response = await fetch(url, {
          next: { revalidate: 60 * 5 },
          headers: {
            "Content-Type": "application/json",
          },
        })
        const data = await response.json()

        return data
      } catch (error) {
        console.error(`Error fetching ordinals for wallet ${wallet}:`, error)
        return null
      }
    }

    const fetchAllOrdinals = async (walletsFilteredProps: string[]) => {
      const ordinalsData = await Promise.all(
        walletsFilteredProps.map(async (wallet) => {
          // Skip wallets that have already been fetched
          if (previousWallets.current.has(wallet)) return null

          const data = await fetchOrdinals(wallet)
          // Add the wallet to the set of fetched wallets
          if (data) previousWallets.current.add(wallet)
          return data
        })
      )

      // Flatten the results and filter out any null values
      const allOrdinals = ordinalsData.flat().filter((data) => data !== null)

      if (allOrdinals.length) {
        setOrd(allOrdinals)
      } else {
        console.log("No ordinals found")
        setOrd(null)
      }

      // Mark fetched wallets as processed
      for (const wallet of walletsToFetch) {
        previousWallets.current.add(wallet)
      }

      setIsLoading(false)
    }
    const walletsToFetch = walletsFiltered.filter(
      (wallet) => !previousWallets.current.has(wallet)
    )

    if (!isLoading && walletsToFetch.length > 0) {
      fetchAllOrdinals(walletsToFetch)
    }

    if (walletsToFetch.length === 0 && !hasOrdSelected) {
      // setOrd(null)
      previousWallets.current.clear() // Reset the previously fetched wallets
    }
  }, [wallets, setOrd])

  return { ord, isLoading }
}
