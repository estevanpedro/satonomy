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
  const [utxosPage, setUtxosPage] = useState(0)

  const onExpand = () => {
    console.log("✌️configs.fullDeckPage --->", configs.fullDeckPage)
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
  }, [filterSelected, configs.fullDeckPage, utxos])

  return (
    <div
      className={`fixed top-[140px] left-0 w-[100vw] h-[calc(100vh-140px)] border-2 flex-col border-zinc-700 px-4 bg-zinc-800 rounded-t-lg ${
        configs.isInputFullDeckOpen ? "flex" : "hidden"
      }`}
    >
      <div className="mt-5 flex gap-4 items-center justify-between px-2">
        <div className="flex gap-4 items-center justify-start">
          <div
            className={`border-2 px-2 rounded text-zinc-200 cursor-pointer  ${
              filterSelected === "all" ? "border-b-white" : ""
            } hover:text-zinc-50  hover:scale-105`}
            onClick={() => {
              setFilterSelected("all")
            }}
          >
            All
          </div>
          <div
            className={`border-2  px-2 rounded text-zinc-200 cursor-pointer ${
              filterSelected === "ordinals" ? "border-b-[#FF61F6]" : ""
            } hover:text-zinc-50  hover:scale-105`}
            onClick={() => {
              setFilterSelected("ordinals")
            }}
          >
            Ordinals
          </div>
          <div
            className={`border-2  ${
              filterSelected === "runes" ? "border-b-[#FF8A00]" : ""
            }  px-2 rounded text-zinc-200 cursor-pointer hover:text-zinc-50  hover:scale-105`}
            onClick={() => {
              setFilterSelected("runes")
            }}
          >
            Runes
          </div>

          <div
            className={`border-2 px-2 rounded text-zinc-200 cursor-pointer ${
              filterSelected === "bitcoin" ? "border-b-[#52525B]" : ""
            } hover:text-zinc-50  hover:scale-105`}
            onClick={() => {
              setFilterSelected("bitcoin")
            }}
          >
            Bitcoin
          </div>
        </div>

        <div>
          {utxosFiltered?.length &&
            Boolean(utxosFiltered?.length / 40 > 0) &&
            `Showing 1 to ${utxosFiltered?.length} of ${utxos?.length} UTXOs`}
        </div>
      </div>
      <div className="w-full flex border-b-[1px] border-b-zinc-900 mt-4" />
      <div className="pb-32 grid gap-4 justify-items-center overflow-y-scroll relative border-t-[1px] border-t-zinc-600 pt-4 pl-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 pr-4">
        {configs.isInputFullDeckOpen &&
          utxosFiltered!.map((utxo, index) => {
            return (
              <div key={`index-${index}`} className="w-full max-w-[200px] mt-2">
                <CardOption onClick={onClick} utxo={utxo} />
              </div>
            )
          })}

        {configs.fullDeckPage * 40 < utxos!.length && (
          <div className="w-full max-w-[200px] mt-2">
            <EmptyCard tooltip="Expand more" text="+" onClick={onExpand} />
          </div>
        )}
      </div>
    </div>
  )
}
