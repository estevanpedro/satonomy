import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import Image from "next/image";

import { MempoolUTXO } from "@/app/recoil/utxoAtom";
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom";

export const OrdinalRendering = ({ utxo }: { utxo: MempoolUTXO }) => {
  const ordinals = useRecoilValue(ordinalsAtom);

  const ordinal = ordinals?.inscription.find(
    (i) => i.utxo.txid === utxo.txid && i.utxo.vout === utxo.vout
  );

  const contentType = ordinal?.contentType;

  if (contentType?.includes("json")) {
    return (
      <JsonContent
        url={`https://ordinals.com/content/${ordinal?.inscriptionId}`}
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
        url={`https://ordinals.com/content/${ordinal?.inscriptionId}`}
      />
    );
  }

  if (contentType?.includes("image")) {
    return (
      <Image
        src={`https://ordinals.com/content/${ordinal?.inscriptionId}`}
        width={140}
        height={140}
        alt="Ordinal Image"
        unoptimized
        quality={100}
      />
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
};

const TextContent = ({ url }: TextContentProps) => {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const textData = await response.text();
          setText(textData);
        } else {
          console.error("Failed to fetch text content");
        }
      } catch (error) {
        console.error("Error fetching text content:", error);
      }
    };

    fetchText();
  }, [url]);

  return (
    <span className="px-2 text-[12px] max-w-[180px] text-center overflow-hidden">
      {text.replaceAll(`","`, `", "`)}
    </span>
  );
};

export const JsonContent: React.FC<TextContentProps> = ({ url }) => {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const contentType = response.headers.get("Content-Type");
          if (contentType && contentType.includes("application/json")) {
            const jsonData = await response.json();
            setText(JSON.stringify(jsonData, null, 2)); // Pretty-print JSON
          } else {
            const textData = await response.text();
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
  }, [url]);

  return (
    <pre className="px-2 text-[12px] max-w-[180px] text-center overflow-hidden whitespace-pre-wrap">
      {text.length > 120 ? `${text.slice(0, 120)}...` : text}
    </pre>
  );
};
