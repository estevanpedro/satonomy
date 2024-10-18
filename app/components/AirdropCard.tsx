"use client"

import { RunesUtxo } from "@/app/recoil/runesAtom"
import { useState } from "react"

export const AirdropCard = ({
  rune,
  onClose,
  index,
  onAirdropSelection,
}: {
  rune: RunesUtxo
  onClose: () => void
  index: number
  onAirdropSelection?: (rune: RunesUtxo) => void
}) => {
  const [showSats, setShowSats] = useState<number | null>(null)

  const onSelect = (rune: RunesUtxo) => {
    onAirdropSelection?.(rune)
  }

  return (
    <button
      className={`flex justify-start items-start w-full h-full border p-2  opacity-100 hover:border-gray-50 cursor-pointer`}
      onClick={() => {
        onSelect(rune)
      }}
      onMouseEnter={() => setShowSats(index)}
      onMouseLeave={() => setShowSats(null)}
    >
      <div className="justify-center items-center flex text-center text-[52px] mr-4">
        <div className="min-w-[38px] h-[38px] rounded bg-gray-800 border-[1px] border-gray-600 flex justify-center items-center text-[20px]">
          {rune?.symbol}
        </div>
      </div>

      <div className="flex flex-col gap-[4px] justify-center items-start">
        <span className="text-[12px] font-bold">{rune?.spacedRune}</span>
        <span className="text-[10px]">{rune?.runeid}</span>
      </div>

      {Boolean(rune.amount) && (
        <div className="flex-end flex items-end justify-center w-full h-full flex-col mt-3 mr-2">
          <span className="text-[12px] font-bold hover:scale-105">
            {Number(rune.amount) /
              (rune?.divisibility ? 10 ** rune.divisibility : 1)}
          </span>
        </div>
      )}
    </button>
  )
}
