import { bech32m } from "bech32";
import { initEccLib, networks, Psbt } from "bitcoinjs-lib";
import { toOutputScript } from "bitcoinjs-lib/src/address";
import { Butterfly } from "@/app/recoil/butterflyAtom";
import * as ecc from "@bitcoinerlab/secp256k1";
import { none, RuneId, Runestone } from "runelib";

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
      });
      const result = res.json();
      if (result) {
        return result;
      }
    } catch (error) {
      console.error(error);
    }
  },
  createPsbt: async (butterfly: Butterfly, address: string) => {
    initEccLib(ecc);

    const psbt = new Psbt({ network: networks.bitcoin });

    for (const utxo of butterfly.inputs) {
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          value: utxo.value,
          script: toOutputScript(address, networks.bitcoin),
        },
      });
    }

    for (const utxo of butterfly.outputs) {
      if (utxo.type === "OP RETURN") {
        const runeFound = butterfly.outputs.find(
          (o) => o.type === "runes" && o.rune?.runeid
        );
        const block = Number(runeFound?.rune?.runeid.split(":")[0]);
        const idx = Number(runeFound?.rune?.runeid.split(":")[1]);

        const runesOutputs = butterfly.outputs.filter(
          (o) => o.type === "runes"
        );

        const edicts = runesOutputs.map((o) => {
          return {
            id: new RuneId(block, idx),
            amount: BigInt(
              (o.runesValue || 0) * 10 ** (utxo.rune?.divisibility || 0)
            ),
            output: o.vout - 1,
          };
        });

        const runestone = new Runestone(edicts, none(), none(), none());

        psbt.addOutput({
          script: runestone.encipher(),
          value: 0,
        });

        continue;
      }

      psbt.addOutput({
        address: utxo.address,
        value: utxo.value,
      });
    }

    return psbt.toHex();
  },
  extractKeyFromAddress: (
    address: string
  ): { type: "taproot" | "segwit" | "legacy"; key: Buffer | undefined } => {
    if (address.startsWith("bc1p") || address.startsWith("tb1p")) {
      return {
        type: "taproot",
        key: psbtService.toXOnly(psbtService.getTapInternalKey(address)),
      };
    } else if (address.startsWith("bc1") || address.startsWith("tb1")) {
      return { type: "segwit", key: undefined };
    } else {
      return { type: "legacy", key: undefined };
    }
  },
  toXOnly: (pubkey: Buffer): Buffer => {
    return pubkey.subarray(1, 33);
  },
  getTapInternalKey: (address: string): Buffer => {
    const decoded = bech32m.decode(address);
    const data = bech32m.fromWords(decoded.words.slice(1));
    return Buffer.from(data);
  },
};
