import { bech32m } from "bech32";
import { initEccLib, networks, Psbt } from "bitcoinjs-lib";
import { toOutputScript } from "bitcoinjs-lib/src/address";
import { Butterfly } from "@/app/recoil/utxo";
import * as ecc from "@bitcoinerlab/secp256k1";

export const psbtService = {
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
