import { mempoolAtom } from "@/app/recoil/mempool";
import { useEffect } from "react";
import { useRecoilState } from "recoil";

export const useMempoolWs = () => {
  const [mempool, setMempool] = useRecoilState(mempoolAtom);

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}`);

    const handleWsEvents = (data: any) => {
      if (data?.length > 0) {
        setMempool((prev) => ({ ...prev, mempoolBlocks: data }));
      }
      if (data?.height) {
        setMempool((prev) => ({ ...prev, block: data }));
      }
      if (data?.USD) {
        setMempool((prev) => ({ ...prev, conversions: data }));
      }
    };

    ws.onopen = () => {
      console.log("Connected to mempool websocket");
    };

    ws.onmessage = (event) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const text = reader.result;
        const data = JSON.parse(text as string);
        handleWsEvents(data);
      };
      reader.readAsText(event.data);
    };

    ws.onclose = () => {
      console.log("Disconnected from mempool websocket");
    };

    return () => {
      ws.close();
    };
  }, [setMempool]);

  return mempool;
};
