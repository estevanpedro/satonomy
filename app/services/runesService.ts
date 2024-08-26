import { CustomEdict } from "@/app/recoil/utxo";
import { getRunesData } from "@/app/services/ordinalService";
import { utxoServices } from "@/app/services/utxoServices";
import { Transaction } from "bitcoinjs-lib";
import { Runestone } from "runelib";

export const runesServices = {
  getEdicts: async (txId: string, wallet: string) => {
    try {
      const txHex = await utxoServices.fetchTransactionHex(txId);
      const btcTx = Transaction.fromHex(txHex);

      const stone = Runestone.decipher(btcTx.toHex());
      const edicts = stone?.value()?.edicts;

      if (edicts?.[0]?.id.block) {
        const ordinalData = await getRunesData(
          `${edicts?.[0]?.id.block}:${edicts?.[0]?.id.idx}`
        );
        if (ordinalData) {
          return {
            edicts: edicts.map((edict) => ({
              ...edict,
              ...ordinalData,
            })),
          };
        }
      }

      return { edicts: edicts as CustomEdict[] };
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },
};
