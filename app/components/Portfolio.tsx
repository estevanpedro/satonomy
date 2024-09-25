import { CardOption, EmptyCard } from "@/app/components/Card"
import { configAtom } from "@/app/recoil/confgsAtom"
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { runesAtom } from "@/app/recoil/runesAtom"
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom"
import { use, useEffect, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"

export const Portfolio = ({
  onClick,
}: {
  onClick: (utxo: MempoolUTXO) => void
}) => {
  const utxos = useRecoilValue(utxoAtom)
  const [configs, setConfigs] = useRecoilState(configAtom)
  const ordinals = useRecoilValue(ordinalsAtom)
  const allInscriptions = ordinals?.flatMap((o) => o.inscription) || []
  const runesStates = useRecoilValue(runesAtom)

  const onExpand = () => {
    setConfigs((configs) => ({
      ...configs,
      fullDeckPage: configs.fullDeckPage + 1,
    }))
  }
  const [utxosFiltered, setUtxosFiltered] = useState<
    MempoolUTXO[] | undefined
  >()

  const [filterSelected, setFilterSelected] = useState("all")

  useEffect(() => {
    const normalUtxosFiltered = utxos?.filter((utxo) => {
      if (filterSelected === "all") {
        return true
      }

      if (filterSelected === "ordinals") {
        const foundOrdinals = allInscriptions.find(
          (inscription) =>
            inscription.utxo.txid == utxo.txid &&
            inscription.utxo.vout == utxo.vout
        )

        return Boolean(foundOrdinals)
      }

      if (filterSelected === "runes") {
        const rune = runesStates?.find((rune) =>
          rune.utxos?.find((u) => u.location === `${utxo.txid}:${utxo.vout}`)
        )
        return Boolean(rune)
      }

      if (filterSelected === "bitcoin") {
        const foundOrdinals = allInscriptions.find(
          (inscription) =>
            inscription.utxo.txid == utxo.txid &&
            inscription.utxo.vout == utxo.vout
        )
        const rune = runesStates?.find((rune) =>
          rune.utxos?.find((u) => u.location === `${utxo.txid}:${utxo.vout}`)
        )
        return !Boolean(foundOrdinals) && !Boolean(rune)
      }
    })

    const newUtxosFiltered = normalUtxosFiltered?.filter((_, index) => {
      return index < configs.fullDeckPage * 40
    })

    setUtxosFiltered(newUtxosFiltered)
  }, [filterSelected])

  return (
    <div
      className={`fixed top-[140px] left-0 w-[100vw] h-[calc(100vh-140px)] border-2 flex-col border-zinc-700 px-8 bg-zinc-800 rounded-t-lg ${
        configs.isInputFullDeckOpen ? "flex" : "hidden"
      }`}
    >
      <div className="mt-4 flex gap-4 items-center justify-start">
        <div
          className="border-2 border-[#FF61F6] px-2 rounded text-zinc-200 cursor-pointer"
          onClick={() => {
            setFilterSelected("ordinals")
          }}
        >
          Ordinals
        </div>
        <div
          className="border-2 border-[#FF8A00] px-2 rounded text-zinc-200 cursor-pointer"
          onClick={() => {
            setFilterSelected("runes")
          }}
        >
          Runes
        </div>

        <div
          className="border-2 border-[#52525B] px-2 rounded text-zinc-200 cursor-pointer"
          onClick={() => {
            setFilterSelected("bitcoin")
          }}
        >
          Bitcoin
        </div>
      </div>
      <div className="flex flex-wrap gap-4 justify-around overflow-y-scroll mt-4 relative">
        {configs.isInputFullDeckOpen &&
          utxosFiltered!.map((utxo, index) => {
            return (
              <div key={`index-${index}`} className="mt-2 z-0 mr-auto">
                <CardOption onClick={onClick} utxo={utxo} />
              </div>
            )
          })}

        {configs.fullDeckPage * 40 < utxos!.length && (
          <div className="z-1">
            <EmptyCard tooltip="Expand more" text="+" onClick={onExpand} />
          </div>
        )}

        {/* Add an invisible div to fix alignment issues on the last row */}
        <div className="w-full h-0"></div>
      </div>
    </div>
  )
}
