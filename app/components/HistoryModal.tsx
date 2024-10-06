import { Modal } from "@/app/components/Modal"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { errorsAtom } from "@/app/recoil/errors"
import { historyAtom } from "@/app/recoil/history"
import { loadingAtom } from "@/app/recoil/loading"
import { utxoAtom } from "@/app/recoil/utxoAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { formatAddress } from "@/app/utils/format"
import { useAccounts } from "@particle-network/btc-connectkit"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Tooltip } from "react-tooltip"
import { useRecoilState, useRecoilValue } from "recoil"

const WalletInput = ({
  wallet,
  onChange,
  onRemove,
  isConnected,
}: {
  wallet: string
  onChange?: (e: any) => void
  onRemove?: (wallet: any) => void
  isConnected?: boolean
}) => {
  const utxos = useRecoilValue(utxoAtom)
  const loading = useRecoilValue(loadingAtom)
  const errors = useRecoilValue(errorsAtom)
  const hasError = errors.walletErrorList?.includes(wallet)

  const content = () => {
    if (isConnected) {
      return "Connected"
    }
    if (loading.walletLoadingList?.includes(wallet)) {
      return "Loading..."
    }
    if (hasError) {
      return "Too many UTXOs in this wallet. >500 coming soon!"
    }
    return `☑️ ${
      utxos?.filter((u) => u.wallet === wallet).length || 0
    } UTXOs loaded`
  }

  return (
    <div
      className="flex gap-2 items-center justify-center"
      data-tooltip-id={`tooltip-wallets`}
      data-tooltip-content={content()}
      data-tooltip-place={"right"}
    >
      <input
        placeholder="Enter wallet address"
        className={`w-full py-2 border rounded px-2 placeholder-zinc-600 ${
          hasError ? "border-red-500" : ""
        } outline-none`}
        value={wallet}
        onChange={onChange}
        disabled={isConnected}
      />
      {isConnected ? (
        <div>✅</div>
      ) : (
        <>
          {loading.walletLoadingList?.includes(wallet) && (
            <div>
              {" "}
              <div
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#6839B6] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
            </div>
          )}

          <button onClick={() => onRemove?.(wallet)}>🗑️</button>
        </>
      )}
    </div>
  )
}

export const HistoryModal = () => {
  const { accounts } = useAccounts()
  const [walletConfigs, setWalletConfigs] = useRecoilState(walletConfigsAtom)
  const [isOpen, setIsOpen] = useState(false)
  const configs = useRecoilValue(configsAtom)
  const previousProModeRef = useRef(configs.proMode) // To store the previous mode

  useEffect(() => {
    const accountsIncluded = walletConfigs.wallets.filter((w) =>
      accounts.includes(w)
    )

    // If proMode has changed from true to false (Pro -> Simple)
    if (previousProModeRef.current && !configs.proMode) {
      setWalletConfigs((prev) => ({
        ...prev,
        prevWallets: prev.wallets, // Save previous wallets to prevWallets
        wallets: accounts, // In simple mode, only use current accounts
      }))
    }
    // If proMode has changed from false to true (Simple -> Pro), restore prevWallets
    else if (!previousProModeRef.current && configs.proMode) {
      setWalletConfigs((prev) => {
        const restoredWallets = Array.from(
          new Set([...(prev.prevWallets || []), ...accounts])
        )
        return {
          ...prev,
          wallets: restoredWallets, // Restore wallets from prevWallets and current accounts
        }
      })
    }
    // Normal pro mode behavior: Add new accounts if not already included
    else if (configs.proMode && accountsIncluded.length === 0) {
      setWalletConfigs((prev) => {
        const newWallets = Array.from(new Set([...prev.wallets, ...accounts]))
        if (newWallets.length !== prev.wallets.length) {
          return {
            ...prev,
            wallets: newWallets,
          }
        }
        return prev // No change, prevent unnecessary update
      })
    }

    // Update the previous mode to the current one
    previousProModeRef.current = configs.proMode
  }, [configs.proMode, accounts, setWalletConfigs])

  const onClose = () => setIsOpen(false)

  const history = useRecoilValue(historyAtom)

  return (
    <>
      {configs.proMode && Boolean(history.length) && (
        <div
          onClick={() => setIsOpen(true)}
          className="h-[32px] w-[32px] rounded border border-zinc-600 flex text-center items-center justify-center cursor-pointer text-[24px] hover:scale-105 transition-all duration-300"
        >
          <Image src="/history.png" width={20} height={20} alt="Wallets" />
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="w-full h-full flex flex-col max-w-[580px]">
          <Tooltip
            id={`tooltip-wallets`}
            className="max-w-[210px] bg-gray-600 text-[12px] pr-0 z-91"
            style={{ backgroundColor: "#292929", color: "white" }}
          />

          <h2 className="mb-2 text-2xl">Transaction History</h2>
          <div className="mb-6 text-zinc-500">
            Check your previous transactions saved on local storage (temporary).
          </div>
          <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
            {history.map((h, index) => (
              <div
                key={index}
                className="border p-4 gap-2 flex flex-col items-between"
              >
                <p>Inputs: {h.inputs}</p>
                <p>Outputs: {h.outputs}</p>

                <p className="flex gap-1">
                  Txid:{" "}
                  <Link
                    href={`https://mempool.space/tx/${h.txid}`}
                    className="] font-normal text-[#6839B6] hover:text-[#3478F7] flex  text-start"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {formatAddress(h.txid)}
                  </Link>
                </p>
                <p>Timestamp: {h.timestamp}</p>
                <a
                  href={h.url}
                  // target="_blank"
                  // rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-200 border py-2 px-4 rounded hover:border-zinc-200 text-center"
                >
                  OPEN
                </a>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  )
}
