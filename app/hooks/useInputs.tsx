import { generateBowtiePath } from "@/app/components/Card"
import { Butterfly } from "@/app/recoil/butterflyAtom"
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

  const ordinal = butterfly.inputs.find((input) =>
    allOrdinals?.find(
      (o) => o.utxo.txid === input.txid && o.utxo.vout === input.vout
    )
  )
  const paths = []

  const inputX = 10
  const outputX = 371.5
  const outputY = totalHeight / 2

  const butterflyIsOk = !isNotReady && !isConfirmDisabled

  for (let i = 0; i < inputsCount; i++) {
    let inputY = height / 2 + height * i

    const pathData = generateBowtiePath(inputX, inputY, outputX, outputY)

    const strangeness = butterfly.inputs[i].value / 1000
    const strangenessAdjusted =
      strangeness > 4 ? 4 : strangeness < 2 ? 2 : strangeness

    const isEven = inputsCount % 2 !== 0
    const mode = Math.floor(inputsCount / 2)

    const txid = butterfly.inputs[i].txid
    const utxo = runes?.find((r) =>
      r.utxos?.find((u) => u.location === `${txid}:${butterfly.inputs[i].vout}`)
    )
    const isRune = utxo ? true : false
    const isInscription =
      butterfly.inputs[i]?.txid === ordinal?.txid &&
      butterfly.inputs[i]?.vout === ordinal?.vout
    const stop1Color =
      isRune && !isInscription
        ? "#FF61F6"
        : isInscription
        ? "#6839B6"
        : "#FF8A00"
    const stop2Color =
      isRune && !isInscription
        ? "#FF95F9"
        : isInscription
        ? "#3478F7"
        : "#FAF22E"

    const stroke = isEven && mode === i ? stop2Color : `url(#gradient-${i})`

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
      </svg>
    )
    paths.push(
      <svg
        key={i}
        className="absolute top-0 left-0 w-full h-full z-[-1]"
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
        />
      </svg>
    )
    paths.push(
      <div
        className="absolute right-[-12px] transform translate-y-[-50%]"
        style={{ top: "calc(50% + 40px)" }}
      >
        {!isNotReady && isConfirmDisabled && !butterflyIsOk && (
          <div
            className="mb-[80px] bg-black rounded-full overflow-hidden"
            style={{ width: "36px", height: "36px" }}
          >
            <Image
              src="/satonomy-logo.png"
              alt="Satonomy"
              width={36}
              height={36}
              className="object-cover scale-110 mt-[-4px]" // Slightly scale the image up
            />
          </div>
        )}

        {butterflyIsOk && !isConfirmDisabled && (
          <div
            className="mb-[80px] bg-black rounded-full overflow-hidden"
            style={{ width: "36px", height: "36px" }}
          >
            <Image
              src="/satonomy-green.png"
              alt="Satonomy"
              width={36}
              height={36}
              className="object-cover scale-110 mt-[-4px]" // Slightly scale the image up
            />
          </div>
        )}
        {isConfirmDisabled && !butterflyIsOk && isNotReady && (
          <div
            className="mb-[80px] bg-black rounded-full overflow-hidden"
            style={{ width: "36px", height: "36px" }}
          >
            <Image
              src="/satonomy-red.png"
              alt="Satonomy"
              width={36}
              height={36}
              className="object-cover scale-110 mt-[-4px]" // Slightly scale the image up
            />
          </div>
        )}
      </div>
      // <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      // <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
    )

    paths.push(
      <div
        className="absolute right-[-12px] transform translate-y-[-50%]"
        style={{ top: "calc(50% + 40px)" }}
      >
        {!isNotReady && isConfirmDisabled && !butterflyIsOk && (
          <Image
            src="/satonomy-logo.png"
            alt="Satonomy"
            width={36}
            height={36}
            className="mb-[80px] animate-ping-3 duration-10000"
          />
        )}

        {butterflyIsOk && !isConfirmDisabled && (
          <Image
            src="/satonomy-green.png"
            alt="Satonomy"
            width={36}
            height={36}
            className="mb-[80px] animate-ping-3 duration-10000"
          />
        )}
        {isConfirmDisabled && !butterflyIsOk && isNotReady && (
          <Image
            src="/satonomy-red.png"
            alt="Satonomy"
            width={36}
            height={36}
            className="mb-[80px] animate-ping-3 opacity-75 duration-10000"
          />
        )}
      </div>
    )
  }

  return paths
}
