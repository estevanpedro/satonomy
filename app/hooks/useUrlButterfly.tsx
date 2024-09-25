import { butterflyAtom, butterflyUrlAtom } from "@/app/recoil/butterflyAtom"
import { configAtom } from "@/app/recoil/confgsAtom"
import { runesAtom } from "@/app/recoil/runesAtom"
import { decompressFromUrlParam } from "@/app/utils/encodeButterfly"
import { useEffect } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"

export const useUrlButterfly = () => {
  const [butterflyUrl, setButterflyUrl] = useRecoilState(butterflyUrlAtom)
  const setButterfly = useSetRecoilState(butterflyAtom)
  const setConfigs = useSetRecoilState(configAtom)
  const setRunes = useSetRecoilState(runesAtom)

  useEffect(() => {
    if (butterflyUrl) return

    const urlParams = new URLSearchParams(window.location.search)
    const urlButterfly = urlParams.get("b")
    const urlConfigs = urlParams.get("c")
    const urlRunes = urlParams.get("r")

    if (!urlButterfly) return

    setButterflyUrl(urlButterfly)

    const decodedButterfly = decompressFromUrlParam(urlButterfly)
    if (decodedButterfly?.inputs) setButterfly(decodedButterfly)

    if (urlConfigs) {
      const decodedConfigs = decompressFromUrlParam(urlConfigs)
      if (decodedConfigs) setConfigs(decodedConfigs)
    }

    if (urlRunes) {
      const decodedRunes = decompressFromUrlParam(urlRunes)
      if (decodedRunes) setRunes(decodedRunes)
    }
  }, [setButterflyUrl, setButterfly, butterflyUrl, setRunes, setConfigs])
}
