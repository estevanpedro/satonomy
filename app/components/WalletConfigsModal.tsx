import { Modal } from "@/app/components/Modal"
import { WalletImage } from "@/app/components/WalletImage"
import { WalletUtxoType } from "@/app/components/WalletUtxoType"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { errorsAtom } from "@/app/recoil/errors"
import { loadingAtom } from "@/app/recoil/loading"
import { utxoAtom } from "@/app/recoil/utxoAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { useAccounts, useBTCProvider } from "@particle-network/btc-connectkit"

import Image from "next/image"
import React, { useEffect, useRef, useState } from "react"
import { Tooltip } from "react-tooltip"
import { useRecoilState, useRecoilValue } from "recoil"

export const isValidWallet = (wallet: string) => {
  return wallet.length === 34 || wallet.length === 62 || wallet.length === 42
}

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
      return `Connected with ${
        utxos?.filter((u) => u.wallet === wallet).length || 0
      } UTXOs`
    }
    if (loading.walletLoadingList?.includes(wallet)) {
      return "Loading..."
    }
    if (hasError) {
      return "Too many UTXOs or something else"
    }
    return `☑️ ${
      utxos?.filter((u) => u.wallet === wallet).length || 0
    } UTXOs loaded`
  }

  const onInputChange = (e: any) => {
    onChange?.(e)
  }

  return (
    <div
      className="flex gap-2 items-center justify-center relative"
      data-tooltip-id={`tooltip-wallets`}
      data-tooltip-content={content()}
      data-tooltip-place={"right"}
    >
      <input
        type="text"
        placeholder="Enter wallet address"
        className={`w-full py-2 border  rounded-t-md px-2 placeholder-zinc-600 ${
          hasError ? "border-red-500" : ""
        } outline-none ${!isValidWallet(wallet) ? "rounded-b-md" : ""}`}
        value={wallet}
        onChange={(e) => onInputChange(e)}
        disabled={isConnected}
      />
      {isConnected ? (
        <div className="absolute right-2">
          <WalletImage wallet={wallet} />
        </div>
      ) : (
        <>
          {loading.walletLoadingList?.includes(wallet) && (
            <div className="absolute right-4 top-[10px]">
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
          {!loading.walletLoadingList?.includes(wallet) && (
            <>
              <button
                className="absolute right-4 top-[10px]"
                onClick={() => onRemove?.(wallet)}
              >
                🗑️
              </button>

              <div className="absolute right-10">
                <WalletImage wallet={wallet} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export const WalletConfigsModal = ({
  triggerComponent,
  onClick,
  isClean,
}: {
  triggerComponent?: React.ReactElement
  onClick?: () => void
  isClean?: boolean
}) => {
  const { accounts } = useAccounts()
  const [walletConfigs, setWalletConfigs] = useRecoilState(walletConfigsAtom)
  const [isOpen, setIsOpen] = useState(false)
  const [configs, setConfigs] = useRecoilState(configsAtom)
  const previousProModeRef = useRef(configs.proMode) // To store the previous mode
  const { provider } = useBTCProvider()

  const isMagicEden = Boolean(provider?.isMagicEden)

  const isXVerse =
    Boolean(provider?.signMultipleTransactions) &&
    !Boolean(provider?.isMagicEden)

  const isUnisat = Boolean(provider?.isAtomicalsEnabled)
  const isOkxWallet =
    Boolean(provider?.isOkxWallet) || Boolean(provider?.isOKExWallet)

  const connections = {
    isMagicEden,
    isXVerse,
    isUnisat,
    isOkxWallet,
  }

  useEffect(() => {
    const accountsIncluded = walletConfigs.wallets.filter((w) =>
      accounts.includes(w)
    )

    // If proMode has changed from true to false (Pro -> Simple)

    if (previousProModeRef.current && !configs.proMode) {
      setWalletConfigs((prev) => {
        return {
          images: prev.images, // Keep images as is
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
            images: [
              ...(prev?.images || []),
              ...accounts.map((account) => {
                return {
                  [account]: connections,
                }
              }),
            ],
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

    if (
      configs.isInputFullDeckOpen ||
      configs.isInputDeckOpen ||
      configs.isOutputDeckOpen
    ) {
      setConfigs((prev) => ({
        ...prev,
        isInputDeckOpen: false,
        isInputFullDeckOpen: false,
        isOutputDeckOpen: false,
      }))
    }
    // Update state
    setWalletConfigs((prev) => ({
      ...prev,
      wallets: prev.wallets.map((w, i) => (i === index ? wallet : w)),
    }))

    // Get existing wallets from localStorage
    // const localWalletConfigs = localStorage?.getItem("localWalletConfigs")
    // let localWallets: string[] = localWalletConfigs
    //   ? JSON.parse(localWalletConfigs).wallets || []
    //   : []

    // // Add new wallet if it doesn't already exist
    // if (!localWallets.includes(wallet)) {
    //   localWallets = [...localWallets, wallet]
    // }

    // // Update localStorage
    // localStorage.setItem(
    //   "localWalletConfigs",
    //   JSON.stringify({ wallets: localWallets })
    // )
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

  const [isVisibleDetailsList, setIsVisibleDetailsList] = useState<
    number[] | undefined
  >()

  const onMouseEnter = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    setIsVisibleDetailsList((prev) => {
      // if (prev?.includes(index)) {
      //   return prev?.filter((i) => i !== index)
      // }
      return [...(prev || []), index]
    })
  }
  const onMouseLeave = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    setIsVisibleDetailsList((prev) => {
      return prev?.filter((i) => i !== index)
    })
  }

  return (
    <>
      {triggerComponent ? (
        <div
          onClick={() => {
            setIsOpen(true)
            onClick?.()
          }}
          className=""
        >
          {triggerComponent}
        </div>
      ) : (
        <div
          onClick={() => setIsOpen(true)}
          className={`${
            configs.proMode ? "border bg-zinc-900" : "bg-transparent"
          } h-[32px] w-[32px] rounded  border-zinc-600 flex text-center items-center justify-center cursor-pointer text-[24px] hover:scale-105 transition-all duration-300 hover:opacity-80`}
        >
          <Image src="/wallet.png" width={20} height={20} alt="Wallets" />
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <div
          className="w-full h-full flex flex-col max-w-[600px]"
          onMouseLeave={(e) => setIsVisibleDetailsList([])}
        >
          <Tooltip
            id={`tooltip-wallets`}
            className="max-w-[210px] bg-gray-600 text-[12px] pr-0 z-91"
            style={{ backgroundColor: "#292929", color: "white" }}
          />

          <div className="w-full flex justify-between">
            <h2 className="mb-2 text-2xl">Manage Multiple Wallets</h2>
            <div className="cursor-pointer font-bold" onClick={onClose}>
              X
            </div>
          </div>
          <div className="mb-6 text-zinc-500">
            Connect your wallets or add them manually to easily track and manage
            all UTXOs from your addresses. Create a PSBT and share it with
            multiple signers.
          </div>
          <div className="flex flex-col gap-2  overflow-y-scroll max-h-[60vh] no-scrollbar">
            {walletConfigs.wallets.map((wallet, index) => (
              <></>
            ))}

            {walletConfigs.wallets.map((wallet, index) => (
              <div
                key={index}
                onMouseEnter={(e) => onMouseEnter(e, index)}
                className="transition-all duration-1000 delay-75 move-in"
              >
                <WalletInput
                  wallet={wallet}
                  onChange={(e) => onChange(e, index)}
                  onRemove={onRemove}
                  isConnected={accounts.includes(wallet)}
                />
                <div
                  className={` transition-all duration-500 delay-200 transform ${
                    isVisibleDetailsList?.includes(index)
                      ? "max-h-[500px] opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 translate-y-[-20px] pointer-events-none"
                  }`}
                  style={{ overflow: "hidden" }} // Hide content during collapse
                >
                  <WalletUtxoType wallet={wallet} onClose={onClose} />
                </div>
              </div>
            ))}

            <div className="mt-2">
              <button
                className="flex justify-center items-center text-zinc-400 hover:text-zinc-200 border py-2 px-4 rounded"
                onClick={onAddMoreWallet}
              >
                <span className="text-[24px] pr-2 mb-1">+</span>Add wallet
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
