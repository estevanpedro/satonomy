import { Modal } from "@/app/components/Modal"
import { configAtom } from "@/app/recoil/confgsAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { useAccounts } from "@particle-network/btc-connectkit"
import { useEffect, useRef, useState } from "react"
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
  return (
    <div className="flex gap-2 items-center justify-center">
      <input
        placeholder="Enter wallet address"
        className="w-full py-2 border rounded px-2 placeholder-zinc-600 "
        value={wallet}
        onChange={onChange}
        disabled={isConnected}
      />
      {isConnected ? (
        <div>✅</div>
      ) : (
        <button onClick={() => onRemove?.(wallet)}>🗑️</button>
      )}
    </div>
  )
}

export const WalletConfigsModal = () => {
  const { accounts } = useAccounts()
  const [walletConfigs, setWalletConfigs] = useRecoilState(walletConfigsAtom)
  const [isOpen, setIsOpen] = useState(false)
  const configs = useRecoilValue(configAtom)
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

  const onChange = (e: any, index: number) => {
    const wallet = e.target.value
    setWalletConfigs((prev) => ({
      ...prev,
      wallets: prev.wallets.map((w, i) => (i === index ? wallet : w)),
    }))
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
  }

  return (
    <>
      {configs.proMode && (
        <div
          onClick={() => setIsOpen(true)}
          className="h-[32px] w-[32px] rounded border border-zinc-600 flex text-center items-center justify-center cursor-pointer text-[24px]"
        >
          ⚙️
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="w-full h-full flex flex-col sm:min-w-[500px]">
          <div className="mb-2">Configurations</div>
          <div className="mb-6 text-zinc-500">Manage multiples wallet</div>
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
          </div>
        </div>
      </Modal>
    </>
  )
}
