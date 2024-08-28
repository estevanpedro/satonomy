import {
  CARD_TYPES,
  CARD_TYPES_COLOR,
  CARD_TYPES_COLOR_SECONDARY,
  Category,
} from "@/app/components/CardType";
import { MempoolUTXO } from "@/app/recoil/utxoAtom";
import { formatAddress, formatNumber } from "@/app/utils/format";
import { useAccounts } from "@particle-network/btc-connectkit";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { OrdinalRendering } from "@/app/components/Ordinals";
import { runesAtom } from "@/app/recoil/runesAtom";
import { butterflyAtom } from "@/app/recoil/butterflyAtom";
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom";
import { btcPriceAtom } from "@/app/recoil/btcPriceAtom";
import { Tooltip } from "react-tooltip";

export function generateBowtiePath(
  inputX: number,
  inputY: number,
  outputX: number,
  outputY: number
): string {
  const controlPointX1 = (inputX + outputX) / 2;
  const controlPointY1 = inputY;
  const controlPointX2 = (inputX + outputX) / 2;
  const controlPointY2 = outputY;

  return `
      M ${inputX},${inputY}
      C ${controlPointX1},${controlPointY1} ${controlPointX2},${controlPointY2} ${outputX},${outputY}
    `;
}

export const EmptyCard = ({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <>
      <div
        className={`${className} w-52 h-[320px] rounded-xl flex flex-col gap-3 items-center justify-center text-4xl cursor-pointer border bg-zinc-950 relative`}
      >
        {className && (
          <div className="absolute top-0 -right-[136px] text-[16px] opacity-50 hover:opacity-100 focus:opacity-100 ">
            <select className="outline-none w-[110px]" value="Transfer">
              <option value="Transfer">Transfer</option>
              <option disabled>Bridge L2</option>
              <option disabled>Recursive Mint</option>
              <option disabled>Add redeemScript</option>
              <option disabled>Swap with Saturn</option>
              <option disabled>Stake with Arch</option>
            </select>
          </div>
        )}
        <div
          onClick={onClick}
          className={`${className} w-52 h-[320px] rounded-xl flex flex-col gap-3 items-center justify-center text-4xl cursor-pointer border bg-zinc-950 relative`}
        >
          +
        </div>
      </div>
    </>
  );
};

export const EmptyCardMobile = ({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <div
      onClick={onClick}
      className={`${className} w-[100px] h-[100px] rounded-xl flex flex-col gap-3 items-center justify-center text-4xl cursor-pointer border bg-zinc-950`}
    >
      +
    </div>
  );
};

export const Card = ({
  onRemove,
  utxo,
}: {
  onRemove?: (output: MempoolUTXO) => void;
  utxo: MempoolUTXO;
}) => {
  const btcUsdPrice = useRecoilValue(btcPriceAtom);
  const { accounts } = useAccounts();
  const account = accounts[0];
  return (
    <div className="min-h-[320px] relative w-52 min-w-52  rounded-xl bg-zinc-900 border-[3px] border-zinc-600 flex flex-col gap-3 items-center justify-center">
      <div className="absolute top-4 left-[-120px] opacity-30">
        <div>INPUT #{utxo?.vout}</div>
      </div>
      <div className="opacity-30 absolute top-14 left-[-120px]">
        {account ? formatAddress(account) : ""}
      </div>
      <button
        className="absolute top-24 left-[-120px] opacity-30 hover:opacity-100"
        onClick={() => {
          onRemove?.(utxo);
        }}
      >
        REMOVE 🗑️
      </button>
      <div className="absolute top-[-3px] right-[-3px]">
        <Category color={CARD_TYPES_COLOR.BTC} type={CARD_TYPES.BTC} />
      </div>
      <Image
        className="w-14 h-14 pointer-events-none"
        src="/bitcoin.png"
        alt="Bitcoin"
        width={54}
        height={54}
      />
      Bitcoin
      <div className="w-32 h-12  text-center text-white text-xl font-medium">
        {formatNumber(utxo?.value, 0, 0, false, false)} sats
      </div>
      <div>${formatNumber((utxo?.value / 100000000) * btcUsdPrice)}</div>
    </div>
  );
};

export const CardMobile = ({
  onRemove,
  utxo,
}: {
  onRemove?: (output: MempoolUTXO) => void;
  utxo: MempoolUTXO;
}) => {
  const btcUsdPrice = useRecoilValue(btcPriceAtom);
  const { accounts } = useAccounts();
  const account = accounts[0];
  return (
    <div className="relative w-[100px] h-[100px] max-h-[100px]  rounded-xl bg-zinc-900 border-[3px] border-zinc-600 flex flex-col items-center justify-center pt-2">
      <button
        className="absolute top-0 left-[-32px] opacity-30 hover:opacity-100"
        onClick={() => {
          onRemove?.(utxo);
        }}
      >
        🗑️
      </button>
      <div className="absolute top-[-3px] right-[-3px]">
        <Category color={CARD_TYPES_COLOR.BTC} type={CARD_TYPES.BTC} />
      </div>
      <Image src="/bitcoin.png" alt="Bitcoin" width={16} height={16} />

      <div className="text-center text-white text-[12px] font-medium">
        {formatNumber(utxo?.value, 0, 0, false, false)} sats
      </div>
      <div className="text-[12px]">
        ${formatNumber((utxo?.value / 100000000) * btcUsdPrice)}
      </div>
    </div>
  );
};

export const CardOption = ({
  onClick,
  utxo,
}: {
  onClick?: (utxo: MempoolUTXO) => void;
  utxo: MempoolUTXO;
}) => {
  const ordinals = useRecoilValue(ordinalsAtom);
  const btcUsdPrice = useRecoilValue(btcPriceAtom);
  const { inputs } = useRecoilValue(butterflyAtom);
  const runesStates = useRecoilValue(runesAtom);

  const rune = runesStates?.find((rune) =>
    rune.utxos.find((u) => u.location === `${utxo.txid}:${utxo.vout}`)
  );

  const utxoFound = rune
    ? rune?.utxos.find((u) => u.location === `${utxo.txid}:${utxo.vout}`)
    : undefined;

  const ordinal = !utxoFound
    ? ordinals?.inscription.find(
        (i) => i.utxo.txid === utxo.txid && i.utxo.vout === utxo.vout
      )
    : undefined;

  const isDisabled =
    inputs?.includes(utxo) || Boolean(rune) || Boolean(ordinal);

  const contentType = utxoFound
    ? CARD_TYPES.RUNES
    : ordinal?.contentType || CARD_TYPES.BTC;

  const colorType = utxoFound
    ? CARD_TYPES_COLOR.RUNES
    : ordinal
    ? CARD_TYPES_COLOR.INSCRIPTIONS
    : CARD_TYPES_COLOR.BTC;

  const secondaryColorType = utxoFound
    ? CARD_TYPES_COLOR_SECONDARY.RUNES
    : ordinal
    ? CARD_TYPES_COLOR_SECONDARY.INSCRIPTIONS
    : CARD_TYPES_COLOR_SECONDARY.BTC;

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
          {rune?.amount && (
            <div className="mt-[-14px] w-32 h-12 text-center text-xl text-bold font-medium flex justify-center items-center pointer-events-none gap-2 whitespace-nowrap overflow-hidden">
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
          />
          <span className="font-bold">Satoshi</span>
          <div className="w-32 h-12 text-center text-white text-xl font-medium pointer-events-none">
            {formatNumber(utxo?.value, 0, 0, false, false)} sats
          </div>
          <div className="pointer-events-none">
            ${formatNumber((utxo?.value / 100000000) * btcUsdPrice)}
          </div>
        </>
      )}
      {ordinal && (
        <>
          <OrdinalRendering utxo={utxo} />
          <span className="text-[10px]">{ordinal.contentType}</span>
        </>
      )}

      <Tooltip
        id={"select"}
        className="max-w-[260px] bg-gray-600"
        style={{ backgroundColor: "#292929", color: "white" }}
      />

      <button
        data-tooltip-id={"select"}
        data-tooltip-content={
          isDisabled
            ? !Boolean(utxoFound) && !Boolean(ordinal)
              ? "UTXO already selected"
              : `${
                  Boolean(ordinal) ? "Inscriptions" : "Runes"
                } are not available yet.`
            : ""
        }
        data-tooltip-place="top"
        disabled={isDisabled}
        onClick={() => onClick?.(utxo)}
        className={`${
          isDisabled ? "opacity-50" : ""
        } text-bold absolute bottom-4 text-[16px] rounded px-8 py-1 from-[#ffa750] to-[#e8c03f] bg-gradient-to-r hover:from-[#ffa750] hover:to-[#e8c03f] text-white`}
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
  );
};

export const CardOutput = ({
  onRemove,
  index,
}: {
  onRemove: (index: number) => void;
  index: number;
}) => {
  const btcUsdPrice = useRecoilValue(btcPriceAtom);
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom);

  const [addressInputFocused, setAddressInputFocused] = useState(false);
  const onInputFocus = () => {
    setAddressInputFocused(true);
    document.getElementById("address")?.focus();
  };

  return (
    <div className="min-w-52 bg-zinc-900 rounded-xl border-[3px] border-zinc-600 flex flex-col gap-3 items-center justify-center">
      <div className="absolute top-0 right-0 pointer-events-none ">
        <Category color={CARD_TYPES_COLOR.BTC} type={CARD_TYPES.BTC} />
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
                ? formatAddress(butterfly.outputs[index].address)
                : "ADDRESS 📝"}
            </div>
          )}

          <input
            id="address"
            placeholder="Address"
            value={butterfly.outputs[index].address}
            onChange={(e) => {
              setButterfly((prev) => {
                const outputs = JSON.parse(JSON.stringify(prev.outputs));
                outputs[index].address = e.target.value;
                return { ...prev, outputs };
              });
            }}
            onFocus={() => setAddressInputFocused(true)}
            onBlur={() => setAddressInputFocused(false)}
            className={`my-[-4px] py-1 bg-transparent max-w-[110px] text-[14px] text-end p-0 focus:max-w-[550px] focus:min-w-[550px]  transition-all duration-300 focus:ring-0 focus:border-[#82828280]  border-transparent focus:border-2 rounded-[4px] outline-none focus:bg-gradient-to-b focus:from-[#29292950] focus:to-[#292929] focus:px-2 ${
              addressInputFocused ? "flex" : "hidden"
            }`}
          />
        </div>

        <button
          className=" opacity-30 hover:opacity-100"
          onClick={() => {
            onRemove?.(index);
          }}
        >
          REMOVE 🗑️
        </button>
      </div>
      <Image
        className="w-14 h-14 pointer-events-none"
        src="/bitcoin.png"
        alt="Bitcoin"
        width={54}
        height={54}
      />
      Bitcoin
      <div className="text-center text-white font-medium whitespace-nowrap flex flex-col justify-center items-center ">
        <input
          value={butterfly.outputs[index].value}
          onChange={(e) => {
            setButterfly((prev) => {
              const outputs = JSON.parse(JSON.stringify(prev.outputs));
              outputs[index].value = Number(e.target.value);
              return { ...prev, outputs };
            });
          }}
          placeholder="0"
          className="bg-transparent text-[20px] border text-center outline-none border-transparent w-20 h-12"
        />{" "}
        <div className="mt-[-15px] text-[12px]">sats</div>
      </div>
      {Boolean(butterfly.outputs[index].value) && (
        <div>
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
    </div>
  );
};

export const CardOutputMobile = ({
  onRemove,
  index,
}: {
  onRemove: (index: number) => void;
  index: number;
}) => {
  const btcUsdPrice = useRecoilValue(btcPriceAtom);
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom);

  const [addressInputFocused, setAddressInputFocused] = useState(false);
  const onInputFocus = () => {
    setAddressInputFocused(true);
    document.getElementById("address")?.focus();
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!addressInputFocused) {
        document.removeEventListener("click", handleClick);
      }
      if (e.target instanceof HTMLElement && !e.target.closest("#address")) {
        setAddressInputFocused(false);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [addressInputFocused]);

  return (
    <div className="w-[100px] h-[100px] bg-zinc-900 rounded-xl border-[3px] border-zinc-600 flex flex-col items-center justify-center pt-2">
      <div className="absolute top-0 right-0 pointer-events-none ">
        <Category color={CARD_TYPES_COLOR.BTC} type={CARD_TYPES.BTC} />
      </div>
      <div className="absolute top-0  right-[-28px] flex flex-col gap-4 justify-center items-end">
        <button
          className=" opacity-30 hover:opacity-100"
          onClick={() => {
            onRemove?.(index);
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
                const outputs = JSON.parse(JSON.stringify(prev.outputs));
                outputs[index].address = e.target.value;
                return { ...prev, outputs };
              });
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
      />

      <div className="mt-1 text-[12px] text-center text-white font-medium whitespace-nowrap flex justify-center items-center ">
        <input
          value={butterfly.outputs[index].value || ""}
          onChange={(e) => {
            setButterfly((prev) => {
              const outputs = JSON.parse(JSON.stringify(prev.outputs));
              outputs[index].value = Number(e.target.value);
              return { ...prev, outputs };
            });
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
  );
};
