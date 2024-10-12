import {
  CARD_TYPES_COLOR,
  CARD_TYPES_COLOR_SECONDARY,
} from "@/app/components/CardType"
import { toastOptions } from "@/app/components/Toast"
import { isValidWallet } from "@/app/components/WalletConfigsModal"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { loadingAtom } from "@/app/recoil/loading"
import { ordByWalletAtom } from "@/app/recoil/ordByWalletAtom"
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { runesAtom } from "@/app/recoil/runesAtom"
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom"
import { formatAddress } from "@/app/utils/format"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { useRecoilState, useRecoilValue } from "recoil"

export const WalletUtxoType = ({
  wallet,
  onClose,
}: {
  wallet: string
  onClose: () => void
}) => {
  const ordinals = useRecoilValue(ordinalsAtom)
  const ordinalInscriptionsData = ordinals?.flatMap((o) => o.inscription) || []
  const utxos = useRecoilValue(utxoAtom)
  const loading = useRecoilValue(loadingAtom)
  const isLoadingWallets = loading.walletLoadingList?.includes(wallet)
  const [config, setConfig] = useRecoilState(configsAtom)

  const copyWallet = (wallet: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(wallet).then(
        () => console.log("Text copied to clipboard"),
        (err) => console.error("Could not copy text: ", err)
      )
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = wallet
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        console.log("Text copied to clipboard")
      } catch (err) {
        console.error("Could not copy text: ", err)
      }
      document.body.removeChild(textArea)
    }

    toast(<div>Wallet copied to clipboard. </div>, toastOptions)
  }

  const [isBrc20, setIsBrc20] = useState<undefined | string>(undefined)

  // const utxo = utxos?.find((u) => u.wallet === wallet)
  const runesStates = useRecoilValue(runesAtom)

  const colorType = CARD_TYPES_COLOR.INSCRIPTIONS

  const secondaryColorType = CARD_TYPES_COLOR_SECONDARY.INSCRIPTIONS

  const [btcUtxos, setBtcUtxos] = useState<MempoolUTXO[] | undefined>()
  const [btcLength, setBtcLength] = useState<number>(0)

  const prevBtcUtxos = useRef<MempoolUTXO[] | undefined>(btcUtxos)

  const ord = useRecoilValue(ordByWalletAtom)
  const ordInscriptionsData = ord?.flatMap((o) => o.json.inscriptions) || []

  useEffect(() => {
    const allInscriptions = ordinals?.flatMap((o) => o.inscription) || []

    const normalUtxosFiltered = utxos?.filter((utxo) => {
      const foundOrdinals = allInscriptions.find(
        (inscription) =>
          inscription.address == wallet &&
          inscription.utxo.txid == utxo.txid &&
          inscription.utxo.vout == utxo.vout &&
          utxo.wallet == wallet
      )
      const rune = runesStates?.find((rune) =>
        rune.utxos?.find((u) => u.location === `${utxo.txid}:${utxo.vout}`)
      )
      return !Boolean(foundOrdinals) && !Boolean(rune)
    })

    const filteredBtcUtxos = normalUtxosFiltered?.filter(
      (u) => u?.wallet === wallet && wallet && u?.wallet
    )

    if (filteredBtcUtxos !== prevBtcUtxos.current) {
      setBtcLength(filteredBtcUtxos?.length || 0)
      setBtcUtxos(filteredBtcUtxos)
      prevBtcUtxos.current = filteredBtcUtxos
    }
  }, [utxos, runesStates, ordinals, wallet, ord])

  if (!isValidWallet(wallet)) return null

  const runesLength =
    runesStates
      ?.flatMap((rune) => rune.utxos)
      .filter((u) => u.address === wallet).length || 0

  const inscriptionsLength =
    ordinalInscriptionsData?.filter(
      (u) =>
        u.address === wallet &&
        (!Boolean(
          runesStates?.filter((rune) =>
            rune.utxos?.find(
              (runeUtxo) =>
                runeUtxo.location === `${u.utxo.txid}:${u.utxo.vout}`
            )
          )
        ) ||
          Boolean(
            ordInscriptionsData?.filter(
              (ord) =>
                ord.satributes.length &&
                ord.id === u.inscriptionId &&
                u.address === wallet
            )
          ))
    ).length || 0
  // const btcLength = btcUtxos?.length || 0

  const total = runesLength + inscriptionsLength + btcLength
  if (total === 0) return null

  const runesPercentage = total ? (runesLength / total) * 100 : 0
  const inscriptionsPercentage = total ? (inscriptionsLength / total) * 100 : 0
  const btcPercentage = total ? (btcLength / total) * 100 : 0

  const onClick = (type: string) => {
    if (type === "all") {
      setConfig((prev) => ({
        ...prev,
        fullDeckSearchWallet: wallet,
        fullDeckSearchType: "all",
      }))
    }
    if (type === "bitcoin") {
      setConfig((prev) => ({
        ...prev,
        fullDeckSearchWallet: wallet,
        fullDeckSearchType: "bitcoin",
      }))
    }
    if (type === "runes") {
      setConfig((prev) => ({
        ...prev,
        fullDeckSearchWallet: wallet,
        fullDeckSearchType: "runes",
      }))
    }

    if (type === "ordinals") {
      setConfig((prev) => ({
        ...prev,
        fullDeckSearchWallet: wallet,
        fullDeckSearchType: "ordinals",
      }))
    }

    onClose()

    setConfig((prev) => ({
      ...prev,
      isOutputDeckOpen: false,
      isInputDeckOpen: false,
      isInputFullDeckOpen: true,
    }))
  }

  return (
    <div>
      <div className="gap-4 border rounded rounded-t-none border-t-0 px-4 py-4 flex items-center justify-start w-100">
        <div>
          <div
            className="mb-2 flex gap-1 items-center hover:opacity-80 cursor-pointer "
            onClick={() => copyWallet(wallet)}
          >
            <Image src="/wallet.png" width={12} height={12} alt="Wallets" />{" "}
            {formatAddress(wallet)}{" "}
            <Image
              src="/copy.png"
              width={12}
              height={12}
              alt="Wallets"
              className="w-3 h-3"
            />
          </div>

          <div className="flex gap-1">
            <span className="font-bold">
              {!isLoadingWallets ? (
                utxos?.filter((u) => u.wallet === wallet).length
              ) : (
                <div
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#6839B6] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
              )}
            </span>{" "}
            UTXOs
          </div>
        </div>

        <div className="ml-6 flex">
          <div className="h-[42px] w-[1px] bg-zinc-800 " />
        </div>

        <div className={`flex w-full border`}>
          <div
            onClick={() => onClick("ordinals")}
            style={{
              background: `linear-gradient(180deg, ${colorType} 0%, ${colorType} 50%, ${secondaryColorType} 95%, ${secondaryColorType} 115%)`,
              borderRadius: "inherit",
              width: `${inscriptionsPercentage}%`, // Set width based on percentage
            }}
            className={`hover:opacity-80 cursor-pointer  relative flex rounded flex-col bg-transparent ${
              !inscriptionsLength
                ? "w-0 opacity-0 m-0 p-[0px] border-transparent bg-transparent overflow-hidden"
                : " border-l-2 border-l-transparent border-r-[20px] border-r-transparent"
            }`}
          >
            {inscriptionsPercentage > 0 && (
              <div className="h-full rounded flex flex-col items-center justify-center py-2 px-[4px]">
                <div className="font-bold flex flex-col items-center justify-center pl-1">
                  <span className="font-bold">
                    {isLoadingWallets ? (
                      <div
                        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#6839B6] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                      >
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                          Loading...
                        </span>
                      </div>
                    ) : (
                      inscriptionsLength
                    )}
                  </span>
                  <span className="text-[12px]">
                    {inscriptionsPercentage > 25 && "Ordinals"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div
            onClick={() => onClick("runes")}
            style={{
              // margin: "-3px",
              // padding: "4px",
              background: `linear-gradient(180deg, ${CARD_TYPES_COLOR.RUNES} 0%, ${CARD_TYPES_COLOR.RUNES} 50%, ${CARD_TYPES_COLOR_SECONDARY.RUNES} 95%, ${CARD_TYPES_COLOR_SECONDARY.RUNES} 115%)`,
              borderRadius: "inherit",
              width: `${runesPercentage}%`, // Set width based on percentage
            }}
            className={`hover:opacity-80 cursor-pointer relative flex rounded flex-col bg-transparent ${
              !runesLength
                ? "w-0 opacity-0 m-0 p-[0px] border-transparent bg-transparent overflow-hidden"
                : "px-2 border-l-2 border-l-transparent border-r-[20px] border-r-transparent"
            }`}
          >
            <div className=" flex justify-center items-center h-full rounded p-1 py-2">
              <p>
                <span className="font-bold flex flex-col items-center pl-1">
                  {isLoadingWallets ? (
                    <div
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#6839B6] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                      role="status"
                    >
                      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    runesLength
                  )}
                  <span className="text-[12px]">
                    {runesPercentage > 15 && <div>Runes</div>}
                  </span>
                </span>
              </p>
            </div>
          </div>

          <div
            onClick={() => onClick("bitcoin")}
            style={{
              // margin: "-3px",
              // padding: "4px",
              background: `linear-gradient(180deg, ${CARD_TYPES_COLOR.BTC} 0%, ${CARD_TYPES_COLOR.BTC} 50%, ${CARD_TYPES_COLOR_SECONDARY.BTC} 95%, ${CARD_TYPES_COLOR_SECONDARY.BTC} 115%)`,
              borderRadius: "inherit",
              width: `${btcPercentage}%`, // Set width based on percentage
            }}
            className={`hover:opacity-80 cursor-pointer relative flex rounded flex-col bg-transparent ${
              !btcLength
                ? " w-0 opacity-0 m-0 p-[0px] border-transparent bg-transparent overflow-hidden"
                : ""
            }`}
          >
            <div className="h-full rounded py-2 flex justify-center items-center">
              <p>
                <span className="font-bold flex flex-col items-center justify-center">
                  {isLoadingWallets ? (
                    <div
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#6839B6] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                      role="status"
                    >
                      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    btcLength
                  )}
                  <span className="text-[12px]">
                    {btcLength >= 10 && <div>Bitcoin</div>}
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>

        <button
          className="h-full min-h-[50px] w-[30px] px-3 mx-[-12px] font-bold"
          onClick={() => {
            onClick("all")
          }}
        >
          {" "}
          {">"}{" "}
        </button>
      </div>
    </div>
  )
}
