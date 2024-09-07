import { CardOption, EmptyCard } from "@/app/components/Card";
import { configAtom } from "@/app/recoil/confgsAtom";
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom";
import { useRecoilState, useRecoilValue } from "recoil";

export const Portfolio = ({
  onClick,
}: {
  onClick: (utxo: MempoolUTXO) => void;
}) => {
  const utxos = useRecoilValue(utxoAtom);
  const [configs, setConfigs] = useRecoilState(configAtom);

  const onExpand = () => {
    setConfigs((configs) => ({
      ...configs,
      fullDeckPage: configs.fullDeckPage + 1,
    }));
  };

  const utxosFiltered = utxos?.filter((_, index) => {
    return index < configs.fullDeckPage * 40;
  });

  return (
    <div
      className={`fixed top-[140px] left-0 w-[100vw] h-[calc(100vh-140px)] border-2 flex border-zinc-700 px-8 bg-zinc-800 rounded-t-lg ${
        configs.isInputFullDeckOpen ? "flex" : "hidden"
      }`}
    >
      <div className="flex flex-wrap gap-4 justify-around overflow-y-scroll mt-6 relative">
        {configs.isInputFullDeckOpen &&
          utxosFiltered!.map((utxo, index) => {
            return (
              <div key={`index-${index}`} className="mt-2 z-0">
                <CardOption onClick={onClick} utxo={utxo} />
              </div>
            );
          })}

        <div className="z-1">
          <EmptyCard tooltip="Expand more" text="+" onClick={onExpand} />
        </div>
      </div>
    </div>
  );
};
