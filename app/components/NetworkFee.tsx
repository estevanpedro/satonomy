import Image from "next/image"
import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { configAtom } from "@/app/recoil/confgsAtom"
import { recommendedFeesAtom } from "@/app/recoil/recommendedFeesAtom"
import { useAccounts } from "@particle-network/btc-connectkit"
import { Tooltip } from "react-tooltip"
import { useRecoilState, useRecoilValue } from "recoil"
import { runesAtom } from "@/app/recoil/runesAtom"
import { utxoAtom } from "@/app/recoil/utxoAtom"
import { useParams } from "next/navigation"
import { formatNumber } from "@/app/utils/format"
import { psbtSignedAtom } from "@/app/recoil/psbtAtom"

export const NetworkFee = () => {
  const [configs, setConfigs] = useRecoilState(configAtom)
  const recommendedFees = useRecoilValue(recommendedFeesAtom)

  const getSelectedFeeRate = (feeType: string) => {
    if (!recommendedFees) return 0
    switch (feeType) {
      case "slow":
        return recommendedFees.minimumFee + 0.25
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
              address:
                "bc1p88kkz603d5haumns83pd25x5a5ctkp0wzpvkla82ltdvcnezqvzqgwfc93", // Platform fee address
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

      const body = JSON.stringify({
        newButterfly: newButterfly,
        address: account,
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

  return (
    <div className="pb-6 min-w-52  rounded-xl flex flex-col gap-3 items-center justify-center border bg-zinc-950 ">
      <Image
        className="w-14 h-14"
        src="/bitcoin.png"
        alt="Bitcoin"
        width={54}
        height={54}
      />
      <div>Network Fee</div>

      <div
        className="text-center  font-medium whitespace-nowrap flex flex-col justify-center items-center"
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
          <div className="mt-2 mb-[-4px] text-[14px] text-zinc-400 absolute bottom-[28px]">
            {formatNumber(
              configs.feeRateEstimated || configs.feeRate,
              0,
              1,
              false,
              false
            )}{" "}
            sats/vb
          </div>
        )}

      <div className="flex flex-col gap-3 absolute top-0 -right-[84px]">
        <div
          className={`hover:border-zinc-400 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-400 font-bold flex items-center px-4 py-2 cursor-pointer border rounded-md ${
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
            className={hasSomeSigned ? `` : "cursor-pointer"}
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
            className={hasSomeSigned ? `` : "cursor-pointer"}
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
            className={hasSomeSigned ? `` : "cursor-pointer"}
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
