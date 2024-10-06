import { Modal } from "@/app/components/Modal"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { errorsAtom } from "@/app/recoil/errors"
import { loadingAtom } from "@/app/recoil/loading"
import { utxoAtom } from "@/app/recoil/utxoAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { useAccounts } from "@particle-network/btc-connectkit"
import Image from "next/image"
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
        <div>🌏</div>
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

export const WalletConfigsModal = () => {
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
      setWalletConfigs((prev) => {
        return {
          prevWallets: prev.wallets, // Save previous wallets to prevWallets
          wallets: accounts, // In simple mode, only use current accounts
        }
      })
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

  const onChange = (e: any, index: number) => {
    const wallet = e.target.value

    // Update state
    setWalletConfigs((prev) => ({
      ...prev,
      wallets: prev.wallets.map((w, i) => (i === index ? wallet : w)),
    }))

    // Get existing wallets from localStorage
    const localWalletConfigs = localStorage?.getItem("localWalletConfigs")
    let localWallets: string[] = localWalletConfigs
      ? JSON.parse(localWalletConfigs).wallets || []
      : []

    // Add new wallet if it doesn't already exist
    if (!localWallets.includes(wallet)) {
      localWallets = [...localWallets, wallet]
    }

    // Update localStorage
    localStorage.setItem(
      "localWalletConfigs",
      JSON.stringify({ wallets: localWallets })
    )
  }

  const onAddMoreWallet = () => {
    setWalletConfigs((prev) => ({
      ...prev,
      wallets: [...prev.wallets, ""],
    }))
  }

  const onRemove = (wallet: string) => {
    setWalletConfigs((prev) => ({
      ...prev,
      wallets: prev.wallets.filter((w) => w !== wallet),
    }))

    // Get existing wallets from localStorage
    const localWalletConfigs = localStorage?.getItem("localWalletConfigs")
    let localWallets: string[] = localWalletConfigs
      ? JSON.parse(localWalletConfigs).wallets || []
      : []

    // Remove wallet from localStorage
    localWallets = localWallets.filter((w) => w !== wallet)

    // Update localStorage
    localStorage.setItem(
      "localWalletConfigs",
      JSON.stringify({ wallets: localWallets })
    )
  }

  return (
    <>
      {configs.proMode && (
        <div
          onClick={() => setIsOpen(true)}
          className="h-[32px] w-[32px] rounded border border-zinc-600 flex text-center items-center justify-center cursor-pointer text-[24px] hover:scale-105 transition-all duration-300"
        >
          <Image src="/wallet.png" width={20} height={20} alt="Wallets" />
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="w-full h-full flex flex-col max-w-[580px]">
          <Tooltip
            id={`tooltip-wallets`}
            className="max-w-[210px] bg-gray-600 text-[12px] pr-0 z-91"
            style={{ backgroundColor: "#292929", color: "white" }}
          />

          <h2 className="mb-2 text-2xl">Manage Multiple Wallets</h2>
          <div className="mb-6 text-zinc-500">
            Connect your wallets or add them manually to easily track and manage
            all UTXOs from your addresses. Create a PSBT and share it with
            multiple signers.
          </div>
          <div className="flex flex-col gap-2">
            {/* {accounts.map((account, index) => (
              <div key={index}>
                <WalletInput wallet={account}  />
              </div>
            ))} */}

            {walletConfigs.wallets.map((wallet, index) => (
              <div key={index}>
                <WalletInput
                  wallet={wallet}
                  onChange={(e) => onChange(e, index)}
                  onRemove={onRemove}
                  isConnected={accounts.includes(wallet)}
                />
              </div>
            ))}

            <div className="mt-2">
              <button
                className="text-zinc-400 hover:text-zinc-200 border py-2 px-4 rounded"
                onClick={onAddMoreWallet}
              >
                Add wallet
              </button>
            </div>

            <div className="mt-4 text-[12px] opacity-40">
              This feature is available in Pro mode only.
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
