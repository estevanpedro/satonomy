import { PsbtHexSignedRes } from "@/app/api/psbtHexSigned/route"
import {
  Butterfly,
  butterflyAtom,
  butterflyUrlAtom,
} from "@/app/recoil/butterflyAtom"
import { configAtom, DEFAULT_CONFIGS } from "@/app/recoil/confgsAtom"
import { psbtSignedAtom } from "@/app/recoil/psbtAtom"
import { runesAtom, RunesUtxo, RuneTransaction } from "@/app/recoil/runesAtom"
import { decompressFromUrlParam } from "@/app/utils/encodeButterfly"
import { useEffect } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"

export const useUrlButterfly = () => {
  const [butterflyUrl, setButterflyUrl] = useRecoilState(butterflyUrlAtom)
  const setButterfly = useSetRecoilState(butterflyAtom)
  const setConfigs = useSetRecoilState(configAtom)
  const setRunes = useSetRecoilState(runesAtom)
  const setPsbtSigned = useSetRecoilState(psbtSignedAtom)

  useEffect(() => {
    if (butterflyUrl) return

    const urlParams = new URLSearchParams(window.location.search)
    const urlButterfly = urlParams.get("b")
    const urlConfigs = urlParams.get("c")
    const urlRunes = urlParams.get("r")
    const psbtHexSigned = urlParams.get("psbtHexSigned")

    if (!urlButterfly) return

    setButterflyUrl(urlButterfly)

    const decodedButterfly: Butterfly = decompressFromUrlParam(urlButterfly)
    if (decodedButterfly?.inputs) setButterfly(decodedButterfly)

    if (urlConfigs) {
      const decodedConfigs = decompressFromUrlParam(urlConfigs)
      if (decodedConfigs)
        setConfigs({
          ...DEFAULT_CONFIGS,
          feeCost: decodedConfigs.feeCost,
          feeRate: decodedConfigs.feeRate,
          feeType: decodedConfigs.feeType,
          feeRateEstimated: decodedConfigs.feeRateEstimated,
        })
    }

    if (urlRunes) {
      const decodedRunes = decompressFromUrlParam(urlRunes)
      if (decodedRunes.length)
        setRunes((prevRunes) => {
          const existingLocations = new Set(
            (prevRunes || []).flatMap((rune: RunesUtxo) =>
              rune.utxos.map((utxo: RuneTransaction) => utxo.location)
            )
          )

          const filteredNewRunes = decodedRunes
            .map((rune: RunesUtxo) => ({
              ...rune,
              utxos: rune.utxos.filter(
                (utxo: RuneTransaction) => !existingLocations.has(utxo.location)
              ),
            }))
            .filter((rune: RunesUtxo) => rune.utxos.length > 0) // Only include runes with remaining UTXOs

          return [...(prevRunes || []), ...filteredNewRunes]
        })
    }

    if (psbtHexSigned) {
      const fetchedPsbtSigned = async () => {
        const res = await fetch("/api/psbtHexSigned", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ psbtHexSigned }),
        })

        const data: PsbtHexSignedRes = await res.json()
        const inputsSigned = decodedButterfly.inputs.filter((_, index) => {
          if (data?.signedIndexes?.includes(index)) return true
        })

        setPsbtSigned({
          inputsSigned,
          psbtHexSigned,
        })
      }

      fetchedPsbtSigned()
    }
  }, [
    setButterflyUrl,
    setButterfly,
    butterflyUrl,
    setRunes,
    setConfigs,
    setPsbtSigned,
  ])
}
