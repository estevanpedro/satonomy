import { useMempool } from "@/app/hooks/useMempool"
import { utxoAtom } from "@/app/recoil/utxoAtom"
import Image from "next/image"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { Tooltip } from "react-tooltip"
import { formatAddress, formatNumber } from "@/app/utils/format"
import { useAccounts, useBTCProvider } from "@particle-network/btc-connectkit"
import { track } from "@vercel/analytics"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { configAtom } from "@/app/recoil/confgsAtom"
import { Modal } from "@/app/components/Modal"
import Link from "next/link"
import { psbtService } from "@/app/services/psbtService"
import { runesAtom } from "@/app/recoil/runesAtom"
import { encodeData } from "@/app/utils/encodeButterfly"
import { psbtSignedAtom } from "@/app/recoil/psbtAtom"
import { toast } from "react-toastify"
import { toastOptions } from "@/app/components/Toast"

export const ConfigDeck = () => {
  useMempool()

  const [psbtSigned, setPsbtSigned] = useRecoilState(psbtSignedAtom)
  const runes = useRecoilValue(runesAtom)
  const utxos = useRecoilValue(utxoAtom)
  const [configs, setConfigs] = useRecoilState(configAtom)
  const butterfly = useRecoilValue(butterflyAtom)
  const { accounts } = useAccounts()
  const account = accounts[0]

  const isDeckOpen = configs?.isInputDeckOpen || configs?.isOutputDeckOpen

  let position = isDeckOpen && utxos?.length ? "bottom-[356px]" : "bottom-[0px]"

  if (configs.isInputFullDeckOpen) {
    position = "top-[82px]"
  }

  const inputValues = butterfly.inputs.reduce((acc, cur) => acc + cur.value, 0)
  const outputValues =
    butterfly.outputs.reduce((acc, cur) => acc + cur.value, 0) + configs.feeCost

  const difference = inputValues - outputValues
  const rune = runes?.find((r) =>
    r.utxos?.find((u) =>
      butterfly.inputs.find((i) => u.location === `${i.txid}:${i.vout}`)
    )
  )
  const runesInputSum =
    rune?.utxos.reduce((acc, cur) => {
      const utxoIsInInput = butterfly.inputs.find(
        (i) => cur.location === `${i.txid}:${i.vout}`
      )
      if (utxoIsInInput) {
        const utxoFormattedBalance = cur.formattedBalance
        return acc + Number(utxoFormattedBalance)
      }

      return acc
    }, 0) || 0

  const runesOutputSum = butterfly.outputs.reduce((acc, cur) => {
    return (cur?.runesValue || 0) + acc
  }, 0)

  const runesButterflyBalance = runesInputSum - runesOutputSum

  const isConfirmDisabled =
    difference !== 0 ||
    outputValues - configs.feeCost < 0 ||
    runesButterflyBalance !== 0 ||
    configs.feeRateEstimated < 2

  const { provider } = useBTCProvider()
  const confirmed = configs.isConfirmedModalTxId
  const isOpen = configs.isOpenModalTxId
  const txid = configs.txid

  const onConfirm = async (e: any) => {
    e.preventDefault()
    try {
      if (psbtSigned.psbtHexSigned) {
        const alreadyPsbtHexSigned = psbtSigned.psbtHexSigned
        const psbtHexSigned = await provider.signPsbt(alreadyPsbtHexSigned)

        const inputsSigned = butterfly.inputs.filter(
          (i) => i.wallet === account
        )

        setPsbtSigned({
          psbtHexSigned,
          inputsSigned: [...psbtSigned.inputsSigned, ...inputsSigned],
        })

        const txidRes = await psbtService.broadcastUserPSBT(psbtHexSigned)
        if (txidRes) {
          track("psbt-sign", { wallet: account })
          setConfigs((prev) => ({
            ...prev,
            txid: txidRes,
            isOpenModalTxId: true,
            isConfirmedModalTxId: true,
          }))
        } else {
          track("error-psbt-sign", { wallet: account })
        }

        return
      }

      const res = await fetch("/api/psbt", {
        method: "POST",
        body: JSON.stringify({ butterfly, account }),
      })
      const result = await res.json()

      if (result?.psbtHex) {
        const psbtHexSigned = await provider.signPsbt(result.psbtHex)

        const shouldNotBroadcast =
          butterfly.inputs.filter((i) => accounts.find((a) => a !== i?.wallet))
            .length > 0

        const inputsSigned = butterfly.inputs.filter(
          (i) => i.wallet === account
        )

        if (psbtHexSigned) {
          setPsbtSigned({
            psbtHexSigned,
            inputsSigned: [...psbtSigned.inputsSigned, ...inputsSigned],
          })
        }

        if (shouldNotBroadcast) {
          return
        }

        const txidRes = await psbtService.broadcastUserPSBT(psbtHexSigned)
        if (txidRes) {
          track("psbt-sign", { wallet: account }, { flags: ["confirm"] })
          setConfigs((prev) => ({
            ...prev,
            txid: txidRes,
            isOpenModalTxId: true,
            isConfirmedModalTxId: true,
          }))
          setConfigs((prev) => ({
            ...prev,
            txid: txidRes,
            isOpenModalTxId: true,
            isConfirmedModalTxId: true,
          }))
        } else {
          track("error-psbt-sign", { wallet: account })
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

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
        : configs.feeRateEstimated < 2
        ? `Increase the fees, ${formatNumber(
            configs.feeRateEstimated
          )} sats/vb is too low. Minimum is 2 sats/vb`
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
    : "No UTXOs"

  const onClose = () => {
    setConfigs((prev) => ({
      ...prev,
      isOpenModalTxId: false,
      isConfirmedModalTxId: false,
    }))
  }

  const copyToClipboard = () => {
    const butterflyUrl = encodeData(butterfly)
    const configsUrl = encodeData(configs)
    const runeFound = butterfly.outputs.find(
      (o) => o.type === "runes" && o.rune?.runeid
    )
    const runeObj = runes?.find((r) => r.runeid === runeFound?.rune?.runeid)
    const runesUrl = encodeData(runeObj ? [runeObj] : undefined)

    const stringToCopy = `http://${
      window.location.hostname
    }:3000/?b=${butterflyUrl}&c=${configsUrl}${
      runesUrl ? `&r=${runesUrl}` : ""
    }${
      psbtSigned.psbtHexSigned
        ? `&psbtHexSigned=${psbtSigned.psbtHexSigned}`
        : ""
    }${psbtSigned.txid ? `&txid=${psbtSigned.txid}` : ""}`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(stringToCopy).then(
        () => console.log("Text copied to clipboard"),
        (err) => console.error("Could not copy text: ", err)
      )
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = stringToCopy
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        console.log("Text copied to clipboard")
      } catch (err) {
        console.error("Could not copy text: ", err)
      }
      document.body.removeChild(textArea)
    }

    toast("Link copied to clipboard", toastOptions)
  }

  const inputsSigned = psbtSigned.inputsSigned.filter((i) =>
    butterfly.inputs.find((b) => b.txid === i.txid && b.vout === i.vout)
  )

  const allTxIsSigned =
    butterfly.inputs.find((i) => i.wallet === account && i.wallet) &&
    inputsSigned.length === butterfly.inputs.length

  const userCanSign = butterfly.inputs.find(
    (i) => i.wallet === account && i.wallet
  )

  const onBroadcast = async () => {
    try {
      if (!psbtSigned?.psbtHexSigned) return
      if (!userCanSign) {
        toast("You don't have permission to broadcast", toastOptions)
      }

      const txidRes = await psbtService.broadcastUserPSBT(
        psbtSigned?.psbtHexSigned
      )

      if (txidRes) {
        track("broadcast", { wallet: account }, { flags: ["broadcast"] })

        setConfigs((prev) => ({
          ...prev,
          txid: txidRes,
          isOpenModalTxId: true,
          isConfirmedModalTxId: true,
        }))

        setPsbtSigned((prev) => ({
          psbtHexSigned: psbtSigned?.psbtHexSigned,
          inputsSigned: prev.inputsSigned,
          txid: txidRes,
        }))

        if ("URLSearchParams" in window) {
          var searchParams = new URLSearchParams(window.location.search)

          const butterflyUrl = encodeData(butterfly)
          const configsUrl = encodeData(configs)
          const runeFound = butterfly.outputs.find(
            (o) => o.type === "runes" && o.rune?.runeid
          )
          const runeObj = runes?.find(
            (r) => r.runeid === runeFound?.rune?.runeid
          )
          const runesUrl = encodeData(runeObj ? [runeObj] : undefined)

          searchParams.set("b", `${butterflyUrl}`)
          searchParams.set("c", `${configsUrl}`)
          if (runesUrl) searchParams.set("r", `${runesUrl}`)
          searchParams.set("psbtHexSigned", `${psbtSigned?.psbtHexSigned}`)
          searchParams.set("txid", txidRes)
          window.location.search = searchParams.toString()
        }

        toast.success("Broadcast Successfully", toastOptions)
      } else {
        track("error-broadcast", { wallet: account })
      }
    } catch (error) {
      console.log
    }
  }

  return (
    <div className={`fixed flex gap-2 ${position}`}>
      {/* <Modal isOpen={isOpen} onClose={onClose}>
        <div className="w-full flex flex-col h-full sm:w-[370px]">
          <h2 className="text-[20px] font-bold mb-2">✅ Success</h2>
          <p className="mt-4">Transaction has been broadcasted successfully</p>

          <div className="mt-4 flex  w-full overflow-hidden gap-2">
            <Link
              href={`https://mempool.space/tx/${txid}`}
              className="] font-normal text-[#6839B6] hover:text-[#3478F7] flex  text-start"
              target="_blank"
              rel="noopener noreferrer"
            >
              {formatAddress(txid)}
              <Image
                src="/external-link-2.png"
                alt="External Link"
                width={14}
                height={14}
                className="ml-2 w-[14px] h-[14px] mt-[4px]"
              />
            </Link>
          </div>
        </div>
      </Modal> */}

      {Boolean(utxos?.length) &&
        (isDeckOpen || configs.isInputFullDeckOpen) && (
          <div
            onClick={() =>
              setConfigs((prev) => ({
                ...prev,
                isInputDeckOpen: false,
                isOutputDeckOpen: false,
                isInputFullDeckOpen: false,
              }))
            }
            className="w-full rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-zinc-600 flex flex-col cursor-pointer hover:bg-zinc-800 hover:border-zinc-500"
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
          onClick={() => {
            track("portfolio", {}, { flags: ["portfolio"] })
            setConfigs((prev) => ({
              ...prev,
              isInputFullDeckOpen:
                (utxos?.length || 0) >= 20 ? !prev.isInputFullDeckOpen : false,
              isInputDeckOpen:
                (utxos?.length || 0) < 20 ? !prev.isInputDeckOpen : false,
            }))
          }}
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

      {/* {Boolean(configs.feeRate) && (
        <div className="w-full rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-zinc-600 flex flex-col">
          <div className="text-[12px] flex items-center justify-center opacity-50">
            Fee Rate
          </div>
          <div className="flex justify-center items-center">
            <span className="whitespace-nowrap">{configs.feeRate} sat/vb</span>
          </div>
        </div>
      )} */}

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
          {!allTxIsSigned && userCanSign && (
            <button
              data-tooltip-id={"confirm"}
              data-tooltip-content={confirmTooltip}
              data-tooltip-place="top"
              onClick={onConfirm}
              disabled={isConfirmDisabled || confirmed}
              className={`max-w-[170px] min-w-[170px] rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-zinc-600 flex flex-col hover:bg-zinc-600 hover:border-zinc-400 justify-center items-center ${
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
          )}

          {!isConfirmDisabled && Boolean(configs.feeCost) && allTxIsSigned && (
            <div
              data-tooltip-id={"confirm"}
              data-tooltip-content={
                !psbtSigned.txid
                  ? "Click to broadcast. Transaction is signed, but was not sent to the network yet."
                  : "Transaction broadcasted"
              }
              data-tooltip-place="top"
              onClick={!psbtSigned.txid ? onBroadcast : () => {}}
              className={`w-full rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-zinc-600 flex flex-col cursor-pointer hover:bg-zinc-800 hover:border-zinc-500 ${
                psbtSigned.txid ? "opacity-50" : ""
              }`}
            >
              <div className="text-[12px] flex items-center justify-center opacity-50">
                Action
              </div>
              {!psbtSigned.txid && (
                <div className="absolute right-[0px] top-[0px]">
                  <span className="relative flex h-3 w-3">
                    {!isConfirmDisabled && !confirmed && (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </>
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-center items-center">
                {!psbtSigned.txid ? (
                  <>
                    Broadcast
                    <Image
                      src="/signal.png"
                      alt="Broadcast"
                      width={16}
                      height={16}
                      className="ml-2"
                    />
                  </>
                ) : (
                  <div className="flex text-nowrap">Broadcasted ✅</div>
                )}
              </div>
            </div>
          )}

          {!isConfirmDisabled && Boolean(configs.feeCost) && (
            <div
              onClick={copyToClipboard}
              className="w-full rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-2 border-2 border-zinc-600 flex flex-col cursor-pointer hover:bg-zinc-800 hover:border-zinc-500"
            >
              <div className="text-[12px] flex items-center justify-center opacity-50">
                Share
              </div>
              <div className="flex justify-center items-center">
                Copy{" "}
                <Image
                  src="/share.png"
                  alt="Copy"
                  width={16}
                  height={16}
                  className="ml-2"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
