import { utxoAtom } from "@/app/recoil/utxoAtom"
import Image from "next/image"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { Tooltip } from "react-tooltip"
import { formatNumber } from "@/app/utils/format"
import { useAccounts } from "@particle-network/btc-connectkit"
import { track } from "@vercel/analytics"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { psbtService } from "@/app/services/psbtService"
import { runesAtom } from "@/app/recoil/runesAtom"
import { encodeData } from "@/app/utils/encodeButterfly"
import { psbtSignedAtom } from "@/app/recoil/psbtAtom"
import { toast } from "react-toastify"
import { toastOptions } from "@/app/components/Toast"
import { loadingAtom } from "@/app/recoil/loading"
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { historyAtom } from "@/app/recoil/history"
import { useSignPsbt } from "@/app/hooks/useSignPsbt"
import { isValidWallet } from "@/app/components/WalletConfigsModal"

export const ConfigDeck = () => {
  const loading = useRecoilValue(loadingAtom)
  const [psbtSigned, setPsbtSigned] = useRecoilState(psbtSignedAtom)
  const runes = useRecoilValue(runesAtom)
  const [utxos, setUtxos] = useRecoilState(utxoAtom)
  const [configs, setConfigs] = useRecoilState(configsAtom)
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom)
  const { accounts } = useAccounts()
  const account = accounts[0]
  const ordinals = useRecoilValue(ordinalsAtom)
  const setHistory = useSetRecoilState(historyAtom)
  const isDeckOpen = configs?.isInputDeckOpen || configs?.isOutputDeckOpen
  const { signPsbt } = useSignPsbt()
  let position = isDeckOpen && utxos?.length ? "bottom-[356px]" : "bottom-[0px]"

  const txIdHasError = psbtSigned.txid?.includes("error")

  if (configs.isInputFullDeckOpen) {
    position = "top-[19px]"
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

  const hasInvalidInputsOrOutputs = butterfly.outputs.some(
    (o) => (!o.address || !isValidWallet(o.address)) && o.type !== "OP RETURN"
  )

  const isConfirmDisabled =
    difference !== 0 ||
    outputValues - configs.feeCost < 0 ||
    runesButterflyBalance !== 0 ||
    configs.feeRateEstimated < 2 ||
    hasInvalidInputsOrOutputs

  const confirmed = configs.isConfirmedModalTxId

  const onConfirm = async (e: any) => {
    e.preventDefault()
    try {
      const alreadyPsbtHexSigned = psbtSigned.psbtHexSigned

      if (alreadyPsbtHexSigned) {
        const psbtHexSigned = await signPsbt(alreadyPsbtHexSigned)

        if (psbtHexSigned) {
          const inputsSigned = butterfly.inputs.filter(
            (i) => i.wallet === account
          )

          setPsbtSigned({
            psbtHexSigned,
            inputsSigned: [...psbtSigned.inputsSigned, ...inputsSigned],
          })
        }

        return
      }

      const res = await fetch("/api/psbt", {
        method: "POST",
        body: JSON.stringify({ butterfly, account }),
      })
      const result = await res.json()

      if (result?.psbtHex) {
        track("psbt-created", { wallet: account })
        const psbtHexSigned = await signPsbt(result.psbtHex)

        if (psbtHexSigned) {
          track("psbt-signed", { wallet: account })
          const newInputsSigned = butterfly.inputs.filter(
            (i) => i.wallet === account
          )
          setPsbtSigned({
            psbtHexSigned,
            inputsSigned: [...psbtSigned.inputsSigned, ...newInputsSigned],
          })
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

    const allOrdinals = ordinals?.flatMap((o) => o.inscription) || []

    const ordinalsObj =
      butterfly.outputs.filter((o) => o.type === "inscription")?.[0] ||
      allOrdinals.find((i) =>
        butterfly.inputs.find(
          (b) => b.txid === i.utxo.txid && b.vout === i.utxo.vout
        )
      )

    const stringToCopy = `http://${
      window.location.hostname
    }/?b=${butterflyUrl}&c=${configsUrl}${runesUrl ? `&r=${runesUrl}` : ""}${
      psbtSigned.psbtHexSigned
        ? `&psbtHexSigned=${psbtSigned.psbtHexSigned}`
        : ""
    }${psbtSigned.txid ? `&txid=${psbtSigned.txid}` : ""}${
      ordinalsObj ? `&o=${encodeData([ordinalsObj])}` : ""
    }`

    try {
      history.pushState({}, "", stringToCopy)
    } catch (error) {
      console.error("Could not update URL: ", error)
    }

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
    butterfly.inputs.find((i) => i.wallet && accounts.includes(i.wallet)) &&
    inputsSigned.length === butterfly.inputs.length

  const userCanSign = butterfly.inputs.find(
    (i) => i.wallet && accounts.includes(i.wallet)
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
          const newURL = `${window.location.href}?${searchParams.toString()}`

          try {
            history.pushState({}, "", newURL)
          } catch (error) {
            console.error("Could not update URL: ", error)
          }

          const historyObj = {
            inputs: butterfly.inputs.length,
            outputs: butterfly.outputs.length,
            txid: txidRes,
            url: newURL,
            timestamp: new Date().toISOString(),
          }

          setHistory((prev) => [historyObj, ...prev])

          setUtxos(
            (prev) =>
              prev?.filter(
                (utxo) =>
                  !butterfly.inputs.find(
                    (i) => i.txid === utxo.txid && i.vout === utxo.vout
                  )
              ) || []
          )
        }

        // update utxos used

        toast.success("Broadcast Successfully", toastOptions)
      } else {
        track("error-broadcast", { wallet: account })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const hasWalletLoading = loading?.walletLoadingList?.length > 0

  const resetButterfly = () => {
    setButterfly({ inputs: [], outputs: [] })
    setConfigs((prev) => ({
      ...prev,
      isInputDeckOpen: false,
      isOutputDeckOpen: false,
      feeCost: 0,
      fullDeckSearchType: "all",
      fullDeckSearchWallet: "",
    }))
    setPsbtSigned({ inputsSigned: [], psbtHexSigned: "" })
    // remove params from url
    window.history.replaceState({}, "", "/")

    track("resetButterfly", {}, { flags: ["resetButterfly"] })
  }

  const onPortfolioClick = () => {
    if (configs.isInputDeckOpen || configs.isOutputDeckOpen) {
      setConfigs((prev) => ({
        ...prev,
        isInputDeckOpen: false,
        isOutputDeckOpen: false,
        isInputFullDeckOpen: true,
      }))

      return
    }

    track("portfolio", {}, { flags: ["portfolio"] })
    setConfigs((prev) => ({
      ...prev,
      isInputFullDeckOpen:
        (utxos?.length || 0) >= 20 || prev.isInputDeckOpen
          ? !prev.isInputFullDeckOpen
          : false,
      isInputDeckOpen:
        (utxos?.length || 0) < 20 ? !prev.isInputDeckOpen : false,
    }))
  }

  return (
    <div
      className={`z-10 fixed flex gap-2 ${position} w-full items-center justify-center`}
    >
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
            className="absolute left-2 rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-b-0 border-zinc-600 flex flex-col cursor-pointer hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-200 transform opacity-0 translate-y-4 animate-fade-slide"
          >
            <div className="text-[12px] flex items-center justify-center opacity-50">
              esc
            </div>
            <div className="flex justify-center items-center">Close</div>
          </div>
        )}

      {(butterfly.inputs?.length > 0 || butterfly.outputs?.length > 0) && (
        <button
          id="clean"
          onClick={resetButterfly}
          className="justify-center items-center w-[120px] rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-zinc-600 hidden sm:flex flex-col hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-200 transform opacity-0 translate-y-4 animate-fade-slide"
        >
          <div
            id="clean"
            className="text-[12px] flex items-center justify-center opacity-50"
          >
            Board
          </div>
          <div className="flex gap-2 items-center justify-center">
            Clean{" "}
            <Image
              src="/trash.png"
              width={16}
              height={16}
              alt="Directions"
              className="w-[16px] h-[16px] "
            />
          </div>
        </button>
      )}

      {!isConfirmDisabled &&
        Boolean(configs.feeCost) &&
        !configs.isInputFullDeckOpen &&
        !configs.isOutputDeckOpen &&
        !configs.isInputDeckOpen && (
          <div
            onClick={copyToClipboard}
            className="w-[120px] rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-2 border-2 border-zinc-600 flex flex-col cursor-pointer hover:bg-zinc-800 hover:border-zinc-500"
          >
            <div className="text-[12px] flex items-center justify-center opacity-50">
              Link
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

      {Boolean(utxos?.length) && (
        <div
          className={`transition-all duration-200 transform opacity-0 translate-y-4 animate-fade-slide w-[300px] rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 hover:bg-zinc-800 py-2 px-6 border-2 border-zinc-600 hover:border-zinc-500 cursor-pointer`}
          onClick={onPortfolioClick}
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

            {hasWalletLoading && (
              <div
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#6839B6] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
            )}
            {!hasWalletLoading && (
              <Image
                src="/wallet.png"
                alt="Arrow"
                width={16}
                height={16}
                style={{
                  transform: !configs.isInputFullDeckOpen
                    ? ""
                    : "rotate(180deg)",
                }}
              />
            )}
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
        <div className="w-[160px] rounded-tl-[20px] rounded-tr-[20px] bg-zinc-900 py-2 px-4 border-2 border-zinc-600 hidden sm:flex flex-col opacity-50">
          <div className="text-[12px] flex items-center justify-center opacity-50 whitespace-nowrap">
            Balance
          </div>
          {!isConfirmDisabled && (
            <div className="flex gap-2 justify-center items-center">
              ✅ {confirmed ? " Broadcasted" : ""}
            </div>
          )}
          {isConfirmDisabled && (
            <div className="flex gap-2 justify-center items-center">
              <span className="whitespace-nowrap">
                {`${formatNumber(
                  inputValues - outputValues,
                  0,
                  0,
                  false,
                  false
                )}`}{" "}
                sats
              </span>
            </div>
          )}
        </div>
      )}

      {Boolean(configs.feeCost) && (
        <>
          <Tooltip
            defaultIsOpen
            id={"confirm"}
            className="max-w-[250px] bg-gray-600"
            style={{ backgroundColor: "#292929", color: "white" }}
          />
          <Tooltip
            defaultIsOpen
            id={"confirm-2"}
            className="max-w-[250px] bg-gray-600"
            style={{ backgroundColor: "#292929", color: "white" }}
          />
          {!allTxIsSigned && userCanSign && (
            <button
              data-tooltip-id={"confirm-2"}
              data-tooltip-content={confirmTooltip}
              data-tooltip-place="top"
              onClick={onConfirm}
              disabled={isConfirmDisabled || confirmed}
              className={`max-w-[170px] min-w-[170px] rounded-tl-[20px] rounded-tr-[20px] bg-green-900 py-2 px-4 border-2 border-green-600 flex flex-col hover:bg-green-600 hover:border-green-400 justify-center items-center ${
                isConfirmDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-100 cursor-pointer bg-gradient-to-b from-green-700 to-green-600 border-green-600"
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
                  : `${
                      txIdHasError
                        ? `${psbtSigned.txid}`
                        : "Transaction broadcasted successfully"
                    }`
              }
              data-tooltip-place="top"
              onClick={
                !psbtSigned.txid
                  ? onBroadcast
                  : () => {
                      window
                        ?.open(
                          `https://mempool.space/tx/${psbtSigned.txid}`,
                          "_blank"
                        )
                        ?.focus()
                    }
              }
              className={`max-w-[300px] bg-gradient-to-b ${
                txIdHasError
                  ? ""
                  : "from-green-700 to-green-600 border-green-600"
              } transition-transform duration-300 relative w-full rounded-tl-[20px] rounded-tr-[20px] py-2 px-4 border-2 flex flex-col cursor-pointer hover:bg-green-800 hover:border-green-300`}
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

              <div className="flex justify-center items-center ">
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
                  <div className="flex text-nowrap">
                    {txIdHasError ? "Not" : ""} Broadcasted{" "}
                    {txIdHasError ? "❎" : "✅"}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
