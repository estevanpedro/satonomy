import { butterflyAtom } from "@/app/recoil/butterflyAtom"
import { psbtSignedAtom } from "@/app/recoil/psbtAtom"
import { useAccounts, useBTCProvider } from "@particle-network/btc-connectkit"
import { track } from "@vercel/analytics"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { BitcoinNetworkType, InputToSign, signTransaction } from "sats-connect"

export const useSignPsbt = () => {
  const { accounts } = useAccounts()
  const { provider } = useBTCProvider()

  const setPsbtSigned = useSetRecoilState(psbtSignedAtom)
  const butterfly = useRecoilValue(butterflyAtom)

  const hasTwoWallets = accounts.length > 1

  const signPsbt = async (psbtHex: string, addressSigner?: string) => {
    if (hasTwoWallets) {
      const indexOfAccount0 = butterfly.inputs
        .map((i, index) => (i.wallet === accounts[0] ? index : -1))
        .filter((i) => i !== -1)

      const indexOfAccount1 = butterfly.inputs
        .map((i, index) => (i.wallet === accounts[1] ? index : -1))
        .filter((i) => i !== -1)

      const signerIndexed = butterfly.inputs
        .map((i, index) => (i?.wallet === addressSigner ? index : -1))
        .filter((i) => i !== -1)

      const inputs: InputToSign[] = addressSigner
        ? [
            {
              address: addressSigner,
              signingIndexes: signerIndexed,
            },
          ]
        : [
            { address: accounts[0], signingIndexes: indexOfAccount0 },
            { address: accounts[1], signingIndexes: indexOfAccount1 },
          ]

      try {
        await signTransaction({
          payload: {
            network: {
              type: BitcoinNetworkType.Mainnet,
            },
            message: "Satonomy.io",
            psbtBase64: Buffer.from(psbtHex, "hex").toString("base64"),
            broadcast: false,
            inputsToSign: [...inputs],
          },
          onFinish: (response) => {
            const inputsSigned = butterfly.inputs.filter((i) =>
              addressSigner
                ? addressSigner === i?.wallet
                : accounts.includes(i?.wallet || "")
            )
            const psbtHexSigned = Buffer.from(
              response.psbtBase64,
              "base64"
            ).toString("hex")

            setPsbtSigned((prev) => ({
              psbtHexSigned,
              inputsSigned: [...prev.inputsSigned, ...inputsSigned].filter(
                (i, index, self) =>
                  index ===
                  self.findIndex(
                    (t) =>
                      t.wallet === i.wallet &&
                      t.txid === i.txid &&
                      t.vout === i.vout
                  )
              ),
            }))
            track("psbt-signed", {
              wallet: accounts.length > 1 ? accounts[1] : accounts[0],
            })
          },
          onCancel: () => {
            console.error("Transaction signing canceled")
          },
        })
      } catch (e) {
        console.error(e)
      }
      return
    }

    const psbtHexSigned = await provider.signPsbt(psbtHex)

    return psbtHexSigned
  }

  return { signPsbt }
}
