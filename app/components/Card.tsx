import { useParams } from "next/navigation"
import {
  CARD_TYPES,
  CARD_TYPES_COLOR,
  CARD_TYPES_COLOR_SECONDARY,
  Category,
} from "@/app/components/CardType"
import { MempoolUTXO } from "@/app/recoil/utxoAtom"
import { formatAddress, formatNumber } from "@/app/utils/format"
import { useAccounts } from "@particle-network/btc-connectkit"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { OrdinalRendering } from "@/app/components/Ordinals"
import { runesAtom, RunesUtxo } from "@/app/recoil/runesAtom"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { OrdinalData, Ordinals, ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { btcPriceAtom } from "@/app/recoil/btcPriceAtom"
import { Tooltip } from "react-tooltip"
import { ordByWalletAtom } from "@/app/recoil/ordByWalletAtom"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { psbtSignedAtom } from "@/app/recoil/psbtAtom"
import { loadingAtom } from "@/app/recoil/loading"
import { favoritesAtom } from "@/app/recoil/favoritesAtom"

export function generateBowtiePath(
  inputX: number,
  inputY: number,
  outputX: number,
  outputY: number
): string {
  const controlPointX1 = (inputX + outputX) / 2
  const controlPointY1 = inputY
  const controlPointX2 = (inputX + outputX) / 2
  const controlPointY2 = outputY

  return `
      M ${inputX},${inputY}
      C ${controlPointX1},${controlPointY1} ${controlPointX2},${controlPointY2} ${outputX},${outputY}
    `
}

export const EmptyCard = ({
  onClick,
  className,
  text,
  tooltip,
}: {
  onClick?: () => void
  className?: string
  text?: string
  tooltip?: string
}) => {
  return (
    <>
      <div
        className={`${className} w-52 h-[320px] rounded-xl flex flex-col gap-3 items-center justify-center  cursor-pointer border bg-zinc-950 relative mb-8`}
      >
        <Tooltip
          id={`emptyCard-${className}-${text}`}
          className="max-w-[210px] bg-gray-600 text-[12px] pr-0 z-91"
          style={{ backgroundColor: "#292929", color: "white" }}
        />

        <div
          data-tooltip-id={`emptyCard-${className}-${text}`}
          data-tooltip-content={
            tooltip
              ? tooltip
              : `${
                  className
                    ? "Add a new output"
                    : "Open the deck of UTXOs and select an Input"
                }`
          }
          data-tooltip-place={className ? "left" : "right"}
          onClick={onClick}
          className={`${className} w-52 h-[320px] rounded-xl flex flex-col gap-3 items-center justify-center text-4xl cursor-pointer border bg-zinc-950 relative hover:border-zinc-500`}
        >
          {text || "+"}
        </div>
      </div>
    </>
  )
}

export const EmptyCardMobile = ({
  onClick,
  className,
}: {
  onClick?: () => void
  className?: string
}) => {
  return (
    <div
      onClick={onClick}
      className={`${className} w-[100px] h-[100px] rounded-xl flex flex-col gap-3 items-center justify-center text-4xl cursor-pointer border bg-zinc-950`}
    >
      +
    </div>
  )
}

export const CardMobile = ({
  onRemove,
  utxo,
}: {
  onRemove?: (output: MempoolUTXO) => void
  utxo: MempoolUTXO
}) => {
  const btcUsdPrice = useRecoilValue(btcPriceAtom)
  const { accounts } = useAccounts()
  const account = accounts[0]
  return (
    <div className="relative w-[100px] h-[100px] max-h-[100px]  rounded-xl bg-zinc-900 border-[3px] border-zinc-600 flex flex-col items-center justify-center pt-2">
      <button
        className="absolute top-0 left-[-32px] opacity-30 hover:opacity-100"
        onClick={() => {
          onRemove?.(utxo)
        }}
      >
        🗑️
      </button>
      <div className="absolute top-[-3px] right-[-3px]">
        <Category color={CARD_TYPES_COLOR.BTC} type={CARD_TYPES.BTC} />
      </div>
      <Image
        src="/bitcoin.png"
        alt="Bitcoin"
        width={16}
        height={16}
        loading="lazy"
      />

      <div className="text-center text-white text-[12px] font-medium">
        {formatNumber(utxo?.value, 0, 0, false, false)} sats
      </div>
      <div className="text-[12px]">
        ${formatNumber((utxo?.value / 100000000) * btcUsdPrice)}
      </div>
    </div>
  )
}

export const CardOption = ({
  onClick,
  utxo,
  onRemove,
  isSelected,
  onSignClick,
}: {
  onClick?: (utxo: MempoolUTXO) => void
  utxo: MempoolUTXO
  onRemove?: (utxo: MempoolUTXO) => void
  isSelected?: boolean
  onSignClick?: (e: any) => void
}) => {
  const psbtSigned = useRecoilValue(psbtSignedAtom)
  const ordinals = useRecoilValue(ordinalsAtom)
  const btcUsdPrice = useRecoilValue(btcPriceAtom)
  const { inputs } = useRecoilValue(butterflyAtom)
  const runesStates = useRecoilValue(runesAtom)
  const ord = useRecoilValue(ordByWalletAtom)
  const { isInputFullDeckOpen } = useRecoilValue(configsAtom)
  const loading = useRecoilValue(loadingAtom)

  const allInscriptions = ordinals?.flatMap((o) => o.inscription) || []

  const ordInscriptionsData = ord?.flatMap((o) => o.json.inscriptions) || []
  // console.log("✌️ordInscriptionsData --->", ordInscriptionsData)
  // console.log("✌️utxo --->", utxo)

  //only works if its ordinals:
  const ordInscriptionsFound = ordInscriptionsData?.find(
    (i) =>
      i.id.split("i")[0] === utxo.txid &&
      Number(i.id.split("i")[1]) === utxo.vout
  )

  const ordinalUtxoFound = allInscriptions?.find(
    (i) => i.utxo.txid === utxo.txid && i.utxo.vout === utxo.vout
  )?.utxo

  // console.log("✌️ordinalUtxoFound --->", ordinalUtxoFound)
  const satributesFound = ordInscriptionsData?.find((satributes) =>
    ordinalUtxoFound?.inscriptions
      .map((inscription) => inscription.inscriptionId)
      .includes(satributes.id)
  )

  const rune = runesStates?.find((rune) =>
    rune.utxos?.find((u) => u.location === `${utxo.txid}:${utxo.vout}`)
  )

  const utxoFound = rune
    ? rune?.utxos.find((u) => u.location === `${utxo.txid}:${utxo.vout}`)
    : undefined

  let ordinal = !utxoFound
    ? allInscriptions?.find(
        (i) => i.utxo.txid === utxo.txid && i.utxo.vout === utxo.vout
      )
    : undefined

  const runeSelected = runesStates?.find((rune) =>
    inputs.find((i) =>
      rune.utxos?.find((u) => u.location === `${i.txid}:${i.vout}`)
    )
  )

  const ordinalSelected = allInscriptions.find((i) =>
    inputs.find(
      (input) => input.txid === i.utxo.txid && input.vout === i.utxo.vout
    )
  )

  const isSameRune = runeSelected?.utxos.find(
    (runeUtxo) => runeUtxo.location === `${utxo.txid}:${utxo.vout}`
  )

  const [isSigned, setIsSigned] = useState<MempoolUTXO | undefined>(undefined)
  const setLoading = useSetRecoilState(loadingAtom)
  const prevPsbtHexSignedRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (
      !psbtSigned.psbtHexSigned &&
      !(
        prevPsbtHexSignedRef.current &&
        prevPsbtHexSignedRef.current !== psbtSigned.psbtHexSigned
      )
    )
      return
    const isSigned = psbtSigned.inputsSigned.find(
      (i) => i.txid === utxo.txid && i.vout === utxo.vout
    )
    setIsSigned(isSigned)
    setLoading((prev) => ({
      ...prev,
      signIsLoading: false,
    }))
    prevPsbtHexSignedRef.current = psbtSigned.psbtHexSigned
  }, [psbtSigned.inputsSigned])

  const hasSomeSigned = psbtSigned.inputsSigned.find((i) =>
    inputs.find((input) => input.txid === i.txid && input.vout === i.vout)
  )

  const isDifferentRuneId = Boolean(
    runeSelected?.runeid !== rune?.runeid && rune && runeSelected?.runeid
  )

  const satributesAmount =
    ordInscriptionsFound?.satributes.length ||
    satributesFound?.satributes?.length
  const hasSatributes = Boolean(satributesAmount)

  const isDisabled =
    inputs?.includes(utxo) ||
    hasSatributes ||
    (Boolean(runeSelected) && !isSameRune && Boolean(rune)) ||
    isDifferentRuneId ||
    ((Boolean(ordinalSelected) || Boolean(runeSelected)) &&
      (Boolean(ordinal) || Boolean(rune)) &&
      Boolean(!isSameRune))

  const [isBrc20, setIsBrc20] = useState<undefined | string>(undefined)

  const contentType = isBrc20
    ? "BRC-20"
    : utxoFound
    ? CARD_TYPES.RUNES
    : ordinal?.contentType || CARD_TYPES.BTC

  const colorType = utxoFound
    ? CARD_TYPES_COLOR.RUNES
    : ordinal
    ? isBrc20
      ? CARD_TYPES_COLOR.BRC20
      : CARD_TYPES_COLOR.INSCRIPTIONS
    : CARD_TYPES_COLOR.BTC

  const secondaryColorType = utxoFound
    ? CARD_TYPES_COLOR_SECONDARY.RUNES
    : ordinal
    ? isBrc20
      ? CARD_TYPES_COLOR_SECONDARY.BRC20
      : CARD_TYPES_COLOR_SECONDARY.INSCRIPTIONS
    : CARD_TYPES_COLOR_SECONDARY.BTC

  const [favorites, setFavorites] = useRecoilState(favoritesAtom)
  const isFavorite = favorites.utxos.includes(`${utxo.txid}:${utxo.vout}`)

  const onFavorite = (utxo: MempoolUTXO, isFavorite: boolean) => {
    if (isFavorite) {
      setFavorites((prev) => ({
        utxos: [...prev.utxos, `${utxo.txid}:${utxo.vout}`],
      }))
    } else {
      setFavorites((prev) => ({
        utxos: prev.utxos.filter((u) => u !== `${utxo.txid}:${utxo.vout}`),
      }))
    }
  }

  return (
    <div
      style={{
        touchAction: "auto",
        position: "relative",
        zIndex: 1,
      }}
      className={`select-none	 min-h-[320px] relative w-52 min-w-52 rounded-xl bg-zinc-900 flex flex-col gap-3 items-center justify-center`}
    >
      <div className="absolute top-[-3px] right-[-3px] pointer-events-none">
        <Category color={colorType} type={contentType} />
      </div>

      {isSelected ? (
        <div className="absolute flex flex-col gap-4 top-0 left-[-120px] items-end">
          <div className="opacity-30">
            <div>INPUT #{utxo?.vout}</div>
          </div>
          <div className="opacity-30">
            {utxo?.wallet ? formatAddress(utxo.wallet) : ""}
          </div>
          {loading.signIsLoading ||
          Boolean(isSigned) ||
          Boolean(hasSomeSigned) ? null : (
            <button
              className="opacity-30 hover:opacity-100"
              onClick={() => {
                onRemove?.(utxo)
              }}
              disabled={Boolean(isSigned)}
            >
              REMOVE 🗑️
            </button>
          )}

          <Tooltip
            id={`inputs`}
            className="max-w-[210px] bg-gray-600 text-[12px] pr-0 z-91"
            style={{ backgroundColor: "#292929", color: "white" }}
          />
          <button
            data-tooltip-id={"inputs"}
            data-tooltip-content={
              Boolean(isSigned)
                ? "Input is already signed"
                : `Sign with ${formatAddress(utxo?.wallet || "")} wallet`
            }
            data-tooltip-place="bottom"
            className={`hover:opacity-100 ${
              Boolean(isSigned) ? "" : "opacity-30"
            }`}
            onClick={onSignClick}
            disabled={Boolean(isSigned) || loading.signIsLoading}
          >
            {!loading.signIsLoading ? (
              Boolean(isSigned) ? (
                "Signed ✅"
              ) : (
                "Sign ✍️"
              )
            ) : (
              <div className="loader" />
            )}
          </button>
        </div>
      ) : null}

      {rune && (
        <>
          <div className="w-full justify-center items-center flex text-center text-[52px] pointer-events-none mt-[-60px]">
            <div className="mt-6 min-w-[38px] h-[38px] rounded bg-gray-800 border-[1px] border-gray-600 flex justify-center items-center text-[20px]">
              {rune.symbol}
            </div>
          </div>
          <div className="flex flex-col gap-[4px] justify-center items-center">
            <span
              className={`mt-3 text-[12px] font-bold ${
                isInputFullDeckOpen ? "pointer-events-none" : ""
              }`}
            >
              {rune?.spacedRune}
            </span>
            <span className="pointer-events-none text-[10px]">
              {rune?.runeid}
            </span>
          </div>
          {rune?.amount && (
            <div className="mt-[-14px] w-[150px] h-12 text-center text-xl text-bold font-medium flex justify-center items-center pointer-events-none gap-2 whitespace-nowrap overflow-hidden">
              {formatNumber(
                Number(utxoFound?.formattedBalance),
                0,
                8,
                false,
                true
              )}{" "}
              {rune?.symbol}
              {/* <span className="opacity-50 text-[10px]">(No divisibility)</span> */}
            </div>
          )}

          <div className="mt-4 mb-[-26px]">
            <span className="text-[16px] text-bold">{utxo.value} sats</span>
          </div>
        </>
      )}
      {!rune && !ordinal && (
        <>
          <Image
            className="w-14 h-14 pointer-events-none"
            src="/bitcoin.png"
            alt="Bitcoin"
            width={54}
            height={54}
            loading="lazy"
          />
          <span className="font-bold">Bitcoin</span>
          <div className="w-32 h-12 text-center text-white text-xl font-medium pointer-events-none">
            {formatNumber(utxo?.value, 0, 0, false, false)} sats
          </div>
          <div className="opacity-50 text-[12px]">
            ${formatNumber((utxo?.value / 100000000) * btcUsdPrice)}
          </div>
        </>
      )}
      {ordinal && !rune && (
        <>
          <OrdinalRendering
            utxo={utxo}
            setIsBrc20={(string: string) => setIsBrc20(string)}
          />
          {!Boolean(isBrc20) && (
            <span className="text-[10px]">{ordinal.contentType}</span>
          )}

          <div className="flex flex-col justify-center items-center mb-[24px]">
            <span className="text-[16px] text-bold">
              {formatNumber(utxo.value)} sats
            </span>
            <div className="opacity-50 text-[12px]">
              ${formatNumber((utxo?.value / 100000000) * btcUsdPrice)}
            </div>
          </div>
        </>
      )}

      {!isSelected && (
        <button
          data-tooltip-id={"select"}
          data-tooltip-content={
            isDisabled
              ? !Boolean(ordinal)
                ? "UTXO already selected"
                : `Inscriptions are not available yet.`
              : ""
          }
          data-tooltip-place="top"
          disabled={isDisabled || Boolean(hasSomeSigned)}
          onClick={() => onClick?.(utxo)}
          className={`${
            isDisabled || Boolean(hasSomeSigned) ? "opacity-0" : ""
          }  font-bold  absolute bottom-4 text-[16px] rounded px-8 py-1 from-[${colorType}] to-[${secondaryColorType}] bg-gradient-to-r text-white  hover:scale-105`}
          style={{
            background: `linear-gradient(45deg, ${colorType} 0%, ${colorType} 50%, ${secondaryColorType} 95%, ${secondaryColorType} 115%)`,
          }}
        >
          SELECT
        </button>
      )}

      <div
        className={`absolute   left-3 top-2 z-[1] ${
          isFavorite ? "opacity-90" : "opacity-20"
        } ${
          !isSelected && isInputFullDeckOpen
            ? "w-[180px] h-[250px]"
            : "w-[30px] h-[30px]"
        }`}
        onClick={() =>
          !isSelected && isInputFullDeckOpen
            ? onFavorite(utxo, !isFavorite)
            : null
        }
      >
        ⭐️
      </div>

      {hasSatributes ? (
        <div className="absolute bottom-2 left-4">
          <p className="text-[12px] opacity-50">
            {satributesAmount} satributes
          </p>
        </div>
      ) : null}
      <div
        className="absolute inset-0 rounded-xl z-[-1]"
        style={{
          margin: "-3px", // Adjust to match the border thickness
          padding: "4px", // Adjust to match the border thickness
          background: `linear-gradient(180deg, ${colorType} 0%, ${colorType} 50%, ${secondaryColorType} 95%, ${secondaryColorType} 115%)`,
          borderRadius: "inherit", // Ensure the radius matches the card's radius
        }}
      >
        <div
          className="w-full h-full rounded-xl bg-zinc-900"
          style={{
            borderRadius: "inherit",
          }}
        ></div>
      </div>
    </div>
  )
}

export const CardOutput = ({
  onRemove,
  index,
}: {
  onRemove: (index: number) => void
  index: number
}) => {
  const btcUsdPrice = useRecoilValue(btcPriceAtom)
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom)
  const psbtSigned = useRecoilValue(psbtSignedAtom)

  const [addressInputFocused, setAddressInputFocused] = useState(false)
  const onInputFocus = () => {
    setAddressInputFocused(true)
    document.getElementById("address")?.focus()
  }

  const onClone = () => {
    setButterfly((prev) => {
      const outputs = JSON.parse(JSON.stringify(prev.outputs))
      const output = outputs[index]
      outputs.push({ ...output, vout: outputs.length + 1 })
      return { ...prev, outputs }
    })
  }

  const rune = butterfly.outputs[index]?.rune
  const [isBrc20, setIsBrc20] = useState<undefined | string>(undefined)
  const ordinals = useRecoilValue(ordinalsAtom)
  const allOrdinals = ordinals?.flatMap((o) => o.inscription) || []

  const ordinal = butterfly.inputs.find((input) =>
    allOrdinals?.find(
      (o) => o.utxo.txid === input.txid && o.utxo.vout === input.vout
    )
  )

  const ordinalFound = allOrdinals?.find(
    (o) => ordinal?.txid === o.utxo.txid && ordinal?.vout === o.utxo.vout
  )

  const isInscription = butterfly.outputs[index]?.type === "inscription"

  const contentType = rune
    ? CARD_TYPES.RUNES
    : isBrc20
    ? "BRC-20"
    : isInscription && ordinalFound?.contentType
    ? ordinalFound.contentType
    : CARD_TYPES.BTC

  const colorType = rune
    ? CARD_TYPES_COLOR.RUNES
    : isInscription
    ? isBrc20
      ? CARD_TYPES_COLOR.BRC20
      : CARD_TYPES_COLOR.INSCRIPTIONS
    : CARD_TYPES_COLOR.BTC

  const secondaryColorType = rune
    ? CARD_TYPES_COLOR_SECONDARY.RUNES
    : isInscription
    ? isBrc20
      ? CARD_TYPES_COLOR_SECONDARY.BRC20
      : CARD_TYPES_COLOR_SECONDARY.INSCRIPTIONS
    : CARD_TYPES_COLOR_SECONDARY.BTC

  const type = butterfly.outputs[index]?.type

  const hasSomeSigned = Boolean(
    psbtSigned.inputsSigned.find((i) =>
      butterfly.inputs.find(
        (input) => input.txid === i.txid && input.vout === i.vout
      )
    )
  )

  const isOrdinalsInscription = butterfly.outputs[index]?.type === "inscription"

  if (butterfly.outputs[index]?.type === "OP RETURN" && rune) {
    return (
      <div className="relative min-w-52 bg-transparent rounded-xl  flex flex-col gap-3 items-center justify-center">
        <div className="absolute top-[-3px] right-[-3px] pointer-events-none">
          <Category color={CARD_TYPES_COLOR.OP_RETURN} type={"OP R"} />
        </div>

        <div
          className="absolute inset-0 rounded-xl z-[-1]"
          style={{
            margin: "-3px", // Adjust to match the border thickness
            padding: "4px", // Adjust to match the border thickness
            background: `linear-gradient(180deg, ${CARD_TYPES_COLOR.OP_RETURN} 0%, ${CARD_TYPES_COLOR.OP_RETURN} 50%, ${CARD_TYPES_COLOR_SECONDARY.OP_RETURN} 95%, ${CARD_TYPES_COLOR_SECONDARY.OP_RETURN} 115%)`,
            borderRadius: "inherit", // Ensure the radius matches the card's radius
          }}
        >
          <div
            className="w-full h-full rounded-xl bg-zinc-900"
            style={{
              borderRadius: "inherit",
            }}
          ></div>
        </div>

        <>
          <div className="w-full justify-center items-center flex text-center text-[52px] pointer-events-none mt-[-60px]">
            <div className="mt-6 min-w-[38px] h-[38px] rounded bg-gray-800 border-[1px] border-gray-600 flex justify-center items-center text-[20px]">
              {rune.symbol}
            </div>
          </div>
          <div className="flex flex-col gap-[4px] justify-center items-center">
            <span className="mt-3 pointer-events-none text-[12px] font-bold">
              {rune?.spacedRune}
            </span>
            <span className="pointer-events-none text-[10px]">
              {rune?.runeid}
            </span>
          </div>

          <div className="mt-4 mb-[-26px]">
            <span className="text-[16px] text-bold">Runestone</span>
          </div>
        </>
      </div>
    )
  }

  if (type === "platformFee" || type === "referrer") {
    return (
      <div
        className="relative min-w-52 bg-transparent rounded-xl  flex flex-col gap-3 items-center justify-center opacity-60"
        data-tooltip-id={"platformFee"}
        data-tooltip-content={
          type === "platformFee" ? "Satonomy fee" : "Referrer fee"
        }
        data-tooltip-place="right"
      >
        <Tooltip
          id={"platformFee"}
          className="max-w-[250px] bg-gray-600"
          style={{ backgroundColor: "#292929", color: "white" }}
        />
        <div className="absolute top-[-3px] right-[-3px] pointer-events-none">
          <Category color={colorType} type={contentType} />
        </div>
        <div className="absolute top-4 right-[-120px] flex flex-col gap-4 justify-center items-end">
          <div className="opacity-30 text-[]">
            <div>OUTPUT #{index}</div>
          </div>

          <div className="opacity-30 hover:opacity-100 relative">
            <div className="my-[-4px] py-1 bg-transparent max-w-[110px] text-[14px] text-end p-0 focus:max-w-[550px] focus:min-w-[550px]  transition-all duration-300 focus:ring-0 focus:border-[#82828280] border-transparent focus:border-2 rounded-[4px] outline-none focus:bg-gradient-to-b focus:from-[#29292950] focus:to-[#292929] focus:px-2">
              {butterfly.outputs?.[index]?.address
                ? formatAddress(butterfly.outputs[index]?.address)
                : "ADDRESS 📝"}
            </div>

            <input
              disabled
              id="address"
              placeholder="Address"
              value={butterfly.outputs[index]?.address}
              onChange={(e) => {
                setButterfly((prev) => {
                  const outputs = JSON.parse(JSON.stringify(prev.outputs))
                  outputs[index].address = e.target.value
                  return { ...prev, outputs }
                })
              }}
              onFocus={() => setAddressInputFocused(true)}
              onBlur={() => setAddressInputFocused(false)}
              className={`my-[-4px] py-1 bg-transparent max-w-[110px] text-[14px] text-end p-0 focus:max-w-[550px] focus:min-w-[550px]  transition-all duration-300 focus:ring-0 focus:border-[#82828280]  border-transparent focus:border-2 rounded-[4px] outline-none focus:px-2 ${
                addressInputFocused ? "flex" : "hidden"
              }`}
            />
          </div>
        </div>
        <Image
          className="w-14 h-14 pointer-events-none"
          src="/bitcoin.png"
          alt="Bitcoin"
          width={54}
          height={54}
          loading="lazy"
        />
        Bitcoin
        <div className="text-center text-white font-medium whitespace-nowrap flex flex-col justify-center items-center ">
          <input
            disabled
            type="number"
            value={
              rune
                ? butterfly.outputs[index].runesValue
                : butterfly.outputs[index].value || ""
            }
            onChange={(e) => {
              setButterfly((prev) => {
                const outputs = JSON.parse(JSON.stringify(prev.outputs))
                if (rune) {
                  outputs[index].runesValue = Number(e.target.value)
                } else {
                  outputs[index].value = Number(e.target.value)
                }
                return { ...prev, outputs }
              })
            }}
            placeholder="0"
            className="ml-2 bg-transparent text-[20px] border text-center outline-none border-transparent w-24 h-12"
          />{" "}
          <div className="mt-[-12px] text-[12px]">
            {rune?.symbol || "sats"}{" "}
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-xl z-[-1]"
          style={{
            margin: "-3px", // Adjust to match the border thickness
            padding: "4px", // Adjust to match the border thickness
            background: `linear-gradient(180deg, ${colorType} 0%, ${colorType} 50%, ${secondaryColorType} 95%, ${secondaryColorType} 115%)`,
            borderRadius: "inherit", // Ensure the radius matches the card's radius
          }}
        >
          <div
            className="w-full h-full rounded-xl bg-zinc-900"
            style={{
              borderRadius: "inherit",
            }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative max-w-52 min-w-52 bg-transparent rounded-xl  flex flex-col gap-3 items-center justify-center">
      <div className="absolute top-[-3px] right-[-3px] pointer-events-none">
        <Category color={colorType} type={contentType} />
      </div>
      <div className="absolute top-4 right-[-120px] flex flex-col gap-4 justify-center items-end">
        <div className="opacity-30 text-[]">
          <div>OUTPUT #{index}</div>
        </div>

        <div className="opacity-30 hover:opacity-100 relative">
          {!addressInputFocused && (
            <div
              onMouseEnter={onInputFocus}
              className="my-[-4px] py-1 bg-transparent max-w-[110px] text-[14px] text-end p-0 focus:max-w-[550px] focus:min-w-[550px]  transition-all duration-300 focus:ring-0 focus:border-[#82828280] border-transparent focus:border-2 rounded-[4px] outline-none focus:bg-gradient-to-b focus:from-[#29292950] focus:to-[#292929] focus:px-2"
            >
              {butterfly.outputs?.[index]?.address
                ? formatAddress(butterfly.outputs[index]?.address)
                : "ADDRESS 📝"}
            </div>
          )}

          <input
            disabled={hasSomeSigned}
            id="address"
            placeholder="Type an address"
            value={butterfly.outputs[index]?.address}
            onChange={(e) => {
              setButterfly((prev) => {
                const outputs = JSON.parse(JSON.stringify(prev.outputs))
                outputs[index].address = e.target.value
                return { ...prev, outputs }
              })
            }}
            onFocus={() => setAddressInputFocused(true)}
            onBlur={() => setAddressInputFocused(false)}
            className={`hover:border-2 hover:border-[#82828280] hover:px-2 hover:min-w-[550px] my-[-4px] py-1 bg-transparent max-w-[110px] text-[14px] text-end p-0 focus:max-w-[550px] focus:min-w-[550px]  transition-all duration-300 focus:ring-0 focus:border-[#82828280]  border-transparent focus:border-2 rounded-[4px] outline-none bg-gradient-to-b from-[#29292950] to-[#292929] focus:px-2 ${
              addressInputFocused ? "flex" : "hidden"
            }`}
          />
        </div>

        {!hasSomeSigned && !isOrdinalsInscription && (
          <button className=" opacity-30 hover:opacity-100" onClick={onClone}>
            CLONE 📋
          </button>
        )}

        {!hasSomeSigned && !isOrdinalsInscription && (
          <button
            className=" opacity-30 hover:opacity-100"
            onClick={() => {
              onRemove?.(index)
            }}
          >
            REMOVE 🗑️
          </button>
        )}
      </div>
      {rune && (
        <>
          <div className="w-full justify-center items-center flex text-center text-[52px] pointer-events-none mt-[-60px]">
            <div className="mt-6 min-w-[38px] h-[38px] rounded bg-gray-800 border-[1px] border-gray-600 flex justify-center items-center text-[20px]">
              {rune.symbol}
            </div>
          </div>
          <div className="flex flex-col gap-[4px] justify-center items-center">
            <span className="mt-3 pointer-events-none text-[12px] font-bold">
              {rune?.spacedRune}
            </span>
            <span className="pointer-events-none text-[10px]">
              {rune?.runeid}
            </span>
          </div>
        </>
      )}
      {!rune && !isInscription && (
        <>
          <Image
            className="w-14 h-14 pointer-events-none"
            src="/bitcoin.png"
            alt="Bitcoin"
            width={54}
            height={54}
            loading="lazy"
          />
          Bitcoin
        </>
      )}

      {ordinalFound && ordinal && isInscription && (
        <>
          <OrdinalRendering
            utxo={ordinal}
            setIsBrc20={(string: string) => setIsBrc20(string)}
          />
          {!Boolean(isBrc20) && (
            <span className="text-[10px]">{ordinalFound.contentType}</span>
          )}
        </>
      )}

      <div className="text-center text-white font-medium whitespace-nowrap flex flex-col justify-center items-center ">
        <input
          disabled={hasSomeSigned}
          type="number"
          value={
            rune
              ? butterfly.outputs[index].runesValue
              : butterfly.outputs[index].value || ""
          }
          onChange={(e) => {
            setButterfly((prev) => {
              const outputs = JSON.parse(JSON.stringify(prev.outputs))
              if (rune) {
                outputs[index].runesValue = Number(e.target.value)
              } else {
                outputs[index].value = Number(e.target.value)
              }
              return { ...prev, outputs }
            })
          }}
          placeholder="0"
          className="ml-[10px] bg-transparent text-[20px] border text-center outline-none border-transparent w-[140px] h-12"
        />{" "}
        <div className="mt-[-12px] text-[12px]">{rune?.symbol || "sats"} </div>
      </div>
      {Boolean(butterfly.outputs[index].value) && !rune && (
        <div className="opacity-50 text-[12px]">
          $
          {formatNumber(
            ((butterfly.outputs[index].value || 1) / 100000000) * btcUsdPrice,
            0,
            8,
            false,
            true
          )}
        </div>
      )}
      {rune && (
        <div className="absolute bottom-[40px] flex flex-col justify-center items-center gap-1">
          <input
            type="number"
            value={butterfly.outputs[index].value}
            onChange={(e) => {
              setButterfly((prev) => {
                const outputs = JSON.parse(JSON.stringify(prev.outputs))
                outputs[index].value = Number(e.target.value)
                return { ...prev, outputs }
              })
            }}
            placeholder="0"
            className="ml-[12px] bg-transparent text-[16px] border text-center outline-none border-transparent w-20 mb-[-12px]"
          />
          sats
        </div>
      )}
      <div
        className="absolute inset-0 rounded-xl z-[-1]"
        style={{
          margin: "-3px", // Adjust to match the border thickness
          padding: "4px", // Adjust to match the border thickness
          background: `linear-gradient(180deg, ${colorType} 0%, ${colorType} 50%, ${secondaryColorType} 95%, ${secondaryColorType} 115%)`,
          borderRadius: "inherit", // Ensure the radius matches the card's radius
        }}
      >
        <div
          className="w-full h-full rounded-xl bg-zinc-900"
          style={{
            borderRadius: "inherit",
          }}
        ></div>
      </div>
    </div>
  )
}

export const CardOutputMobile = ({
  onRemove,
  index,
}: {
  onRemove: (index: number) => void
  index: number
}) => {
  const btcUsdPrice = useRecoilValue(btcPriceAtom)
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom)

  const [addressInputFocused, setAddressInputFocused] = useState(false)
  const onInputFocus = () => {
    setAddressInputFocused(true)
    document.getElementById("address")?.focus()
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!addressInputFocused) {
        document.removeEventListener("click", handleClick)
      }
      if (e.target instanceof HTMLElement && !e.target.closest("#address")) {
        setAddressInputFocused(false)
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [addressInputFocused])

  return (
    <div className="w-[100px] h-[100px] bg-zinc-900 rounded-xl border-[3px] border-zinc-600 flex flex-col items-center justify-center pt-2">
      <div className="absolute top-0 right-0 pointer-events-none ">
        <Category color={CARD_TYPES_COLOR.BTC} type={CARD_TYPES.BTC} />
      </div>
      <div
        className={`absolute top-0 right-[-28px] flex-col gap-4 justify-center items-end ${
          butterfly.outputs[index]?.type === "platformFee" ||
          butterfly.outputs[index]?.type === "referrer" ||
          butterfly.outputs[index]?.type === "OP RETURN"
            ? "hidden"
            : "flex"
        }`}
      >
        <button
          className=" opacity-30 hover:opacity-100"
          onClick={() => {
            onRemove?.(index)
          }}
        >
          🗑️
        </button>

        {!addressInputFocused && (
          <div
            onClick={onInputFocus}
            className="my-[-4px] py-1 bg-transparent max-w-[110px] text-[14px] text-end p-0 cursor-pointer opacity-50 hover:opacity-100"
          >
            📝
          </div>
        )}

        <div className="opacity-30 hover:opacity-100 relative">
          <input
            id="address"
            placeholder="Address"
            value={butterfly.outputs[index].address}
            onChange={(e) => {
              setButterfly((prev) => {
                const outputs = JSON.parse(JSON.stringify(prev.outputs))
                outputs[index].address = e.target.value
                return { ...prev, outputs }
              })
            }}
            onFocus={() => setAddressInputFocused(true)}
            onBlur={() => setAddressInputFocused(false)}
            className={`my-[-4px] py-1 bg-transparent w-[110px] text-[14px] text-end p-0 max-w-[300px] min-w-[300px]  transition-all duration-300 focus:ring-0 border-[#82828280]  border-2 rounded-[4px] outline-none bg-gradient-to-b from-[#29292950] to-[#292929] focus:px-2 ${
              addressInputFocused ? "flex" : "hidden"
            }`}
          />
        </div>
      </div>
      <Image
        src="/bitcoin.png"
        alt="Bitcoin"
        width={16}
        height={16}
        className="mb-[-14px] pointer-events-none"
        loading="lazy"
      />

      <div className="mt-1 text-[12px] text-center text-white font-medium whitespace-nowrap flex justify-center items-center ">
        <input
          value={butterfly.outputs[index].value || ""}
          onChange={(e) => {
            setButterfly((prev) => {
              const outputs = JSON.parse(JSON.stringify(prev.outputs))
              outputs[index].value = Number(e.target.value)
              return { ...prev, outputs }
            })
          }}
          placeholder="0"
          className="text-[12px] bg-transparent border text-end outline-none  w-[50px] h-10 border-transparent mb-[-10px] ml-[-19px]" //
        />{" "}
        <div className=" text-[10px] pl-1 mb-[-10px]">sats</div>
      </div>

      {Boolean(btcUsdPrice) && Boolean(butterfly.outputs[index].value) ? (
        <div className="text-[12px]">
          $
          {formatNumber(
            ((butterfly.outputs[index].value || 1) / 100000000) * btcUsdPrice,
            0,
            8,
            false,
            true
          )}
        </div>
      ) : null}
    </div>
  )
}

export const CardOutputOption = ({
  action,
}: {
  action: RunesUtxo | undefined | null | OrdinalData
}) => {
  const { accounts } = useAccounts()
  const account = accounts?.length > 1 ? accounts[1] : accounts[0]

  const [butterfly, setButterfly] = useRecoilState(butterflyAtom)
  const runes = useRecoilValue(runesAtom)
  const setConfig = useSetRecoilState(configsAtom)

  const runeIndex = runes?.findIndex((r) =>
    butterfly.inputs.find((i) =>
      r.utxos.find((u) => u.location === `${i.txid}:${i.vout}`)
    )
  )
  const [isBrc20, setIsBrc20] = useState<undefined | string>(undefined)

  const ordinals = useRecoilValue(ordinalsAtom)
  // const allOrdinals = ordinals?.flatMap((o) => o.inscription) || []

  // const ordinal = butterfly.inputs.find((input) =>
  //   allOrdinals?.find(
  //     (o) => o.utxo.txid === input.txid && o.utxo.vout === input.vout
  //   )
  // )

  // const ordinalFound = allOrdinals?.find(
  //   (o) => ordinal?.txid === o.utxo.txid && ordinal?.vout === o.utxo.vout
  // )
  const isOrdinal = (action as any)?.contentType

  const ordinalFound = isOrdinal ? (action as OrdinalData) : undefined

  const rune = action ? runes?.[runeIndex!] : null

  const contentType = isBrc20
    ? "BRC-20"
    : rune
    ? CARD_TYPES.RUNES
    : ordinalFound?.contentType || CARD_TYPES.BTC

  const colorType =
    rune && !ordinalFound
      ? CARD_TYPES_COLOR.RUNES
      : ordinalFound
      ? CARD_TYPES_COLOR.INSCRIPTIONS
      : CARD_TYPES_COLOR.BTC

  const secondaryColorType =
    rune && !ordinalFound
      ? CARD_TYPES_COLOR_SECONDARY.RUNES
      : ordinalFound
      ? CARD_TYPES_COLOR_SECONDARY.INSCRIPTIONS
      : CARD_TYPES_COLOR_SECONDARY.BTC

  const configs = useRecoilValue(configsAtom)

  const onSelectOutput = () => {
    setButterfly((prev) => {
      const outputs = JSON.parse(JSON.stringify(prev.outputs))
      const rune = runes?.[runeIndex!]

      const runeAmount = rune?.utxos.find((u) =>
        prev.inputs.find((i) => u.location === `${i.txid}:${i.vout}`)
      )?.formattedBalance

      const inputRunesTotalAmount = prev.inputs.reduce(
        (acc, cur) =>
          acc +
          Number(
            runes?.[runeIndex!]?.utxos.find(
              (u) => u.location === `${cur.txid}:${cur.vout}`
            )?.formattedBalance || "0"
          ),
        0
      )

      const outputRunesTotalAmount = prev.outputs.reduce(
        (acc, cur) => acc + (cur?.runesValue || 0),
        0
      )

      const walletForOutput =
        account || butterfly.inputs.find((i) => i.wallet)?.wallet || ""

      if (ordinalFound) {
        outputs.push({
          address: walletForOutput,
          value: 546,
          type: "inscription",
          inscription: ordinalFound,
          vout: outputs.length + 1,
        })
        return { ...prev, outputs }
      }

      if (rune && action) {
        outputs.push({
          address: walletForOutput,
          value: 546,
          type: "runes",
          rune: rune,
          runesValue: inputRunesTotalAmount - outputRunesTotalAmount,
          vout: outputs.length + 1,
        })
      } else {
        outputs.push({
          value:
            prev.inputs.reduce((acc, cur) => acc + cur.value, 0) -
              prev.outputs.reduce((acc, cur) => acc + cur.value, 0) >
            0
              ? prev.inputs.reduce((acc, cur) => acc + cur.value, 0) -
                prev.outputs.reduce((acc, cur) => acc + cur.value, 0) -
                configs.feeCost
              : 1,
          vout: prev.outputs.length,
          address: walletForOutput,
        })
      }

      return { ...prev, outputs }
    })

    setConfig((prev) => {
      return { ...prev, isOutputDeckOpen: false }
    })
  }

  return (
    <div className="h-[320px] relative min-w-52 bg-transparent rounded-xl  flex flex-col gap-3 items-center justify-center">
      <div className="absolute top-[-3px] right-[-3px] pointer-events-none">
        <Category color={colorType} type={contentType} />
      </div>

      {rune && (
        <>
          <div className="w-full justify-center items-center flex text-center text-[52px] pointer-events-none mt-[-60px]">
            <div className="mt-6 min-w-[38px] h-[38px] rounded bg-gray-800 border-[1px] border-gray-600 flex justify-center items-center text-[20px]">
              {rune.symbol}
            </div>
          </div>
          <div className="flex flex-col gap-[4px] justify-center items-center">
            <span className="mt-3 pointer-events-none text-[12px] font-bold">
              {rune?.spacedRune}
            </span>
            <span className="pointer-events-none text-[10px]">
              {rune?.runeid}
            </span>
          </div>
        </>
      )}
      {!rune && !ordinalFound && (
        <>
          <Image
            className="w-14 h-14 pointer-events-none"
            src="/bitcoin.png"
            alt="Bitcoin"
            width={54}
            height={54}
            loading="lazy"
          />
          Bitcoin
        </>
      )}

      {ordinalFound && (
        <>
          <OrdinalRendering
            utxo={ordinalFound.utxo as any}
            setIsBrc20={(string: string) => setIsBrc20(string)}
          />
          {!Boolean(isBrc20) && (
            <span className="text-[10px]">{ordinalFound.contentType}</span>
          )}
        </>
      )}

      <button
        onClick={onSelectOutput}
        className={`text-bold absolute bottom-4 text-[16px] rounded px-8 py-1 from-[#ffa750] to-[#e8c03f] bg-gradient-to-r hover:from-[#ffa750] hover:to-[#e8c03f] text-white`}
      >
        SELECT
      </button>

      <div
        className="absolute inset-0 rounded-xl z-[-1]"
        style={{
          margin: "-3px", // Adjust to match the border thickness
          padding: "4px", // Adjust to match the border thickness
          background: `linear-gradient(180deg, ${colorType} 0%, ${colorType} 50%, ${secondaryColorType} 95%, ${secondaryColorType} 115%)`,
          borderRadius: "inherit", // Ensure the radius matches the card's radius
        }}
      >
        <div
          className="w-full h-full rounded-xl bg-zinc-900"
          style={{
            borderRadius: "inherit",
          }}
        ></div>
      </div>
    </div>
  )
}
