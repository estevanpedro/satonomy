import { configAtom } from "@/app/recoil/confgsAtom"
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom"
import { utxoServices } from "@/app/services/utxoServices"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { track } from "@vercel/analytics"
import { useEffect } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { filterBitcoinWallets } from "@/app/utils/filters"

export const useMempool = () => {
  const setUtxo = useSetRecoilState(utxoAtom)
  const walletConfigs = useRecoilValue(walletConfigsAtom)
  const configs = useRecoilValue(configAtom)
  const notConfirmed = configs.notConfirmed

  useEffect(() => {
    const fetchUtxos = async () => {
      const allUtxos: MempoolUTXO[] = []

      const walletsFiltered = filterBitcoinWallets(walletConfigs.wallets)
      for (const wallet of walletsFiltered) {
        track("utxo-fetch", { wallet })
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
        }
      }

      if (allUtxos.length) {
        setUtxo(allUtxos as [])
      } else {
        setUtxo(null)
      }
    }

    if (walletConfigs.wallets.length > 0) {
      fetchUtxos()
    } else {
      setUtxo(null)
    }
  }, [walletConfigs.wallets, setUtxo, notConfirmed])
}
