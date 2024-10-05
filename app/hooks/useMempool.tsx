import { configsAtom } from "@/app/recoil/confgsAtom"
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom"
import { utxoServices } from "@/app/services/utxoServices"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { track } from "@vercel/analytics"
import { useEffect, useRef } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { filterBitcoinWallets } from "@/app/utils/filters"
import { useAccounts } from "@particle-network/btc-connectkit"
import { loadingAtom } from "@/app/recoil/loading"
import { errorsAtom } from "@/app/recoil/errors"
import { toast } from "react-toastify"
import { formatAddress } from "@/app/utils/format"

export const useMempool = () => {
  const setUtxo = useSetRecoilState(utxoAtom)
  const walletConfigs = useRecoilValue(walletConfigsAtom)
  const configs = useRecoilValue(configsAtom)
  const notConfirmed = configs.notConfirmed
  const { accounts } = useAccounts()
  const previousAccountsRef = useRef<string[]>([])
  const previousProModeRef = useRef<boolean>(configs.proMode)
  const setLoading = useSetRecoilState(loadingAtom)
  const setErrors = useSetRecoilState(errorsAtom)

  useEffect(() => {
    const fetchUtxos = async (wallets: string[]) => {
      const allUtxos: MempoolUTXO[] = []

      const walletsFiltered = filterBitcoinWallets(wallets)
      for (const wallet of walletsFiltered) {
        setLoading((prev) =>
          prev.walletLoadingList
            ? {
                ...prev,
                walletLoadingList: [...prev.walletLoadingList, wallet],
              }
            : prev
        )
        track("utxo-fetch", { wallet })
        try {
          const res = await utxoServices.getUtxos(wallet, notConfirmed)

          if (res?.length) {
            const utxosWithWallet = res.map((utxo: MempoolUTXO) => ({
              ...utxo,
              wallet,
            }))
            allUtxos.push(...utxosWithWallet)

            track(
              "utxo-length",
              { wallet, length: res.length },
              { flags: ["utxosLengths"] }
            )

            setLoading((prev) =>
              prev.walletLoadingList
                ? {
                    ...prev,
                    walletLoadingList: [
                      ...prev.walletLoadingList.filter((w) => w !== wallet),
                    ],
                  }
                : prev
            )
          }
        } catch (error) {
          console.error("Error fetching utxos", error)
          setLoading((prev) =>
            prev.walletLoadingList
              ? {
                  ...prev,
                  walletLoadingList: [
                    ...prev.walletLoadingList.filter((w) => w !== wallet),
                  ],
                }
              : prev
          )
          setErrors((prev) => ({
            walletErrorList: [...prev.walletErrorList, wallet],
          }))
        }
      }

      if (allUtxos.length) {
        setUtxo(allUtxos as [])
      } else {
        setUtxo(null)
        setLoading((prev) => ({
          ...prev,
          walletLoadingList: [],
        }))
      }
    }

    const accountsChanged = () => {
      const previousAccounts = previousAccountsRef.current
      const isDifferent =
        JSON.stringify(accounts) !== JSON.stringify(previousAccounts)
      previousAccountsRef.current = accounts
      return isDifferent
    }

    const shouldFetchInSimpleMode = () => {
      // Check if accounts have changed or if transitioning from proMode to simple mode
      return (
        configs.proMode === false &&
        (accountsChanged() || previousProModeRef.current !== configs.proMode)
      )
    }

    if (configs.proMode) {
      // Use walletConfigs.wallets in pro mode
      if (walletConfigs.wallets.length > 0) {
        fetchUtxos(walletConfigs.wallets)
      } else {
        setUtxo(null)
      }
    } else {
      // Use accounts in simple mode
      if (shouldFetchInSimpleMode() && accounts.length > 0) {
        fetchUtxos(accounts)
      } else {
        setUtxo(null)
      }
    }

    // Update previous proMode reference
    previousProModeRef.current = configs.proMode
  }, [accounts, walletConfigs.wallets, setUtxo, notConfirmed, configs.proMode])
}
