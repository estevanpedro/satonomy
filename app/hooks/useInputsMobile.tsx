import { generateBowtiePath } from "@/app/components/Card";

export const useInputsMobile = ({
  butterfly,
  totalHeight,
  inputsCount,
  height,
}: {
  butterfly: any;
  totalHeight: number;
  inputsCount: number;
  height: number;
}) => {
  const paths = [];

  const inputX = 80;
  const outputX = 131;
  const outputY = totalHeight / 2;

  for (let i = 0; i < inputsCount; i++) {
    let inputY = height / 2 + height * i;

    const pathData = generateBowtiePath(inputX, inputY, outputX, outputY);

    const strangeness = butterfly.inputs[i].value / 1000;
    const strangenessAdjusted =
      strangeness > 4 ? 4 : strangeness < 2 ? 2 : strangeness;

    const isEven = inputsCount % 2 !== 0;
    const mode = Math.floor(inputsCount / 2);
    const stroke =
      isEven && mode === i ? "#feb47b" : `url(#gradient-${i}-mobile)`;

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
            id={`gradient-${i}-mobile`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "#ff7e5f", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#feb47b", stopOpacity: 1 }}
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
