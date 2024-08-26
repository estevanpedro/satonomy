import { useEffect, useState } from "react";

import { MempoolUTXO, ordinalsAtom } from "@/app/recoil/utxo";
import { useRecoilValue } from "recoil";
import Image from "next/image";

export const Ordinal = ({ utxo }: { utxo: MempoolUTXO }) => {
  const ordinals = useRecoilValue(ordinalsAtom);

  const ordinal = ordinals?.inscription.find(
    (i) => i.utxo.txid === utxo.txid && i.utxo.vout === utxo.vout
  );

  const contentType = ordinal?.contentType;

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
        style={{ imageRendering: "pixelated" }}
        src={`https://ordinals.com/content/${ordinal?.inscriptionId}`}
        width={140}
        height={140}
        alt="Ordinal Image"
        unoptimized
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
    <span className="text-[12px] max-w-[180px] text-center">
      {text.replaceAll(`","`, `", "`)}
    </span>
  );
};

export default TextContent;
