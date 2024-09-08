export const CARD_TYPES: Record<string, string> = {
  RUNES: "Runes",
  BTC: "Bitcoin",
};

export const CARD_TYPES_COLOR: Record<string, string> = {
  BRC20: "#ff085f",
  RUNES: "#FF8A00",
  BTC: "#52525B",
  INSCRIPTIONS: "#FF61F6",
};

export const CARD_TYPES_COLOR_SECONDARY: Record<string, string> = {
  BRC20: "#ff639a",
  RUNES: "#FAF22E",
  BTC: "#818189",
  INSCRIPTIONS: "#FF95F9",
};

export const Category = ({ color, type }: { color: string; type: string }) => {
  return (
    <>
      <svg
        width="78"
        height="28"
        viewBox="0 0 78 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.6642 20H20H67C71.4183 20 75 23.5817 75 28H78V20V8C78 3.58172 74.4183 0 70 0H20H0V3C3.46676 3 6.5536 4.83209 7.69269 7.56569L10.9714 15.434C12.1096 18.1677 15.1965 20 18.6642 20Z"
          fill={color}
        />
      </svg>
      <div
        className="z-4 absolute top-[1px] right-4 text-[12px] pointer-events-none font-bold capitalize"
        style={{
          maxWidth: "50px", // Ensures the maximum width is 78px
          whiteSpace: "nowrap", // Prevents the text from wrapping to the next line
          overflow: "hidden", // Hides overflow text
          textOverflow: "ellipsis", // Adds the '...' when the text overflows
        }}
      >
        {type.split("/")[0]}
      </div>
    </>
  );
};
