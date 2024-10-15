"use client"

import React, { useState, useEffect } from "react"
import { formatAddress } from "@/app/utils/format"
import { useAccounts, useConnectModal } from "@particle-network/btc-connectkit"
import { useRecoilState, useRecoilValue } from "recoil"
import { utxoAtom } from "@/app/recoil/utxoAtom"
import { toast } from "react-toastify"
import { toastOptions } from "@/app/components/Toast"
import Image from "next/image"
import { WalletConfigsModal } from "@/app/components/WalletConfigsModal"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"

export const ConnectButton = ({
  mobileVisible,
  isClean,
}: {
  mobileVisible?: boolean
  isClean?: boolean
}) => {
  const { openConnectModal, disconnect } = useConnectModal()
  const { accounts } = useAccounts()
  const utxos = useRecoilValue(utxoAtom)
  const [configs, setConfigs] = useRecoilState(configsAtom)
  const walletConfigs = useRecoilValue(walletConfigsAtom)
  const [dropdownVisible, setDropdownVisible] = useState(false)

  const account = accounts!.length > 1 ? accounts[1] : accounts![0]
  const wallet = account || ""

  const handleMouseEnter = () => {
    setDropdownVisible(true)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    try {
      if (
        !e.relatedTarget ||
        (e.relatedTarget &&
          !document
            .querySelector(".dropdown-container")
            ?.contains(e.relatedTarget as Node))
      ) {
        setDropdownVisible(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      try {
        const dropdownElement = document.querySelector(".dropdown-container")
        const walletsElement = document.getElementById("wallets")

        if (walletsElement && walletsElement.contains(e.target as Node)) {
          return
        }
        if (dropdownElement && dropdownElement.contains(e.target as Node)) {
          return
        }

        if (
          dropdownVisible &&
          dropdownElement &&
          (!e.relatedTarget ||
            !dropdownElement.contains(e.relatedTarget as Node))
        ) {
          setDropdownVisible(false)
        }
      } catch (error) {
        console.log(error)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownVisible])

  const onDisconnect = () => {}

  const copyWallet = (wallet: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(wallet).then(
        () => console.log("Text copied to clipboard"),
        (err) => console.error("Could not copy text: ", err)
      )
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = wallet
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

    toast(<div>Wallet copied to clipboard. </div>, toastOptions)
  }

  const hasUtxosOnPortfolio = utxos
    ?.filter((u) => u.status.confirmed)
    ?.filter(
      (u) =>
        u.wallet &&
        (accounts?.includes(u.wallet) ||
          walletConfigs.wallets.includes(u.wallet))
    ).length

  return (
    <div
      className={`relative dropdown-container gap-3 justify-center items-center ${
        mobileVisible ? "flex" : "hidden sm:flex"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {dropdownVisible && (configs?.proMode || account) && (
        <div className="absolute left-0 mt-[84px] w-full h-full">
          <div className="flex flex-col w-full gap-3 pt-4 bg-black border-l-[1px] border-r-[1px] border-b-[1px] px-3 pb-3">
            {configs.proMode && (
              <WalletConfigsModal
                triggerComponent={
                  <button
                    id="wallets"
                    className="text-nowrap hover:scale-105 text-white bg-zinc-900 px-6 py-2 rounded-md w-full hover:bg-zinc-800 flex gap-2 justify-center items-center"
                  >
                    <Image
                      src="/wallet-99.png"
                      width={15}
                      height={15}
                      alt="Wallets"
                    />
                    Multiple Wallets
                  </button>
                }
              />
            )}

            {Boolean(hasUtxosOnPortfolio) && (
              <button
                className=" font-bold text-white bg-zinc-900 px-6 py-2 rounded-md w-full hover:bg-zinc-800 flex gap-2 justify-center items-center hover:scale-105"
                onClick={() => {
                  console.log("Portfolio")
                  setConfigs((prev) => ({
                    ...prev,
                    fullDeckSearchWallet: "",
                    fullDeckSearchType: "all",
                    isInputDeckOpen: false,
                    isOutputDeckOpen: false,
                    isInputFullDeckOpen: true,
                  }))
                  setDropdownVisible(false)
                }}
              >
                <Image
                  src="/card-games-3.png"
                  width={18}
                  height={18}
                  alt="Deck"
                />
                Portfolio
              </button>
            )}

            {account && (
              <button
                className="hover:scale-105 font-bold text-white bg-zinc-900 px-6 py-2 rounded-md w-full hover:bg-zinc-800 flex gap-2 justify-center items-center"
                onClick={() => {
                  disconnect?.()
                  setDropdownVisible(false)
                  onDisconnect()
                }}
              >
                <Image src="/logout.png" width={14} height={14} alt="Logout" />
                Disconnect
              </button>
            )}
          </div>
        </div>
      )}

      <div
        className={`flex gap-1 items-center  px-4 py-2 rounded z-1 ${
          isClean ? "px-0 py-0" : "border"
        }`}
      >
        <div
          onClick={() => (wallet ? copyWallet(wallet) : null)}
          className="hover:opacity-80 flex justify-center items-center gap-2 "
        >
          {!accounts.length && (
            <button
              className="text-white bg-zinc-900 px-4 h-[32px] rounded-md "
              onClick={() => {
                if (!wallet) {
                  openConnectModal?.()
                } else {
                  copyWallet(wallet)
                }
              }}
            >
              {account ? formatAddress(account) : "Connect Wallet"}
            </button>
          )}
          {Boolean(wallet) && formatAddress(wallet)}{" "}
          {Boolean(wallet) && (
            <Image
              src="/copy.png"
              width={12}
              height={12}
              alt="Wallets"
              className="w-3 h-3 cursor-pointer"
            />
          )}
        </div>

        {!isClean && (
          <div
            className={`ml-2  ${configs.proMode ? "" : "pointer-events-none"}`}
          >
            <WalletConfigsModal isClean={isClean} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectButton
