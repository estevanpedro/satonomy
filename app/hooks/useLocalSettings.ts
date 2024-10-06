import { configsAtom } from "@/app/recoil/confgsAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { useEffect } from "react"
import { useSetRecoilState } from "recoil"

export const useLocalSettings = () => {
  const setConfigs = useSetRecoilState(configsAtom)
  const setWalletConfigs = useSetRecoilState(walletConfigsAtom)

  useEffect(() => {
    const localConfigs = localStorage.getItem("configs")
    const localWalletConfigs = localStorage.getItem("localWalletConfigs")

    if (localConfigs) {
      setConfigs((prev) => ({
        ...prev,
        proMode: JSON.parse(localConfigs).proMode,
      }))
    }

    if (localWalletConfigs) {
      setWalletConfigs((prev) => ({
        ...prev,
        prevWallets: prev?.prevWallets
          ? prev?.prevWallets
          : JSON.parse(localWalletConfigs).wallets,
        wallets: JSON.parse(localWalletConfigs).wallets,
      }))
    }
  }, [])
}
