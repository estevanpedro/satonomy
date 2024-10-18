import { useEffect, useState } from "react"
import Image from "next/image"
import { useRecoilValue } from "recoil"
import { Tooltip } from "react-tooltip"
import Papa from "papaparse"

import { Modal } from "@/app/components/Modal"
import { runesAtom, RunesUtxo } from "@/app/recoil/runesAtom"
import { useAccounts } from "@particle-network/btc-connectkit"
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom"
import { utxoAtom } from "@/app/recoil/utxoAtom"
import { walletConfigsAtom } from "@/app/recoil/walletConfigsAtom"
import { AirdropCard } from "@/app/components/AirdropCard"
import { formatAddress, formatNumber } from "@/app/utils/format"
import { useAirdrops } from "@/app/hooks/useAirdrops"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"

export interface CSVData {
  address: string
  amount: number
}

export const AirdropRunes = () => {
  const { accounts } = useAccounts()
  const ordinals = useRecoilValue(ordinalsAtom)
  const runes = useRecoilValue(runesAtom)
  const utxos = useRecoilValue(utxoAtom)
  const walletConfigs = useRecoilValue(walletConfigsAtom)
  const [airdropSelected, setAirdropSelected] = useState<RunesUtxo | undefined>(
    undefined
  )
  const [csvData, setCsvData] = useState<CSVData[]>([])
  const [runesToAirdrop, setRunesToAirdrop] = useState<RunesUtxo[] | []>([])
  const [isOpen, setIsOpen] = useState(false)
  const butterfly = useRecoilValue(butterflyAtom)

  const { errorMsg, setErrorMsg, handleConfirmAirdrop, feeCost } = useAirdrops({
    csvData,
    airdropSelected,
  })
  useEffect(() => {
    if (
      !accounts.length &&
      !walletConfigs.wallets.length &&
      !walletConfigs.prevWallets?.length
    ) {
      setRunesToAirdrop([])
    }
  }, [accounts, walletConfigs])

  useEffect(() => {
    const runesOptimizations = runes?.filter(
      (r) =>
        r.utxos?.length >= 5 ||
        r.utxos.find(
          (u) =>
            utxos?.find((utxo) => u.location === `${utxo.txid}:${utxo.vout}`)
              ?.value || 0 > 546
        )
    )

    if (runesOptimizations) {
      setRunesToAirdrop(runesOptimizations)
    }
  }, [runes, ordinals, utxos])

  const onClose = () => setIsOpen(false)

  const onAirdropSelection = (rune: RunesUtxo) => {
    setAirdropSelected(rune)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setErrorMsg("")
      const file = e.target.files?.[0]
      if (file) {
        Papa.parse(file, {
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data as string[][]
            const formattedData = parsedData.map((row) => {
              if (!parseFloat(row[1]) || !row[0]) {
                setErrorMsg("Wrong format in the file")
              }
              return {
                address: row[0],
                amount: parseFloat(row[1]),
              }
            })
            setCsvData(formattedData)
          },
        })
      }
    } catch (error) {
      setErrorMsg("Error uploading file")
    }
  }

  const onBackClick = () => {
    setCsvData([])
    setErrorMsg("")
    setAirdropSelected(undefined)
  }

  return (
    <>
      {
        <div className={`items-center mt-4 `}>
          <div
            className="flex gap-2 cursor-pointer -mt-4"
            onClick={() => setIsOpen(true)}
          >
            <span className="opacity-50 border-[1px] border-zinc-600 hover:text-white  px-3 py-2 -mr-3  rounded hover:border-white hover:opacity-100 hover:scale-105 font-bold transition-all duration-300">
              Airdrop
            </span>{" "}
          </div>
        </div>
      }

      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="max-h-[600px] overflow-y-auto no-scrollbar sm:w-[420px]">
          {!Boolean(airdropSelected) && (
            <>
              <Tooltip
                id={"Optimizations"}
                className="max-w-[300px] bg-gray-600"
                style={{ backgroundColor: "#292929", color: "white" }}
              />
              <h2 className="text-[20px] font-bold mb-4 flex gap-2">
                Create Airdrops
                <Image
                  src="/info.svg"
                  alt="Help"
                  width={14}
                  height={14}
                  className="mt-[1px] cursor-help"
                  data-tooltip-id={"Optimizations"}
                  data-tooltip-content={"Create one airdrop of Runes."}
                  data-tooltip-place="right"
                />
              </h2>

              <p className="mb-4 text-zinc-200 text-[12px]">
                Multi-transfer runes all in one transaction
              </p>
            </>
          )}
          {Boolean(airdropSelected) && (
            <>
              <Tooltip
                id={"Optimizations"}
                className="max-w-[300px] bg-gray-600"
                style={{ backgroundColor: "#292929", color: "white" }}
              />
              <h2 className="text-[20px] font-bold  flex gap-2">
                Airdrop of {airdropSelected?.spacedRune}
              </h2>
            </>
          )}

          {!Boolean(airdropSelected) && Boolean(!runesToAirdrop.length) && (
            <div className="flex justify-start items-start w-full h-full border p-2">
              <div className="flex items-center gap-2">
                <div className="min-w-[38px] h-[38px] rounded bg-gray-800 border-[1px] border-gray-600 flex justify-center items-center text-[20px]">
                  <span>?</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold">
                    No runes available
                  </span>
                  <span className="text-[10px]">
                    You do not have enough UTXOs to Airdrop
                  </span>
                </div>
              </div>
            </div>
          )}

          {!Boolean(airdropSelected) &&
            runesToAirdrop?.map((rune, index) => {
              return (
                <div key={index}>
                  <AirdropCard
                    rune={rune}
                    onClose={onClose}
                    index={index}
                    onAirdropSelection={onAirdropSelection}
                  />
                </div>
              )
            })}

          {Boolean(airdropSelected) && (
            <div className="flex items-center justify-center mt-4 flex-col">
              {(csvData?.length === 0 || Boolean(errorMsg)) && (
                <>
                  <div className="mt-4 text-center">
                    Upload one spreadsheet containing the wallets and amounts of
                    runes for each user in each row separated by a comma.
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-4 mb-4">
                    <p className="mt-4 opacity-40">File structure </p>
                    <div className="opacity-50 border-[1px] px-4 py-2 mt-2">
                      <div className="text-center">bc1p...abc, 1000</div>
                      <div className="text-center">bc1p...cba, 1000</div>
                    </div>
                  </div>
                </>
              )}

              {!Boolean(csvData?.length) && (
                <div className="mt-4 w-full flex items-center justify-center flex-col ">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className={`w-[330px] mb-2 border-[1px] px-4 py-4 text-zinc-400 hover:scale-105 hover:text-zinc-300 hover:border-zinc-300 rounded ${
                      csvData?.length > 0 && !errorMsg
                        ? "border-green-600"
                        : "border-zinc-300"
                    }`}
                  />
                </div>
              )}

              {csvData?.length > 0 && (
                <>
                  <div className="border-b-[1px] w-full mt-4 " />
                  <div className=" text-left  w-[400px] max-h-[250px] overflow-y-scroll scrollbar ">
                    {csvData.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{formatAddress(item.address)}</span>{" "}
                        <span>
                          {item.amount} {airdropSelected?.symbol}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-b-[1px] w-full" />
                </>
              )}

              {Boolean(csvData?.length) && (
                <div className="w-full mt-4 flex items-center justify-between flex-col">
                  <div className="w-full mt-1 flex items-center justify-between px-2">
                    <div>Wallets</div>
                    <div>{formatNumber(csvData?.length)}</div>
                  </div>
                  <div className="w-full mt-1 flex items-center justify-between px-2">
                    <div>Runes</div>
                    <div>
                      {csvData?.reduce((acc, curr) => acc + curr.amount, 0)}{" "}
                      {airdropSelected?.symbol}
                    </div>
                  </div>
                  <div className="w-full mt-1 flex items-center justify-between px-2">
                    <div>Locked </div>
                    <div> {formatNumber(csvData?.length * 546)} sats</div>
                  </div>
                  <div className="w-full mt-1 flex items-center justify-between px-2">
                    <div>Network Fees </div>
                    <div> {formatNumber(feeCost)} sats</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {Boolean(errorMsg) && (
            <>
              <div className="w-full text-center mt-4 text-red-500">
                {errorMsg}
              </div>
            </>
          )}
          <div className="w-full flex  justify-between items-between mt-8">
            {Boolean(airdropSelected) && (
              <div className=" text-center m-1">
                <button
                  className="border px-8 py-2 rounded hover:border-zinc-600"
                  onClick={onBackClick}
                >
                  Back
                </button>
              </div>
            )}
            {csvData?.length >= 1 && !Boolean(errorMsg) && (
              <div className=" flex justify-center items-center m-1 ">
                <button
                  onClick={() => {
                    onClose()
                    handleConfirmAirdrop()
                  }}
                  className="gradient-border border-[1px] px-8 py-2 cursor-pointer hover:scale-105 hover:text-zinc-300 rounded my-2 font-bold"
                >
                  NEXT
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
