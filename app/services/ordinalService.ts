export type RuneData = {
  title: string;
  number: string;
  timestamp: string;
  etchingBlock: string;
  etchingTransaction: string;
  mint: string;
  supply: string;
  mintProgress: string;
  premine: string;
  preminePercentage: string;
  burned: string;
  divisibility: string;
  symbol: string;
  turbo: string;
  etching: string;
  parent: string;
};

export const getRunesData = async (
  runesId: string
): Promise<RuneData | null> => {
  try {
    const response = await fetch(`https://ordinals.com/rune/${runesId}`);
    const htmlText = await response.text();

    const parser = new DOMParser();
    const document = parser.parseFromString(htmlText, "text/html");

    const getTextContent = (dtText: string) => {
      const dtElement = Array.from(document.querySelectorAll("dt")).find(
        (dt) => dt.textContent?.trim() === dtText
      );
      return dtElement?.nextElementSibling?.textContent?.trim() || "";
    };

    const runeData: RuneData = {
      title:
        document
          .querySelector("title")
          ?.textContent?.trim()
          .replace("Rune ", "") || "",
      number: getTextContent("number"),
      timestamp: getTextContent("timestamp"),
      etchingBlock: getTextContent("etching block"),
      etchingTransaction: getTextContent("etching transaction"),
      mint: getTextContent("mint"),
      supply: getTextContent("supply"),
      mintProgress: getTextContent("mint progress"),
      premine: getTextContent("premine"),
      preminePercentage: getTextContent("premine percentage"),
      burned: getTextContent("burned"),
      divisibility: getTextContent("divisibility"),
      symbol: getTextContent("symbol"),
      turbo: getTextContent("turbo"),
      etching: getTextContent("etching"),
      parent: getTextContent("parent"),
    };

    return runeData;
  } catch (error) {
    console.error(error);
    return null;
  }
};
