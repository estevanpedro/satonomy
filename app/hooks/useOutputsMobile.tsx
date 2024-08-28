import { generateBowtiePath } from "@/app/components/Card";

export const useOutputsMobile = ({
  butterfly,
  totalHeight,
  outputsCount,
  height,
  inputHeight,
  inputsCount,
}: {
  butterfly: any;
  totalHeight: number;
  outputsCount: number;
  height: number;
  inputHeight: number;
  inputsCount: number;
}) => {
  const paths = [];

  const inputX = 37;
  const outputX = 0;
  const outputY = inputHeight / 2;

  for (let i = 0; i < outputsCount; i++) {
    let inputY = height / 2 + height * i;

    const pathData = generateBowtiePath(inputX, inputY, outputX, outputY);

    const strangeness = butterfly.outputs[i].value / 1000;
    const strangenessAdjusted =
      strangeness > 4 ? 4 : strangeness < 2 ? 2 : strangeness;

    const isEven = inputsCount % 2 !== 0;
    const mode = Math.floor(inputsCount / 2);
    const stroke =
      isEven && mode === i ? "#feb47b" : `url(#gradient-2-${i}-mobile)`;

    paths.push(
      <svg
        key={i}
        className="absolute top-0 left-0 w-full h-full z-[-1] mt-[-16px]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 120 ${totalHeight}`}
        overflow={"visible"}
      >
        <defs>
          <linearGradient
            id={`gradient-2-${i}-mobile`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "#feb47b", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#ff7e5f", stopOpacity: 1 }}
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

  const feePathDataYnputY = -20;

  const feePathData = generateBowtiePath(
    inputX,
    feePathDataYnputY,
    outputX,
    outputY
  );

  paths.unshift(
    <svg
      key={12321321321}
      className="absolute top-0 left-0 w-full h-full z-[-1] mt-[-16px]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 120 ${totalHeight}`}
      overflow={"visible"}
    >
      <defs>
        <linearGradient
          id={`gradient-2-mobile-fee`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" style={{ stopColor: "#feb47b", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#ff7e5f", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <path
        d={feePathData}
        stroke={`url(#gradient-2-mobile-fee)`}
        strokeWidth={"1"}
        fill="none"
      />
    </svg>
  );

  return paths;
};
