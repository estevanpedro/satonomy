import { Modal } from "@/app/components/Modal"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { useAccounts } from "@particle-network/btc-connectkit"
import { useState } from "react"
import { useRecoilState } from "recoil"

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
    <div className="flex gap-2">
      <input
        placeholder="Enter wallet address"
        className="w-full py-2 border rounded px-2 placeholder-zinc-600"
        value={wallet}
        onChange={onChange}
      />
      {isConnected ? (
        <div>Connected</div>
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
      <div
        onClick={() => setIsOpen(true)}
        className="h-[32px] w-[32px] rounded border border-zinc-600 flex text-center items-center justify-center cursor-pointer"
      >
        ⚙️
      </div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="w-full h-full flex flex-col sm:min-w-[500px]">
          <div className="mb-2">Configurations</div>
          <div className="mb-6 text-zinc-500">Manage multiples wallet</div>
          <div className="flex flex-col gap-2">
            {accounts.map((account, index) => (
              <div key={index}>
                <WalletInput wallet={account} isConnected={true} />
              </div>
            ))}

            {walletConfigs.wallets.map((wallet, index) => (
              <div key={index}>
                <WalletInput
                  wallet={wallet}
                  onChange={(e) => onChange(e, index)}
                  onRemove={onRemove}
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
