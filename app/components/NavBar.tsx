import { ConnectButton } from "@/app/components/Connect"
import { HistoryModal } from "@/app/components/HistoryModal"
import { Optimizations } from "@/app/components/Optimizations"
import { WalletConfigsModal } from "@/app/components/WalletConfigsModal"

import { configsAtom } from "@/app/recoil/confgsAtom"
import { recommendedFeesAtom } from "@/app/recoil/recommendedFeesAtom"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Tooltip } from "react-tooltip"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"

export const NavBar = () => {
  const recommendedFees = useRecoilValue(recommendedFeesAtom)
  const [clicked, setClicked] = useState(0)
  const [configs, setConfig] = useRecoilState(configsAtom)
  const hourFee = recommendedFees?.halfHourFee

  const onGasClick = () => {
    setClicked(clicked + 1)
    if (clicked > 5) {
      setConfig((old) => ({ ...old, notConfirmed: true }))
      alert("UTXO Unconfirmed Activated")
    }
  }

  const onRefreshClick = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <>
      <div className="z-10 pt-4 pb-3 w-full max-w-[1200px] items-center justify-around  text-sm flex  sm:justify-between">
        <div className="flex items-center justify-center gap-2 font-bold text-[24px] ">
          <Image
            src="/satonomy-logo.png"
            alt="Satonomy"
            width={40}
            height={40}
          />
          <div className="flex flex-col mt-1">
            <div className="flex gap-1 ">
              SATONOMY
              <span className="text-[12px] opacity-50 hidden sm:flex">
                {" "}
                (Beta)
              </span>
            </div>
            <span className=" text-[12px] opacity-70 font-normal hidden sm:flex">
              {" "}
              Manage Bitcoin Transactions
            </span>
          </div>
        </div>

        <div className="flex  items-center justify-center gap-4">
          {Boolean(hourFee) && (
            <div
              className="text-[12px] opacity-50 flex gap-2 mr-4"
              data-tooltip-id={"feerate"}
              data-tooltip-content={"Average 1 hour fee rate"}
              data-tooltip-place="bottom"
            >
              <Tooltip
                id={"feerate"}
                className="max-w-[260px] bg-gray-600"
                style={{ backgroundColor: "#292929", color: "white" }}
              />
              {hourFee}
              <div className="w-[16px]" onClick={onGasClick}>
                <svg viewBox="0 0 512 512" focusable="false" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M304 96c0-9-7-16-16-16H128c-9 0-16 7-16 16v128c0 9 7 16 16 16h160c9 0 16-7 16-16V96zm-32 112H144v-96h128v96z"
                  ></path>
                  <path
                    fill="currentColor"
                    d="m488 113-64-32c-8-4-18 0-22 8s0 17 8 21l24 12-2 6c0 21 16 38 32 45v195a16 16 0 0 1-32 0V240c0-39-32-71-64-79V64c0-36-28-64-63-64H113C77 0 48 28 48 64v358l-23 11c-6 3-9 9-9 15v48c0 9 8 16 17 16h352c9 0 15-7 15-16v-48c0-6-3-12-9-15l-23-11V195c16 6 32 24 32 45v128a48 48 0 0 0 96 0V128c0-6-3-12-8-15zM368 480H48v-22l23-12c6-3 9-8 9-14V64c0-18 15-32 33-32h192c17 0 31 14 31 32v368c0 6 3 11 9 14l23 12v22z"
                  ></path>
                </svg>
              </div>
            </div>
          )}

          <div
            onClick={onRefreshClick}
            data-tooltip-id={"feerate"}
            data-tooltip-content={
              "Refresh the app, delete local data, clean history and disconnect wallets."
            }
            data-tooltip-place="bottom"
            // href={`${window.location.origin}`}
            className="cursor-pointer border-[1px] border-zinc-600 rounded p-1 hover:scale-105 transition-all duration-300 opacity-50"
          >
            <Image src="/refresh.png" width={16} height={16} alt="Refresh" />
          </div>
          <div
            onClick={() => {
              setConfig((old) => ({
                ...old,
                isInputDeckOpen: false,
                isOutputDeckOpen: false,
                isInputFullDeckOpen: false,
                proMode: !old.proMode,
              }))

              localStorage.setItem(
                "configs",
                JSON.stringify({ proMode: !configs.proMode })
              )
            }}
            data-tooltip-id={"feerate"}
            data-tooltip-content="Use advanced features, drag and drop, multiples wallets and more."
            data-tooltip-place="bottom"
            className={`cursor-pointer border-[1px] border-zinc-600 rounded py-1 px-4 hover:scale-105 transition-all duration-300 flex ${
              configs.proMode
                ? "border-zinc-100 opacity-100 text-white "
                : "opacity-50 "
            }`}
          >
            Pro
            <Image
              src="/full-screen.png"
              width={14}
              height={14}
              alt="Directions"
              className="w-[14px] h-[14px] mt-[3px] ml-[6px]"
            />
          </div>

          <Optimizations />

          <ConnectButton />

          <WalletConfigsModal />
          <HistoryModal />
        </div>
      </div>
      <div className="w-full border-b-[1px] border-b-zinc-900"></div>
    </>
  )
}

export const SubNavBar = () => {
  const showOptimizations = true

  return (
    <>
      {!showOptimizations && (
        <>
          <h1 className="text-4xl font-bold text-center text-gray-100">
            Create PSBT <span className="text-[12px] opacity-50">(alpha)</span>
          </h1>
          <p className="text-center  text-gray-400 px-4">
            Visualize and Program Your Bitcoin L1 Transactions (UTXOs)
          </p>
        </>
      )}
      {/* {showOptimizations && (
        <div className="flex w-full flex-col items-start justify-start border-b-2 pb-8">
          <h1 className="text-4xl font-bold text-center text-gray-100">
            Extract Locked Sats{" "}
          </h1>
          <p className="text-center  text-gray-400">
            Merge all of your Runes UTXOs into one, and extract the locked sats
          </p>
          <Optimizations />
        </div>
      )} */}
    </>
  )
}
