import { configsAtom } from "@/app/recoil/confgsAtom"
import { useEffect, useCallback } from "react"
import { useRecoilState } from "recoil"

export const useKeyboards = () => {
  const [configs, setConfigs] = useRecoilState(configsAtom)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfigs((configs) => ({
          ...configs,
          isInputFullDeckOpen: false,
          isInputDeckOpen: false,
          isOutputDeckOpen: false,
        }))
      }
    },
    [setConfigs]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [setConfigs, handleKeyDown])
}
