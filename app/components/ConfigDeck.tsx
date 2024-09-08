import { useMempool } from "@/app/hooks/useMempool";
import { utxoAtom } from "@/app/recoil/utxoAtom";
import Image from "next/image";
import { useRecoilState, useRecoilValue } from "recoil";
import { Tooltip } from "react-tooltip";
import { formatAddress, formatNumber } from "@/app/utils/format";
import { useAccounts, useBTCProvider } from "@particle-network/btc-connectkit";
import { track } from "@vercel/analytics";
import { butterflyAtom } from "@/app/recoil/butterflyAtom";
import { configAtom } from "@/app/recoil/confgsAtom";
import { Modal } from "@/app/components/Modal";
import Link from "next/link";
import { psbtService } from "@/app/services/psbtService";
import { runesAtom } from "@/app/recoil/runesAtom";
import { config } from "process";

export const ConfigDeck = () => {
  useMempool();

  const runes = useRecoilValue(runesAtom);
  const utxos = useRecoilValue(utxoAtom);
  const [configs, setConfigs] = useRecoilState(configAtom);
  const butterfly = useRecoilValue(butterflyAtom);
  const { accounts } = useAccounts();
  const account = accounts[0];

  const isDeckOpen = configs?.isInputDeckOpen || configs?.isOutputDeckOpen;

  let position =
    isDeckOpen && utxos?.length ? "bottom-[356px]" : "bottom-[0px]";

  if (configs.isInputFullDeckOpen) {
    position = "top-[82px]";
  }

  const inputValues = butterfly.inputs.reduce((acc, cur) => acc + cur.value, 0);
  const outputValues =
    butterfly.outputs.reduce((acc, cur) => acc + cur.value, 0) +
    configs.feeCost;

  const difference = inputValues - outputValues;
  const rune = runes?.find((r) =>
    r.utxos.find((u) =>
      butterfly.inputs.find((i) => u.location === `${i.txid}:${i.vout}`)
    )
  );
  const runesInputSum =
    rune?.utxos.reduce((acc, cur) => {
      const utxoIsInInput = butterfly.inputs.find(
        (i) => cur.location === `${i.txid}:${i.vout}`
      );
      if (utxoIsInInput) {
        const utxoFormattedBalance = cur.formattedBalance;
        return acc + Number(utxoFormattedBalance);
      }

      return acc;
    }, 0) || 0;

  const runesOutputSum = butterfly.outputs.reduce((acc, cur) => {
    return (cur?.runesValue || 0) + acc;
  }, 0);

  const runesButterflyBalance = runesInputSum - runesOutputSum;

  const isConfirmDisabled =
    difference !== 0 ||
    outputValues - configs.feeCost < 0 ||
    runesButterflyBalance !== 0;

  const { provider } = useBTCProvider();
  const confirmed = configs.isConfirmedModalTxId;
  const isOpen = configs.isOpenModalTxId;
  const txid = configs.txid;

  const onConfirm = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/psbt", {
        method: "POST",
        body: JSON.stringify({ butterfly, account }),
      });
      const result = await res.json();

      if (result?.psbtHex) {
        const psbtHexSigned = await provider.signPsbt(result.psbtHex);
        const txidRes = await psbtService.broadcastUserPSBT(psbtHexSigned);
        if (txidRes) {
          track("psbt-sign", { wallet: account });

          setConfigs((prev) => ({
            ...prev,
            txid: txidRes,
            isOpenModalTxId: true,
            isConfirmedModalTxId: true,
          }));
        } else {
          track("error-psbt-sign", { wallet: account });
        }
      }
    } catch (error) {
      console.log(error);
    }
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
          )} sats; it should be 0.`
        : `Add more inputs ${
            outputValues ? "or adjust the output" : ""
          }. UTXO balance is ${formatNumber(
            inputValues - outputValues,
            0,
            0,
            false,
            false
          )} sats; it should be 0.`
      : "Create PSBT and sign"
    : "No UTXOs";

  const onClose = () => {
    setConfigs((prev) => ({
      ...prev,
      isOpenModalTxId: false,
      isConfirmedModalTxId: false,
    }));
  };

  return (
    <div className={`fixed flex gap-2 ${position}`}>
      <Modal isOpen={isOpen} onClose={onClose}>
        <h2 className="text-[20px] font-bold mb-8">🎉 Success</h2>
        <p className="mt-4">Transaction signed and broadcasted</p>

        <div className="mt-4 flex  w-full overflow-hidden gap-2">
          <p>Txid: </p>
          <Link
            href={`https://mempool.space/tx/${txid}`}
            className="] font-normal text-orange-400 hover:text-orange-300 flex  text-start"
            target="_blank"
            rel="noopener noreferrer"
          >
            {formatAddress(txid)}
          </Link>
        </div>
      </Modal>

      {Boolean(utxos?.length) && isDeckOpen && (
        <div
          onClick={() =>
            setConfigs((prev) => ({
              ...prev,
              isInputDeckOpen: false,
              isOutputDeckOpen: false,
            }))
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
        <div
          className={`w-full rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 hover:bg-zinc-800 py-2 px-6 border-2 border-zinc-600 hover:border-zinc-500 cursor-pointer`}
          onClick={() =>
            setConfigs((prev) => ({
              ...prev,
              isInputFullDeckOpen: !prev.isInputFullDeckOpen,
              isInputDeckOpen: false,
            }))
          }
        >
          <div className="text-[12px] flex items-center justify-center opacity-50">
            {utxos?.length} UTXOs
          </div>
          <div className="flex gap-2 justify-center items-center px-2">
            <Image src="/bitcoin.png" alt="Bitcoin" width={24} height={24} />
            <span className="whitespace-nowrap">
              {utxos?.length
                ? utxos.reduce((acc, utxo) => acc + utxo.value, 0) / 100000000
                : `0.000000000`}{" "}
              BTC
            </span>

            <Image
              src="/arrow.png"
              alt="Arrow"
              width={16}
              height={16}
              style={{
                transform: configs.isInputFullDeckOpen ? "" : "rotate(180deg)",
              }}
            />
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

      {Boolean(configs.feeCost) && isConfirmDisabled && (
        <div className="w-full rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-zinc-600 hidden sm:flex flex-col">
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
            <div className="text-[12px] flex items-center justify-center opacity-50 whitespace-nowrap">
              Sign Transaction
            </div>
            <div className="flex gap-2 justify-center items-center relative">
              <div className="absolute right-[-40px] top-[-28px]">
                <span className="relative flex h-3 w-3">
                  {!isConfirmDisabled && !confirmed && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </>
                  )}
                </span>
              </div>
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
