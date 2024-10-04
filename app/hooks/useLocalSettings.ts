import { configsAtom } from "@/app/recoil/confgsAtom"
import { useEffect } from "react"
import { useSetRecoilState } from "recoil"

export const useLocalSettings = () => {
  const setConfigs = useSetRecoilState(configsAtom)

  useEffect(() => {
    const localConfigs = localStorage.getItem("configs")

    if (localConfigs) {
      setConfigs((prev) => ({
        ...prev,
        proMode: JSON.parse(localConfigs).proMode,
      }))
    }
  }, [])
}
