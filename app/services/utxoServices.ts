import { RunesUtxo, RuneTransaction } from "@/app/recoil/runesAtom"
import { MempoolUTXO } from "@/app/recoil/utxoAtom"
import { networks, Psbt, Transaction } from "bitcoinjs-lib"

const mempoolURL = "https://mempool.space/api"
const unisatURL = "https://open-api.unisat.io/v1/indexer/address"
const meURL = "https://api-mainnet.magiceden.dev/v2/ord/btc/runes/utxos/wallet"
const ordURL = "https://www.ord.io/api/trpc"

const nextRevalidate = { next: { revalidate: 3600 } }

export const utxoServices = {
  getOrdInfoByWallet: async (wallet: string) => {
    try {
      const input = {
        "0": {
          json: {
            limit: 48,
            orderBy: [{ totalScore: "desc" }, { id: "desc" }],
            filter: {
              address: wallet,
              number: { gte: 0 },
            },
            cursor: null,
          },
          meta: { values: { cursor: ["undefined"] } },
        },
      }
      const inputStr = JSON.stringify(input)
      const res = await fetch(
        `${ordURL}/inscription.getFeed?batch=1&input=${inputStr}`,
        {
          ...nextRevalidate,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const result = await res.json()

      return result?.[0]?.result?.data
    } catch (error) {
      console.error(error)
      return null
    }
  },
  getOrdInfo: async (inscriptionId: string) => {
    try {
      const input = {
        "0": {
          json: {
            inscriptionId: inscriptionId,
          },
        },
      }
      const inputStr = JSON.stringify(input)

      const res = await fetch(
        `${ordURL}/inscription.getSmallCardInfo?batch=1&input=${inputStr}`,
        {
          ...nextRevalidate,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const result = await res.json()

      return result?.[0]?.result?.data
    } catch (error) {
      console.error(error)
      return null
    }
  },
  broadcast: async (psbtHexSigned: string) => {
    try {
      const userPSBT = Psbt.fromHex(psbtHexSigned, {
        network: networks.bitcoin,
      })

      const tx = userPSBT.extractTransaction()
      const txHex = tx.toHex()
      const btcTx = Transaction.fromHex(txHex)
      const btcTxHex = btcTx.toHex()

      const res = await fetch(`${mempoolURL}/tx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: btcTxHex,
      })

      const txid = await res.text()
      return txid as string
    } catch (error) {
      console.error(error)
      return null
    }
  },
  psbtHexSigned: async (psbtHexSigned: string) => {
    try {
      const userPSBT = Psbt.fromHex(psbtHexSigned, {
        network: networks.bitcoin,
      })

      let signedIndexes: number[] = []
      let hasIndexesNotSigned = false

      for (let index = 0; index < userPSBT.data.inputs.length; index++) {
        const input = userPSBT.data.inputs[index]

        if (input.finalScriptSig || input.finalScriptWitness) {
          signedIndexes = [...signedIndexes, index]
        } else if (input.partialSig && input.partialSig.length > 0) {
          signedIndexes = [...signedIndexes, index]
        } else {
          hasIndexesNotSigned = true
        }
      }

      if (signedIndexes.length > 0 && hasIndexesNotSigned) {
        return {
          signedIndexes,
          btcTxHex: undefined,
        }
      }

      const tx = userPSBT.extractTransaction()

      const txHex = tx.toHex()
      const btcTx = Transaction.fromHex(txHex)

      const btcTxHex = btcTx.toHex()

      return {
        signedIndexes,
        btcTxHex,
      }
    } catch (error) {
      console.error(error)
      return null
    }
  },
  fetchTransactionHex: async (txId: string): Promise<string> => {
    try {
      const res = await fetch(`${mempoolURL}/tx/${txId}/hex`, nextRevalidate)
      const data = await res.text()
      return data
    } catch (error) {
      console.error(error)
      throw error
    }
  },
  getUtxos: async (address: string, notConfirmed?: boolean) => {
    const mempool = await fetch(`${mempoolURL}/address/${address}/utxo`)
    const utxos: MempoolUTXO[] = await mempool.json()
    return utxos.filter((utxo) => utxo.status.confirmed || notConfirmed)
  },
  getRunesBalances: async (wallet: string): Promise<RunesUtxo[]> => {
    const response = await fetch(`${unisatURL}/${wallet}/runes/balance-list`, {
      ...nextRevalidate,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_UNISAT_API_KEY}`,
      },
    })
    const balances = await response.json()
    return (balances?.data?.detail as RunesUtxo[]) || []
  },
  getInscriptions: async (wallet: string): Promise<RunesUtxo[]> => {
    const response = await fetch(
      `${unisatURL}/${wallet}/inscription-data?size=402`,
      {
        next: { revalidate: 60 * 5 },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_UNISAT_API_KEY}`,
        },
      }
    )
    const data = await response.json()
    return data.data
  },
  getRunesUTXOs: async (address: string, rune: string) => {
    const res = await fetch(
      `${meURL}/${address}?rune=${rune.replaceAll("•", "")}`,
      {
        ...nextRevalidate,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MAGIC_EDEN_API_KEY}`,
        },
      }
    )
    const result = await res.json()
    const items = result?.utxos || []
    return items as RuneTransaction[]
  },
  getEstimatedFeeRate: async () => {
    const feeRate = await fetch(
      `${mempoolURL}/v1/fees/recommended`,
      nextRevalidate
    )
    const feeRateJson = await feeRate.json()
    return feeRateJson
  },
}
