export interface Tx {
  txid: string
  vout: {
    n: number
    value: number
    scriptpubkey: string
    [key: string]: any
  }[]
  vin: {
    txid: string
    vout: number
    [key: string]: any
  }[]
}

interface UTXO {
  txid: string
  vout: number
  value: number
  scriptpubkey: string
}

export const transactionsService = {
  fetchAllTransactions: async (address: string): Promise<Tx[]> => {
    let transactions: Tx[] = []
    let lastTxid: string | null = null
    let hasMore = true

    try {
      while (hasMore) {
        // Construct the endpoint URL with the `after_txid` parameter if `lastTxid` is present
        const endpoint = `https://mempool.space/api/address/${address}/txs${
          lastTxid ? `?after_txid=${lastTxid}` : ""
        }`

        // Fetch the transaction history for the address
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(
            `Failed to fetch transactions: ${response.statusText}`
          )
        }

        const txs: Tx[] = await response.json()

        // Add the transactions to the list
        transactions = transactions.concat(txs)

        // Check if there are more transactions to fetch
        if (txs.length > 0) {
          lastTxid = txs[txs.length - 1].txid
        } else {
          hasMore = false
        }

        // If the response returned fewer transactions than the limit, stop pagination
        if (txs.length < 25) {
          hasMore = false
        }
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      throw new Error("Failed to fetch transactions")
    }

    return transactions
  },

  fetchUTXOs: async (address: string): Promise<UTXO[]> => {
    try {
      // Fetch all transactions for the address
      const txs = await transactionsService.fetchAllTransactions(address)

      // First pass: Collect all outputs
      const allOutputs = new Map<string, UTXO>()

      txs.forEach((tx) => {
        tx.vout.forEach((output) => {
          const utxoKey = `${tx.txid}:${output.n}`
          allOutputs.set(utxoKey, {
            txid: tx.txid,
            vout: output.n,
            value: output.value,
            scriptpubkey: output.scriptpubkey,
          })
        })
      })

      // Second pass: Remove spent outputs
      txs.forEach((tx) => {
        tx.vin.forEach((input) => {
          const spentKey = `${input.txid}:${input.vout}`
          if (allOutputs.has(spentKey)) {
            allOutputs.delete(spentKey)
          }
        })
      })

      // Remaining outputs in the map are the current UTXOs
      return Array.from(allOutputs.values())
    } catch (error) {
      console.error("Error fetching UTXOs:", error)
      throw new Error("Failed to fetch UTXOs")
    }
  },
}
