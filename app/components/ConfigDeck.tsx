import { toast, ToastContainer } from "react-toastify";
import { useMempool } from "@/app/hooks/useMempool";
import { utxoAtom } from "@/app/recoil/utxoAtom";
import Image from "next/image";
import { useRecoilState, useRecoilValue } from "recoil";
import { toastOptions } from "@/app/components/Toast";
import { Tooltip } from "react-tooltip";
import { formatNumber } from "@/app/utils/format";
import { useAccounts, useBTCProvider } from "@particle-network/btc-connectkit";
import { track } from "@vercel/analytics";
import { butterflyAtom } from "@/app/recoil/butterflyAtom";
import { configAtom } from "@/app/recoil/confgsAtom";
import { useState } from "react";

export const ConfigDeck = () => {
  useMempool();

  const utxos = useRecoilValue(utxoAtom);
  const [configs, setConfigs] = useRecoilState(configAtom);
  const butterfly = useRecoilValue(butterflyAtom);
  const { accounts } = useAccounts();
  const account = accounts[0];

  const position =
    configs?.isInputDeckOpen && utxos?.length
      ? "bottom-[356px]"
      : "bottom-[0px]";

  const inputValues = butterfly.inputs.reduce((acc, cur) => acc + cur.value, 0);
  const outputValues =
    butterfly.outputs.reduce((acc, cur) => acc + cur.value, 0) +
    configs.feeCost;

  const difference = inputValues - outputValues;

  const isConfirmDisabled =
    difference !== 0 || outputValues - configs.feeCost < 0;

  const { provider } = useBTCProvider();
  const [confirmed, setConfirmed] = useState(false);

  const onConfirm = async () => {
    try {
      const res = await fetch("/api/psbt", {
        method: "POST",
        body: JSON.stringify({ butterfly, account }),
      });
      const result = await res.json();

      if (result?.psbtHex) {
        const signed = await provider.signPsbt(result.psbtHex);
        toast.success(`Tx signed`, toastOptions);
        const txId = await provider.broadcastPsbt(signed);
        toast.success(`Tx Broadcasted: ${txId}`, toastOptions);
        track("psbt-sign", { wallet: account });
        setConfirmed(true);
      }
    } catch (error) {}
  };

  const confirmTooltip = utxos?.length
    ? isConfirmDisabled
      ? difference > 0 || outputValues < 0
        ? `Adjust the fee or outputs. UTXO balance is ${formatNumber(
            inputValues - outputValues,
            0,
            0,
            false,
            false
          )} sats, but should be 0.`
        : `Add more inputs ${
            outputValues ? "or change output" : ""
          }. UTXO balance is ${formatNumber(
            inputValues - outputValues,
            0,
            0,
            false,
            false
          )} sats, but should be 0.`
      : "Create PSBT ans sign"
    : "No UTXOs";

  return (
    <div className={`fixed flex gap-2 ${position}`}>
      <div className="absolute">
        <ToastContainer />
      </div>

      {Boolean(utxos?.length) && configs.isInputDeckOpen && (
        <div
          onClick={() =>
            setConfigs((prev) => ({ ...prev, isInputDeckOpen: false }))
          }
          className="w-full rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-zinc-600 flex flex-col cursor-pointer"
        >
          <div className="text-[12px] flex items-center justify-center opacity-50">
            Action
          </div>
          <div className="flex justify-center items-center">Close</div>
        </div>
      )}

      {Boolean(utxos?.length) && (
        <div className="w-full rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-6 border-2 border-zinc-600">
          <div className="text-[12px] flex items-center justify-center opacity-50">
            Total Balance
          </div>
          <div className="flex gap-2 justify-center items-center">
            <Image src="/bitcoin.png" alt="Bitcoin" width={24} height={24} />
            <span className="whitespace-nowrap">
              {utxos?.length
                ? utxos.reduce((acc, utxo) => acc + utxo.value, 0) / 100000000
                : `0.000000000`}{" "}
              BTC
            </span>
          </div>
        </div>
      )}

      {Boolean(configs.feeRate) && (
        <div className="w-full rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-zinc-600 flex flex-col">
          <div className="text-[12px] flex items-center justify-center opacity-50">
            Fee Rate
          </div>
          <div className="flex justify-center items-center">
            <span className="whitespace-nowrap">{configs.feeRate} sat/vb</span>
          </div>
        </div>
      )}

      {Boolean(configs.feeCost) && (
        <div className="w-full rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-zinc-600 flex flex-col">
          <div className="text-[12px] flex items-center justify-center opacity-50 whitespace-nowrap">
            Psbt Balance
          </div>
          {!isConfirmDisabled && (
            <div className="flex gap-2 justify-center items-center">
              ✅ {confirmed ? " Broadcasted" : ""}
            </div>
          )}
          {isConfirmDisabled && (
            <div className="flex gap-2 justify-center items-center">
              <span className="whitespace-nowrap">{`${formatNumber(
                inputValues - outputValues,
                0,
                0,
                false,
                false
              )}`}</span>
            </div>
          )}
        </div>
      )}

      {Boolean(configs.feeCost) && (
        <>
          <Tooltip
            id={"confirm"}
            className="max-w-[250px] bg-gray-600"
            style={{ backgroundColor: "#292929", color: "white" }}
          />
          <button
            data-tooltip-id={"confirm"}
            data-tooltip-content={confirmTooltip}
            data-tooltip-place="top"
            onClick={onConfirm}
            disabled={isConfirmDisabled || confirmed}
            className={`w-full rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-zinc-600 flex flex-col hover:bg-zinc-600 hover:border-zinc-400 justify-center items-center ${
              isConfirmDisabled
                ? "opacity-50 cursor-not-allowed"
                : "opacity-100 cursor-pointer"
            }`}
          >
            <div className="text-[12px] flex items-center justify-center opacity-50">
              Action
            </div>
            <div className="flex gap-2 justify-center items-center">
              <span className="whitespace-nowrap bold font-bold text-[16px] flex justify-center items-center">
                Confirm <div className="mb-[-5px] ml-2">↳</div>
              </span>
            </div>
          </button>
        </>
      )}
    </div>
  );
};
