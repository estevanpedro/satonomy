import { generateBowtiePath } from "@/app/components/Card"
import { Butterfly } from "@/app/recoil/butterflyAtom"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { runesAtom } from "@/app/recoil/runesAtom"
import { useRecoilValue } from "recoil"

export const useOutputs = ({
  butterfly,
  totalHeight,
  outputsCount,
  height,
  inputHeight,
  inputsCount,
}: {
  butterfly: Butterfly
  totalHeight: number
  outputsCount: number
  height: number
  inputHeight: number
  inputsCount: number
}) => {
  const configs = useRecoilValue(configsAtom)

  const paths = []

  const inputX = 184
  const outputX = -174
  const outputY = inputHeight / 2

  for (let i = 0; i < outputsCount; i++) {
    const isOpReturn = butterfly.outputs[i].type === "OP RETURN"

    if (isOpReturn) {
      continue
    }
    let inputY = height / 2 + height * i

    const pathData = generateBowtiePath(inputX, inputY, outputX, outputY)

    const strangeness = butterfly.outputs[i].value / 1000
    const strangenessAdjusted =
      strangeness > 4 ? 4 : strangeness < 2 ? 2 : strangeness

    const isEven = inputsCount % 2 !== 0
    const mode = Math.floor(inputsCount / 2)

    const isRune = butterfly.outputs[i]?.type === "runes"
    const isInscription = butterfly.outputs[i]?.type === "inscription"

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
    const stroke = isEven && mode === i ? stop2Color : `url(#gradient-2-${i})`

    if (butterfly?.outputs?.length < 20) {
      paths.push(
        <svg
          key={`i-${i}`}
          style={{ animationDelay: `${i * 2}s` }}
          className={`absolute top-0 left-0 w-full h-full z-[-1] animate-ping-2`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 200 ${totalHeight}`}
          overflow={"visible"}
        >
          <defs>
            <linearGradient
              id={`gradient-2-${i}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                style={{ stopColor: stop2Color, stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: stop1Color, stopOpacity: 1 }}
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
        className="absolute top-0 left-0 w-full h-full z-[-1] grow-in-left-to-right svg-transition-left-to-right"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 200 ${totalHeight}`}
        overflow={"visible"}
      >
        <defs>
          <linearGradient
            id={`gradient-2-${i}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: stop2Color, stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: stop1Color, stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>
        <path
          d={pathData}
          stroke={stroke}
          strokeWidth={strangenessAdjusted}
          fill="none"
          className="grow-in-left-to-right svg-transition-left-to-right"
        />
      </svg>
    )
  }

  const feePathDataYnputY = -130

  const feePathData = generateBowtiePath(
    inputX,
    feePathDataYnputY,
    outputX,
    outputY
  )
  const feeRateLessThan2 =
    Boolean(configs.feeRateEstimated < 2) &&
    butterfly.outputs.length > 0 &&
    butterfly.inputs.length > 0
  paths.unshift(
    <svg
      style={{ animationDelay: `${paths.length}s` }}
      key="fee-2"
      className="absolute top-0 left-0 w-full h-full z-[-1] animate-ping-2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 200 ${totalHeight}`}
      overflow={"visible"}
    >
      <defs>
        <linearGradient id={`gradient-2-000`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#FAF22E", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#FF8A00", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <path
        d={feePathData}
        stroke={`url(#gradient-2-000)`}
        strokeWidth={"3"}
        fill="none"
      />
      <path
        d={feePathData}
        stroke={`url(#gradient-2-000)`}
        strokeWidth={"6"}
        fill="none"
        opacity={0.4}
      />
    </svg>
  )

  paths.unshift(
    <svg
      key="fee"
      className="absolute top-0 left-0 w-full h-full z-[-1] grow-in-left-to-right svg-transition-left-to-right"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 200 ${totalHeight}`}
      overflow={"visible"}
    >
      <defs>
        <linearGradient id={`gradient-2-000`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            offset="0%"
            style={{
              stopColor: feeRateLessThan2 ? "#EF4444" : "#FAF22E",
              stopOpacity: 1,
            }}
          />
          <stop
            offset="100%"
            style={{
              stopColor: feeRateLessThan2 ? "#EF4444" : "#FF8A00",
              stopOpacity: 1,
            }}
          />
        </linearGradient>
      </defs>
      <path
        d={feePathData}
        stroke={`url(#gradient-2-000)`}
        strokeWidth={"1"}
        fill="none"
        className="grow-in-left-to-right svg-transition-left-to-right"
      />
    </svg>
  )

  return paths
}
