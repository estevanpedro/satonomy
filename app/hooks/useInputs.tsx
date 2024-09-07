import { generateBowtiePath } from "@/app/components/Card";
import { Butterfly } from "@/app/recoil/butterflyAtom";
import { runesAtom } from "@/app/recoil/runesAtom";
import { use } from "react";
import { useRecoilValue } from "recoil";

export const useInputs = ({
  butterfly,
  totalHeight,
  inputsCount,
  height,
}: {
  butterfly: Butterfly;
  totalHeight: number;
  inputsCount: number;
  height: number;
}) => {
  const runes = useRecoilValue(runesAtom);
  const paths = [];

  const inputX = 10;
  const outputX = 371.5;
  const outputY = totalHeight / 2;

  for (let i = 0; i < inputsCount; i++) {
    let inputY = height / 2 + height * i;

    const pathData = generateBowtiePath(inputX, inputY, outputX, outputY);

    const strangeness = butterfly.inputs[i].value / 1000;
    const strangenessAdjusted =
      strangeness > 4 ? 4 : strangeness < 2 ? 2 : strangeness;

    const isEven = inputsCount % 2 !== 0;
    const mode = Math.floor(inputsCount / 2);

    const txid = butterfly.inputs[i].txid;
    const utxo = runes?.find((r) =>
      r.utxos.find((u) => u.location === `${txid}:${butterfly.inputs[i].vout}`)
    );
    const isRune = utxo ? true : false;

    const stop1Color = isRune ? "#FF8A00" : "#ff7e5f";
    const stop2Color = isRune ? "#FAF22E" : "#feb47b";

    const stroke = isEven && mode === i ? stop2Color : `url(#gradient-${i})`;

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
    );
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
    );
  }

  return paths;
};
