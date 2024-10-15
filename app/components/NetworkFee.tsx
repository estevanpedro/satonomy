import Image from "next/image"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { configsAtom } from "@/app/recoil/confgsAtom"
import { recommendedFeesAtom } from "@/app/recoil/recommendedFeesAtom"
import { useAccounts } from "@particle-network/btc-connectkit"
import { Tooltip } from "react-tooltip"
import { useRecoilState, useRecoilValue } from "recoil"
import { runesAtom } from "@/app/recoil/runesAtom"
import { utxoAtom } from "@/app/recoil/utxoAtom"
import { useParams } from "next/navigation"
import { formatNumber } from "@/app/utils/format"
import { psbtSignedAtom } from "@/app/recoil/psbtAtom"
import { btcPriceAtom } from "@/app/recoil/btcPriceAtom"

export const NetworkFee = () => {
  const [configs, setConfigs] = useRecoilState(configsAtom)
  const recommendedFees = useRecoilValue(recommendedFeesAtom)

  const getSelectedFeeRate = (feeType: string) => {
    if (!recommendedFees) return 0
    switch (feeType) {
      case "slow":
        return recommendedFees.minimumFee + 0.25 > 2.7
          ? recommendedFees.minimumFee + 0.25
          : 2.7
      case "mid":
        return (
          (recommendedFees.minimumFee + 0.25 + recommendedFees.fastestFee) / 2
        )
      case "fast":
        return recommendedFees.fastestFee
      default:
        return recommendedFees?.hourFee
    }
  }
  const psbtSigned = useRecoilValue(psbtSignedAtom)
  const butterfly = useRecoilValue(butterflyAtom)
  const { accounts } = useAccounts()
  const account = accounts?.[0]
  const runes = useRecoilValue(runesAtom)
  const btcUtxos = useRecoilValue(utxoAtom)
  const { referrer } = useParams()

  const onFeeRateChange = async (feeType: string) => {
    try {
      const selectedFeeRate = getSelectedFeeRate(feeType)
      let newButterfly = {
        ...butterfly,
        outputs: butterfly.outputs.map((output) => ({
          ...output,
          value: output.value <= 0 ? 1 : output.value,
        })),
      }

      if (runes && btcUtxos) {
        let runeUtxoCount = 0
        let totalRuneBtcValue = 0
        butterfly.inputs.forEach((input) => {
          runes.forEach((rune) => {
            rune.utxos.forEach((utxo) => {
              if (utxo.location === `${input.txid}:${input.vout}`) {
                runeUtxoCount++
                const btcUtxo = btcUtxos.find(
                  (btc) => btc.txid === input.txid && btc.vout === input.vout
                )
                if (btcUtxo) {
                  totalRuneBtcValue += btcUtxo.value
                }
              }
            })
          })
        })

        const outputsValuesOfRunesUtxos = butterfly.outputs.reduce(
          (acc, output) => {
            if (output.type === "runes") {
              return acc + output.value
            }
            return acc
          },
          0
        )

        const firstProfit =
          totalRuneBtcValue - configs.feeCost - outputsValuesOfRunesUtxos

        const charge = firstProfit
        const usersProfit = charge * 0.8
        const finalUserProfit = Math.floor(usersProfit)
        const satonomyFees = charge - finalUserProfit
        const platformFee = referrer
          ? Math.floor(satonomyFees * 0.5)
          : Math.floor(satonomyFees * 1)
        const referrerFee = referrer ? Math.floor(satonomyFees * 0.5) : 0
        const difference = Math.floor(satonomyFees - platformFee - referrerFee)

        let userProfitValue = finalUserProfit + difference
        if (runeUtxoCount >= 5 && userProfitValue > 0) {
          const updatedOutputs = butterfly.outputs.map((output) => {
            if (output.type === "platformFee") {
              return {
                ...output,
                value: platformFee,
              }
            }
            if (output.type === "referrer") {
              return {
                ...output,
                value: referrerFee,
              }
            }
            return output
          })

          const platformFeeExists = butterfly.outputs.some(
            (output) => output.type === "platformFee"
          )

          if (!platformFeeExists) {
            updatedOutputs.push({
              value: platformFee,
              address: "bc1qwsfxkmzl8w25rfumqljc0zw55848phrx9dexa8", // Platform fee address
              vout: butterfly.outputs.length + 1,
              type: "platformFee",
            })
          }

          const referrerExists = butterfly.outputs.some(
            (output) => output.type === "referrer"
          )

          if (!referrerExists && referrer) {
            updatedOutputs.push({
              value: referrerFee,
              address: referrer as string,
              vout: butterfly.outputs.length + 2,
              type: "referrer",
            })
          }

          newButterfly = {
            ...butterfly,
            outputs: updatedOutputs,
          }
        }
      }

      const feePayer =
        butterfly.inputs.find((input) => input.wallet && input.value > 10000) ||
        butterfly.inputs.find((input) => input.wallet && input.value > 546) ||
        butterfly.inputs.find((input) => input.wallet)

      const body = JSON.stringify({
        newButterfly: newButterfly,
        address: feePayer?.wallet || account,
        feeRate: selectedFeeRate,
      })

      const res = await fetch(`/api/estimateFees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      })

      const result = await res.json()
      if (result && !result?.error) {
        setConfigs((prev) => ({
          ...prev,
          feeRate: selectedFeeRate,
          feeType,
          feeCost: result,
        }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const hasSomeSigned = Boolean(
    psbtSigned.inputsSigned.find((i) =>
      butterfly.inputs.find(
        (input) => input.txid === i.txid && input.vout === i.vout
      )
    )
  )
  const feeRateLessThan2 =
    Boolean(configs.feeRateEstimated < 2) &&
    configs.feeCost &&
    butterfly.outputs.length > 0 &&
    butterfly.inputs.length > 0

  const hourFee = recommendedFees?.halfHourFee
  const btcUsdPrice = useRecoilValue(btcPriceAtom)

  return (
    <div
      data-tooltip-id={"fee-tool"}
      data-tooltip-content={
        feeRateLessThan2 ? "Fee must be higher than 2 sats/vb 🚨" : ""
      }
      data-tooltip-place="left"
      className={`transition-all duration-1000  pb-6 pt-6 min-w-52  rounded-xl flex flex-col gap-1 items-center justify-start border bg-zinc-950 ${
        feeRateLessThan2 ? "border-red-500 " : ""
      }`}
    >
      <Image
        className="w-14 h-14"
        src="/bitcoin.png"
        alt="Bitcoin"
        width={54}
        height={54}
      />
      <div>Network Fee</div>

      <div
        className={`text-center  font-medium whitespace-nowrap flex flex-col justify-center items-center p-1`}
        data-tooltip-id={"fee-tool"}
        data-tooltip-content={"Type the total fee cost in sats"}
        data-tooltip-place="left"
      >
        <input
          disabled={hasSomeSigned}
          type="number"
          value={configs.feeCost || ""}
          onChange={(e) => {
            setConfigs((prev) => ({
              ...prev,
              feeCost: Number(e.target.value),
            }))
          }}
          placeholder="0"
          className="bg-transparent text-[20px] border text-center outline-none border-transparent w-20 h-12 ml-[16px]"
        />{" "}
        <div className="mt-[-15px] text-[12px]">sats</div>
      </div>
      {Boolean(configs.feeRateEstimated || configs.feeRate) &&
        Boolean(typeof configs.feeRateEstimated === "number") && (
          <div
            className={`flex flex-col items-center justify-center mt-4 mb-[-4px] text-[14px] text-zinc-400 absolute bottom-[28px]  ${
              feeRateLessThan2 ? "text-red-500 " : ""
            }`}
          >
            <span>
              {formatNumber(
                configs.feeRateEstimated || configs.feeRate,
                0,
                1,
                false,
                false
              )}{" "}
              sats/vb
            </span>
            {Boolean(configs.feeCost) && Boolean(btcUsdPrice) && (
              <span className="text-[12px] opacity-50">
                ${formatNumber((configs.feeCost * btcUsdPrice) / 100000000)}{" "}
              </span>
            )}
          </div>
        )}

      <div className="flex flex-col gap-3 absolute top-0 -right-[84px]">
        {Boolean(hourFee) && (
          <div
            className="text-[12px]  flex gap-2 mr-4 justify-center"
            data-tooltip-id={"feerate"}
            data-tooltip-content={"Mempool average half hour fee rate"}
            data-tooltip-place="top"
          >
            <Tooltip
              id={"feerate"}
              className="max-w-[260px] bg-gray-600"
              style={{ backgroundColor: "#292929", color: "white" }}
            />
            <span className="opacity-50">{hourFee}</span>
            <div className="w-[16px] opacity-50">
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
          className={`${
            hasSomeSigned ? "cursor-not-allowed" : "cursor-pointer"
          } hover:border-zinc-400 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-400 font-bold flex items-center px-4 py-2 cursor-pointer border rounded-md ${
            configs.feeType === "slow" ? "border-zinc-400" : "border-zinc-800"
          }`}
          onClick={() => {
            if (!hasSomeSigned) {
              onFeeRateChange("slow")
            }
          }}
        >
          <input
            disabled={hasSomeSigned}
            type="radio"
            name="fee"
            id="slow"
            checked={configs.feeType === "slow"}
            onChange={() => {}}
            className="hidden"
          />
          <label
            htmlFor="slow"
            className={hasSomeSigned ? `cursor-not-allowed` : "cursor-pointer"}
          >
            Slow
          </label>
        </div>
        <div
          className={`hover:border-zinc-400 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-400 font-bold flex items-center px-4 py-2 cursor-pointer border rounded-md ${
            configs.feeType === "mid" ? "border-zinc-400" : "border-zinc-800"
          }`}
          onClick={() => {
            if (!hasSomeSigned) {
              onFeeRateChange("mid")
            }
          }}
        >
          <input
            disabled={hasSomeSigned}
            type="radio"
            name="fee"
            id="mid"
            checked={configs.feeType === "mid"}
            onChange={() => {}}
            className="hidden"
          />
          <label
            htmlFor="mid"
            className={hasSomeSigned ? `cursor-not-allowed` : "cursor-pointer"}
          >
            Mid
          </label>
        </div>
        <div
          className={`hover:border-zinc-400 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-400 font-bold flex items-center px-4 py-2 cursor-pointer border rounded-md ${
            configs.feeType === "fast" ? "border-zinc-400" : "border-zinc-800"
          }`}
          onClick={() => {
            if (!hasSomeSigned) {
              onFeeRateChange("fast")
            }
          }}
        >
          <input
            disabled={hasSomeSigned}
            type="radio"
            name="fee"
            id="fast"
            checked={configs.feeType === "fast"}
            onChange={() => {}}
            className="hidden"
          />
          <label
            htmlFor="fast"
            className={hasSomeSigned ? `cursor-not-allowed` : "cursor-pointer"}
          >
            Fast
          </label>
        </div>
      </div>
      <Tooltip
        id={"fee-tool"}
        className="max-w-[150px] bg-gray-600"
        style={{ backgroundColor: "#292929", color: "white" }}
      />
    </div>
  )
}
