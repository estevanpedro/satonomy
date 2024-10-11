import { generateBowtiePath } from "@/app/components/Card"
import { Butterfly } from "@/app/recoil/butterflyAtom"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { runesAtom } from "@/app/recoil/runesAtom"
import Image from "next/image"
import { use } from "react"
import { useRecoilValue } from "recoil"

export const useInputs = ({
  butterfly,
  totalHeight,
  inputsCount,
  height,
  isConfirmDisabled,
  isNotReady,
}: {
  butterfly: Butterfly
  totalHeight: number
  inputsCount: number
  height: number
  isConfirmDisabled: boolean
  isNotReady: boolean
}) => {
  const runes = useRecoilValue(runesAtom)
  const ordinals = useRecoilValue(ordinalsAtom)
  const allOrdinals = ordinals?.flatMap((o) => o.inscription) || []
  const configs = useRecoilValue(configsAtom)

  const ordinal = butterfly?.inputs?.find((input) =>
    allOrdinals?.find(
      (o) => o?.utxo?.txid === input.txid && o.utxo.vout === input.vout
    )
  )
  const paths = []

  const inputX = 10
  const outputX = 371.5
  const outputY = totalHeight / 2

  const butterflyIsOk = !isNotReady && !isConfirmDisabled

  const feeRateOk = configs.feeRateEstimated > 2

  for (let i = 0; i < inputsCount; i++) {
    let inputY = height / 2 + height * i

    const pathData = generateBowtiePath(inputX, inputY, outputX, outputY)

    const strangeness = butterfly.inputs[i].value / 1000
    const strangenessAdjusted =
      strangeness > 4 ? 4 : strangeness < 2 ? 2 : strangeness

    const isEven = inputsCount % 2 !== 0
    const mode = Math.floor(inputsCount / 2)

    const runesUTXO = runes?.find((r) =>
      r.utxos?.find(
        (u) =>
          u.location ===
          `${butterfly.inputs[i].txid}:${butterfly.inputs[i].vout}`
      )
    )

    const isRune = runesUTXO ? true : false
    const isInscription =
      butterfly.inputs[i]?.txid === ordinal?.txid &&
      butterfly.inputs[i]?.vout === ordinal?.vout

    const stop1Color = isRune
      ? "#FF61F6"
      : isInscription
      ? "#6839B6"
      : "#FF8A00"
    const stop2Color = isRune
      ? "#FF95F9"
      : isInscription
      ? "#3478F7"
      : "#FAF22E"

    const stroke = isEven && mode === i ? stop2Color : `url(#gradient-${i})`

    if (butterfly?.inputs?.length < 20) {
      paths.push(
        <svg
          key={`i-${i}`}
          style={{ animationDelay: `${i * 1}s` }}
          className="absolute top-0 left-0 w-full h-full z-[-1] animate-ping-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 200 ${totalHeight}`}
          overflow={"visible"}
        >
          <defs>
            <linearGradient
              id={`gradient-${i}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                style={{ stopColor: stop1Color, stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: stop2Color, stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>
          <path
            d={pathData}
            stroke={stroke}
            strokeWidth={strangenessAdjusted + 4}
            fill="none"
          />
          <path
            d={pathData}
            stroke={stroke}
            strokeWidth={strangenessAdjusted + 8}
            fill="none"
            opacity={0.4}
          />
        </svg>
      )
    }
    paths.push(
      <svg
        key={i}
        className="absolute top-0 left-0 w-full h-full z-[-1] grow-in svg-transition"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 200 ${totalHeight}`}
        overflow={"visible"}
      >
        <defs>
          <linearGradient
            id={`gradient-${i}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: stop1Color, stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: stop2Color, stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>
        <path
          d={pathData}
          stroke={stroke}
          strokeWidth={strangenessAdjusted}
          fill="none"
          className="grow-in svg-transition"
        />
      </svg>
    )
    paths.push(
      <div
        className="absolute right-[-12px] transform translate-y-[-50%] pointer-events-none"
        style={{ top: "calc(50% + 40px)" }}
      >
        {(!isNotReady && isConfirmDisabled && !butterflyIsOk) ||
          (((isConfirmDisabled && !butterflyIsOk && isNotReady) ||
            (!feeRateOk && Boolean(butterfly.outputs.length))) && (
            <div
              className="mb-[90px]  rounded-full overflow-hidden pointer-events-none bg-black"
              style={{ width: "36px", height: "36px" }}
            >
              <Image
                src="/satonomy-logo.png"
                alt="Satonomy"
                width={36}
                height={36}
                className="object-cover pointer-events-none" // Slightly scale the image up
              />
            </div>
          ))}
        {butterflyIsOk && !isConfirmDisabled && feeRateOk && (
          <div
            className="mb-[80px]  rounded-full overflow-hidden pointer-events-none"
            style={{ width: "36px", height: "36px" }}
          >
            <Image
              src="/satonomy-green-3.png"
              alt="Satonomy"
              width={36}
              height={36}
              className="object-cover pointer-events-none" // Slightly scale the image up
            />
          </div>
        )}
        {/* {((isConfirmDisabled && !butterflyIsOk && isNotReady) ||
          (!feeRateOk && Boolean(butterfly.outputs.length))) && (
          <div
            className="mb-[80px] rounded-full overflow-hidden pointer-events-none"
            style={{ width: "36px", height: "36px" }}
          >
            <Image
              src="/satonomy-red-2.png"
              alt="Satonomy"
              width={36}
              height={36}
              className="object-cover pointer-events-none" // Slightly scale the image up
            />
          </div>
        )} */}
      </div>
    )

    paths.push(
      <div
        className="absolute right-[-12px] transform translate-y-[-50%] pointer-events-none"
        style={{ top: "calc(50% + 40px)" }}
      >
        {!isNotReady && isConfirmDisabled && !butterflyIsOk && (
          <Image
            src="/satonomy-logo.png"
            alt="Satonomy"
            width={36}
            height={36}
            className="mb-[80px] animate-ping-3 duration-10000 pointer-events-none"
          />
        )}

        {butterflyIsOk && !isConfirmDisabled && feeRateOk && (
          <Image
            src="/satonomy-green.png"
            alt="Satonomy"
            width={36}
            height={36}
            className="mb-[80px] animate-ping-3 duration-10000 pointer-events-none"
          />
        )}
        {isConfirmDisabled && !butterflyIsOk && isNotReady && (
          <Image
            src="/satonomy-red.png"
            alt="Satonomy"
            width={36}
            height={36}
            className="mb-[80px] animate-ping-3 opacity-75 duration-10000 pointer-events-none"
          />
        )}
      </div>
    )
  }

  return paths
}
