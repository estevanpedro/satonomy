import { AirdropRunes } from "@/app/components/AirdropRunes"
import { HistoryModal } from "@/app/components/HistoryModal"
import { Optimizations } from "@/app/components/Optimizations"

import { configsAtom } from "@/app/recoil/confgsAtom"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Tooltip } from "react-tooltip"
import { useRecoilState } from "recoil"

const ConnectButton = dynamic(() => import("./Connect"), {
  ssr: false,
})

export const NavBar = () => {
  const [configs, setConfig] = useRecoilState(configsAtom)

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
          <div
            onClick={onRefreshClick}
            data-tooltip-id={"feerate"}
            data-tooltip-content={
              "Refresh the app, delete local data, clean history and disconnect wallets."
            }
            data-tooltip-place="bottom"
            className="cursor-pointer border-[1px] border-zinc-600 rounded p-1 hover:scale-105 transition-all duration-300 opacity-50"
          >
            <Image src="/refresh.png" width={16} height={16} alt="Refresh" />
          </div>

          <AirdropRunes />
          <Optimizations />
          <div
            onClick={() => {
              setConfig((old) => ({
                ...old,
                isInputDeckOpen: false,
                isOutputDeckOpen: false,
                isInputFullDeckOpen: false,
                proMode: !old.proMode,
                fullDeckSearchType: "all",
                fullDeckSearchWallet: "",
              }))

              localStorage.setItem(
                "configs",
                JSON.stringify({ proMode: !configs.proMode })
              )
            }}
            data-tooltip-id={"pro"}
            data-tooltip-content="Use advanced features, drag and drop, multiples wallets and more."
            data-tooltip-place="bottom"
            className={`z-2  text-white cursor-pointer rounded py-2 px-4 hover:scale-105 transition-all duration-300 flex ${
              configs.proMode
                ? "opacity-100  gradient-border "
                : "opacity-50 border-[1px] border-zinc-600 "
            }`}
          >
            <Tooltip
              id={"pro"}
              className="max-w-[260px] bg-gray-600"
              style={{ backgroundColor: "#292929", color: "white" }}
            />
            <span className="font-bold">Pro</span>
          </div>

          <ConnectButton />

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
