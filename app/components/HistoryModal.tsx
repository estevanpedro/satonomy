import { Modal } from "@/app/components/Modal"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { historyAtom } from "@/app/recoil/history"
import { formatAddress } from "@/app/utils/format"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Tooltip } from "react-tooltip"
import { useRecoilValue } from "recoil"

export const HistoryModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const configs = useRecoilValue(configsAtom)
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
