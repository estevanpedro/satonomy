import { bech32m } from "bech32"
import { initEccLib, networks, payments, Psbt } from "bitcoinjs-lib"
import { toOutputScript } from "bitcoinjs-lib/src/address"
import { Butterfly } from "@/app/recoil/butterflyAtom"
import * as ecc from "@bitcoinerlab/secp256k1"
import { none, RuneId, Runestone } from "runelib"

export const psbtService = {
  broadcastUserPSBT: async (
    psbtHexSigned: string
  ): Promise<string | undefined> => {
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ psbtHexSigned }),
      })
      const result = res.json()
      if (result) {
        return result
      }
    } catch (error) {
      console.error(error)
    }
  },
  createPsbt: async (butterfly: Butterfly, address: string) => {
    initEccLib(ecc)

    const psbt = new Psbt({ network: networks.bitcoin })

    for (const utxo of butterfly.inputs) {
      const isP2SH_P2WPKH = utxo?.wallet?.startsWith("3")

      if (isP2SH_P2WPKH) {
        const p2sh = payments.p2sh({
          address: utxo.wallet,
          network: networks.bitcoin,
        })

        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            value: utxo.value,
            script: p2sh.output!,
          },
        })
      } else {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            value: utxo.value,
            script: toOutputScript(`${utxo.wallet}`, networks.bitcoin),
          },
        })
      }
    }

    for (const utxo of butterfly.outputs) {
      if (utxo.type === "OP RETURN") {
        const runeFound = butterfly.outputs.find(
          (o) => o.type === "runes" && o.rune?.runeid
        )
        const block = Number(runeFound?.rune?.runeid.split(":")[0])
        const idx = Number(runeFound?.rune?.runeid.split(":")[1])

        const runesOutputs = butterfly.outputs.filter((o) => o.type === "runes")

        const edicts = runesOutputs.map((o) => {
          const runesIndexInOutputs = butterfly.outputs.findIndex(
            (output) => output === o
          )

          return {
            id: new RuneId(block, idx),
            amount: BigInt(
              (o.runesValue || 0) * 10 ** (utxo.rune?.divisibility || 0)
            ),
            output: runesIndexInOutputs,
          }
        })

        const runestone = new Runestone(edicts, none(), none(), none())

        psbt.addOutput({
          script: runestone.encipher(),
          value: 0,
        })

        continue
      }

      const isP2SH_P2WPKH_Output = utxo?.address?.startsWith("3")

      if (isP2SH_P2WPKH_Output) {
        const { output } = payments.p2sh({
          address: utxo.address,
          network: networks.bitcoin,
        })

        psbt.addOutput({
          script: output!,
          value: utxo.value,
        })
      } else {
        // Default output handling
        psbt.addOutput({
          address: utxo.address,
          value: utxo.value,
        })
      }
    }

    return psbt.toHex()
  },
  createPsbtFull: async (butterfly: Butterfly, address: string) => {
    try {
      initEccLib(ecc)

      const psbt = new Psbt({ network: networks.bitcoin })

      for (const utxo of butterfly.inputs) {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            value: utxo.value,
            script: toOutputScript(address, networks.bitcoin),
          },
        })
      }

      for (const utxo of butterfly.outputs) {
        if (utxo.type === "OP RETURN") {
          const runeFound = butterfly.outputs.find(
            (o) => o.type === "runes" && o.rune?.runeid
          )
          const block = Number(runeFound?.rune?.runeid.split(":")[0])
          const idx = Number(runeFound?.rune?.runeid.split(":")[1])

          const runesOutputs = butterfly.outputs.filter(
            (o) => o.type === "runes"
          )

          const edicts = runesOutputs.map((o) => {
            return {
              id: new RuneId(block, idx),
              amount: BigInt(
                (o.runesValue || 0) * 10 ** (utxo.rune?.divisibility || 0)
              ),
              output: o.vout - 1,
            }
          })

          const runestone = new Runestone(edicts, none(), none(), none())

          psbt.addOutput({
            script: runestone.encipher(),
            value: 0,
          })

          continue
        }

        psbt.addOutput({
          address: utxo.address,
          value: utxo.value,
        })
      }

      return psbt
    } catch (error) {
      console.error(error)
    }
  },
  extractKeyFromAddress: (
    address: string
  ): { type: "taproot" | "segwit" | "legacy"; key: Buffer | undefined } => {
    if (address.startsWith("bc1p") || address.startsWith("tb1p")) {
      return {
        type: "taproot",
        key: psbtService.toXOnly(psbtService.getTapInternalKey(address)),
      }
    } else if (address.startsWith("bc1") || address.startsWith("tb1")) {
      return { type: "segwit", key: undefined }
    } else {
      return { type: "legacy", key: undefined }
    }
  },
  toXOnly: (pubkey: Buffer): Buffer => {
    return pubkey.subarray(1, 33)
  },
  getTapInternalKey: (address: string): Buffer => {
    const decoded = bech32m.decode(address)
    const data = bech32m.fromWords(decoded.words.slice(1))
    return Buffer.from(data)
  },
  estimateTxSize: (psbt: Psbt): number => {
    const baseTxSize = 10.5 // 10 bytes for version, marker, flag, and locktime
    const segwitInputSize = 68 // average size for a SegWit input
    const taprootInputSize = 57.5 // average size for a Taproot input
    const segwitOutputSize = 31 // size for a SegWit output
    const taprootOutputSize = 43 // size for a Taproot output

    let totalSize = baseTxSize

    psbt.data.inputs.forEach((input) => {
      if (
        input.witnessUtxo &&
        input.witnessUtxo.script.toString("hex").startsWith("0014")
      ) {
        totalSize += segwitInputSize
      } else if (
        input.witnessUtxo &&
        input.witnessUtxo.script.toString("hex").startsWith("5120")
      ) {
        totalSize += taprootInputSize
      }
    })

    psbt.txOutputs.forEach((output) => {
      const outputScript = output.script.toString("hex")
      if (outputScript.startsWith("6a")) {
        totalSize += 8 + output.script.length
      } else if (outputScript.startsWith("0014")) {
        totalSize += segwitOutputSize
      } else if (outputScript.startsWith("5120")) {
        totalSize += taprootOutputSize
      } else {
        totalSize += segwitOutputSize
      }
    })

    return Math.ceil(totalSize)
  },
  calculateTransactionFee: (psbt: Psbt, feeRate: number): number => {
    const virtualSize = psbtService.estimateTxSize(psbt)
    return Math.ceil(virtualSize * feeRate)
  },
}
