import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import Image from "next/image";

import { MempoolUTXO } from "@/app/recoil/utxoAtom";
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom";
import { formatNumber } from "@/app/utils/format";

const ORDIN_URL = `https://ordin.s3.amazonaws.com/inscriptions`;

export const OrdinalRendering = ({
  utxo,
  setIsBrc20,
}: {
  utxo: MempoolUTXO;
  setIsBrc20: (string: string) => void;
}) => {
  const ordinals = useRecoilValue(ordinalsAtom);
  const [hasImage, setHasImage] = useState<boolean | undefined>(true);

  const ordinal = ordinals?.inscription.find(
    (i) => i.utxo.txid === utxo.txid && i.utxo.vout === utxo.vout
  );

  const contentType = ordinal?.contentType;

  if (contentType?.includes("json")) {
    return (
      <JsonContent
        url={`${ORDIN_URL}/${ordinal?.inscriptionId}`}
        setIsBrc20={setIsBrc20}
      />
    );
  }

  if (contentType?.includes("Bitcoin")) {
    return (
      <div>
        <span>{ordinal?.utxo.satoshi} sats</span>
        <span>{ordinal?.contentType}</span>
      </div>
    );
  }

  if (contentType?.includes("text")) {
    return (
      <TextContent
        url={`${ORDIN_URL}/${ordinal?.inscriptionId}`}
        setIsBrc20={setIsBrc20}
      />
    );
  }

  if (contentType?.includes("image/svg+xml")) {
    return (
      <TextContent
        url={`${ORDIN_URL}/${ordinal?.inscriptionId}`}
        setIsBrc20={setIsBrc20}
      />
    );
  }
  if (contentType?.includes("image")) {
    return (
      <>
        {!hasImage && (
          <Image
            loader={({ src }) => src}
            src={`https://ordinals.com/content/${ordinal?.inscriptionId}`}
            width={140}
            height={140}
            alt="Ordinal Image"
            loading="lazy"
            onError={() => {
              setHasImage(false);
            }}
          />
        )}
        {hasImage && (
          <Image
            loader={({ src }) => src}
            src={`${ORDIN_URL}/${ordinal?.inscriptionId}`}
            width={140}
            height={140}
            alt="Ordinal Image"
            loading="lazy"
            onError={() => {
              setHasImage(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div>
      <span>{ordinal?.contentType}</span>
    </div>
  );
};

type TextContentProps = {
  url: string;
  setIsBrc20: (string: string) => void;
};

const TextContent = ({ url, setIsBrc20 }: TextContentProps) => {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const textData = await response.text();
          if (textData.includes("brc-20")) {
            setIsBrc20(textData);
          }
          setText(textData);
        } else {
          console.error("Failed to fetch text content");
        }
      } catch (error) {
        console.error("Error fetching text content:", error);
      }
    };

    fetchText();
  }, [url, setIsBrc20]);

  const isBrc20 = text.includes("brc-20");

  return (
    <>
      {isBrc20 && (
        <div className="flex flex-col justify-center items-center">
          <pre className="mt-[-40px] mb-[18px] opacity-50 px-2 text-[12px] max-w-[180px] text-center overflow-hidden whitespace-pre-wrap">
            {text.length > 120
              ? `${text.slice(0, 120)}...`
              : text.replaceAll(`","`, `", "`)}
          </pre>
          <div className="uppercase mb-[18px] font-bold text-[16px]">
            {JSON.parse(text).tick}
          </div>

          <div className="uppercase text-[18px]">
            {formatNumber(Number(JSON.parse(text).amt))}
          </div>
        </div>
      )}

      {!isBrc20 && (
        <span className="px-2 text-[12px] max-w-[180px] text-center overflow-hidden">
          {text.replaceAll(`","`, `", "`)}
        </span>
      )}
    </>
  );
};

export const JsonContent: React.FC<TextContentProps> = ({
  url,
  setIsBrc20,
}) => {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const contentType = response.headers.get("Content-Type");
          if (contentType && contentType.includes("application/json")) {
            const jsonData = await response.json();

            if (jsonData.op?.includes("brc-20")) {
              setIsBrc20(JSON.stringify(jsonData, null, 2)); // Pretty-print JSON
            }

            setText(JSON.stringify(jsonData, null, 2)); // Pretty-print JSON
          } else {
            const textData = await response.text();
            if (textData.includes("brc-20")) {
              setIsBrc20(textData);
            }
            setText(textData);
          }
        } else {
          console.error("Failed to fetch text content");
        }
      } catch (error) {
        console.error("Error fetching text content:", error);
      }
    };

    fetchText();
  }, [url, setIsBrc20]);

  const isBrc20 = text.includes("brc-20");
  return (
    <>
      {isBrc20 && (
        <div>
          <pre className="px-2 text-[12px] max-w-[180px] text-center overflow-hidden whitespace-pre-wrap">
            {text.length > 120 ? `${text.slice(0, 120)}...` : text}
          </pre>

          <div>{JSON.parse(text).tick}</div>
          <div>{formatNumber(JSON.parse(text).amt)}</div>
        </div>
      )}
      {!isBrc20 && (
        <pre className="px-2 text-[12px] max-w-[180px] text-center overflow-hidden whitespace-pre-wrap">
          {text.length > 120 ? `${text.slice(0, 120)}...` : text}
        </pre>
      )}
    </>
  );
};
