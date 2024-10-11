import { CardOption, EmptyCard } from "@/app/components/Card"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { favoritesAtom } from "@/app/recoil/favoritesAtom"
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { runesAtom } from "@/app/recoil/runesAtom"
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { formatAddress } from "@/app/utils/format"
import { useAccounts } from "@particle-network/btc-connectkit"
import { use, useEffect, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"

export const Portfolio = ({
  onClick,
  cardsDeckRef,
}: {
  onClick: (utxo: MempoolUTXO) => void
  cardsDeckRef: React.RefObject<HTMLDivElement>
}) => {
  const utxos = useRecoilValue(utxoAtom)
  const [configs, setConfigs] = useRecoilState(configsAtom)
  const ordinals = useRecoilValue(ordinalsAtom)
  const allInscriptions = ordinals?.flatMap((o) => o.inscription) || []
  const runesStates = useRecoilValue(runesAtom)
  const [favorites, setFavorites] = useRecoilState(favoritesAtom)
  const butterfly = useRecoilValue(butterflyAtom)

  const { accounts } = useAccounts()
  const walletConfigs = useRecoilValue(walletConfigsAtom)
  const allWallets = [
    ...(!walletConfigs.wallets ? accounts : []),
    ...walletConfigs.wallets,
  ]

  const onExpand = () => {
    setConfigs((configs) => ({
      ...configs,
      fullDeckPage: configs.fullDeckPage + 1,
    }))
  }
  const [utxosFiltered, setUtxosFiltered] = useState<
    MempoolUTXO[] | undefined
  >()

  // const [filterSelected, setFilterSelected] = useState("all")

  const setFilterSelected = (filter: string) => {
    setConfigs((configs) => ({
      ...configs,
      fullDeckSearchType: filter,
    }))
  }

  const filterSelected = configs.fullDeckSearchType

  useEffect(() => {
    const normalUtxosFiltered = utxos?.filter((utxo) => {
      if (filterSelected === "all") {
        return true
      }
      // if (filterSelected === "selectable") {
      //   const isRunesOneInput = butterfly.inputs.find((input) =>
      //     runesStates?.find((rune) =>
      //       rune.utxos.find((u) => u.location === `${input.txid}:${input.vout}`)
      //     )
      //   )
      //   if (isRunesOneInput) {
      //     const rune = runesStates?.find((rune) =>
      //       rune.utxos?.find((u) => u.location === `${utxo.txid}:${utxo.vout}`)
      //     )
      //   }
      // }
      if (filterSelected === "favorites") {
        const isFavorite = favorites.utxos.includes(`${utxo.txid}:${utxo.vout}`)
        return isFavorite
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

    const newUtxosFiltered = normalUtxosFiltered
      ?.filter((_, index) => {
        return index < configs.fullDeckPage * 40
      })
      ?.filter(
        (m) =>
          m.wallet === configs.fullDeckSearchWallet ||
          !configs.fullDeckSearchWallet
      )

    setUtxosFiltered(newUtxosFiltered)
  }, [
    filterSelected,
    configs.fullDeckPage,
    utxos,
    configs.fullDeckSearchWallet,
  ])

  const onChangeWalletFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "all") {
      setConfigs((configs) => ({
        ...configs,
        fullDeckSearchWallet: "",
      }))
      return
    }

    setConfigs((configs) => ({
      ...configs,
      fullDeckSearchWallet: e.target.value,
    }))
  }
  return (
    <div
      ref={cardsDeckRef}
      className={`fixed top-[140px] left-0 w-[100vw] h-[calc(100vh-140px)] border-2 flex-col border-zinc-700 px-4 bg-zinc-800 rounded-t-lg  transition-transform duration-300 ${
        configs.isInputFullDeckOpen
          ? " translate-y-0 flex"
          : " translate-y-full"
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
          <div className="h-[22px] w-[1px] bg-black"></div>
          <div className="h-[22px] w-[1px] bg-zinc-600 ml-[-16px]"></div>
          <div
            className={`border-2  px-2 rounded text-zinc-200 cursor-pointer ${
              filterSelected === "ordinals" ? "border-b-[#3478F7]" : ""
            } hover:text-zinc-50  hover:scale-105`}
            onClick={() => {
              setFilterSelected("ordinals")
            }}
          >
            Ordinals
          </div>
          <div className="h-[22px] w-[1px] bg-black"></div>
          <div className="h-[22px] w-[1px] bg-zinc-600 ml-[-16px]"></div>
          <div
            className={`border-2  ${
              filterSelected === "runes" ? "border-b-[#FF61F6]" : ""
            }  px-2 rounded text-zinc-200 cursor-pointer hover:text-zinc-50  hover:scale-105`}
            onClick={() => {
              setFilterSelected("runes")
            }}
          >
            Runes
          </div>
          <div className="h-[22px] w-[1px] bg-black"></div>
          <div className="h-[22px] w-[1px] bg-zinc-600 ml-[-16px]"></div>
          <div
            className={`border-2 px-2 rounded text-zinc-200 cursor-pointer ${
              filterSelected === "bitcoin" ? "border-b-[#FF8A00]" : ""
            } hover:text-zinc-50  hover:scale-105`}
            onClick={() => {
              setFilterSelected("bitcoin")
            }}
          >
            Bitcoin
          </div>
          {/* <div className="h-[22px] w-[1px] bg-black"></div>
          <div className="h-[22px] w-[1px] bg-zinc-600 ml-[-16px]"></div>
          <div
            className={`border-2 px-2 rounded text-zinc-200 cursor-pointer ${
              filterSelected === "selectable" ? "border-b-[#a937cf]" : ""
            } hover:text-zinc-50  hover:scale-105`}
            onClick={() => {
              setFilterSelected("selectable")
            }}
          >
            Selectable
          </div> */}
          <div className="h-[22px] w-[1px] bg-black"></div>
          <div className="h-[22px] w-[1px] bg-zinc-600 ml-[-16px]"></div>
          <div
            className={`border-2 px-2 rounded text-zinc-200 cursor-pointer ${
              filterSelected === "favorites" ? "border-b-[#ebce15]" : ""
            } hover:text-zinc-50  hover:scale-105`}
            onClick={() => {
              setFilterSelected("favorites")
            }}
          >
            ⭐️ Favorites
          </div>
          <div className="h-[22px] w-[1px] bg-black"></div>
          <div className="h-[22px] w-[1px] bg-zinc-600 ml-[-16px]"></div>
          <div
            className={`border-2 px-2 rounded text-zinc-200 cursor-pointer  hover:text-zinc-50  hover:scale-105 ${
              configs.fullDeckSearchWallet &&
              configs.fullDeckSearchWallet !== "all"
                ? "border-b-2 border-b-zinc-400 "
                : ""
            }`}
          >
            <select
              className="px-2 py-1 mt-[-4px] rounded bg-transparent"
              onChange={onChangeWalletFilter}
              defaultValue={configs.fullDeckSearchWallet || "all"}
              value={configs.fullDeckSearchWallet || "all"}
            >
              <option value="all">All wallets</option>
              {allWallets?.map((wallet) => (
                <option key={wallet} value={wallet}>
                  {formatAddress(wallet)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          {utxosFiltered?.length &&
            Boolean(utxosFiltered?.length / 40 > 0) &&
            `Showing 1 to ${utxosFiltered?.length} of ${utxos?.length} UTXOs`}
        </div>
      </div>
      <div className="w-full flex border-b-[1px] border-b-zinc-900 mt-4 " />
      <div className=" pb-32 grid gap-4 justify-items-center overflow-y-scroll relative border-t-[1px] border-t-zinc-600 pt-4 pl-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 pr-4">
        {configs.isInputFullDeckOpen &&
          utxosFiltered?.map((utxo, index) => {
            return (
              <div
                key={`${utxo.txid}:${utxo.vout}-${index}`}
                className="w-full max-w-[200px] mt-2"
              >
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
