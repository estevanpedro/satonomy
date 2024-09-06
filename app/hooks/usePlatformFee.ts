import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { runesAtom } from "@/app/recoil/runesAtom";
import { configAtom } from "@/app/recoil/confgsAtom";
import { utxoAtom } from "@/app/recoil/utxoAtom"; // BTC UTXOs
import { butterflyAtom } from "@/app/recoil/butterflyAtom";

export const usePlatformFee = () => {
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom);
  const runes = useRecoilValue(runesAtom); // Rune UTXOs
  const btcUtxos = useRecoilValue(utxoAtom); // BTC UTXOs
  const config = useRecoilValue(configAtom); // Config containing feeCost

  useEffect(() => {
    const updatePlatformFee = () => {
      if (!butterfly || !butterfly.inputs || butterfly.inputs.length === 0)
        return;
      if (!runes || !btcUtxos || !config || !config.feeCost) return; // Validate required data

      const feeCost = config.feeCost;

      // Step 1: Count Rune UTXOs in butterfly inputs and calculate total BTC input value
      let runeUtxoCount = 0;
      let totalBtcInputValue = 0;

      butterfly.inputs.forEach((input) => {
        // Count Rune UTXOs in inputs
        runes.forEach((rune) => {
          rune.utxos.forEach((utxo) => {
            if (utxo.location === `${input.txid}:${input.vout}`) {
              runeUtxoCount++; // Increment Rune UTXO count
            }
          });
        });

        // Find corresponding BTC UTXO for the current input and add its value
        const btcUtxo = btcUtxos.find(
          (btc) => btc.txid === input.txid && btc.vout === input.vout
        );
        if (btcUtxo) {
          totalBtcInputValue += btcUtxo.value; // BTC input value in Satoshis
        }
      });

      // Step 2: Calculate the user's profit and platform fee
      const charge = totalBtcInputValue - 546 - feeCost; // Deduct base output and fee cost
      const usersProfit = Math.floor(charge * 0.8); // 80% for the user
      const platformFee = Math.floor(charge * 0.2); // 20% for the platform

      // Step 3: Add platform fee only if there are more than 5 Rune UTXOs and positive profit
      if (runeUtxoCount > 5 && usersProfit > 0) {
        const existingPlatformFee = butterfly.outputs.find(
          (output) => output.type === "platformFee"
        );

        if (!existingPlatformFee || existingPlatformFee.value !== platformFee) {
          // Add or update the platform fee if it's not there or value has changed
          const platformFeeOutput = {
            value: platformFee,
            address:
              "bc1p88kkz603d5haumns83pd25x5a5ctkp0wzpvkla82ltdvcnezqvzqgwfc93", // Platform fee address
            vout: butterfly.outputs.length + 1,
            type: "platformFee",
          };

          const updatedButterfly = {
            ...butterfly,
            outputs: [
              ...butterfly.outputs.filter(
                (output) => output.type !== "platformFee"
              ),
              platformFeeOutput,
            ],
          };

          setButterfly(updatedButterfly); // Update state with the new platform fee
        }
      } else {
        // Step 4: Remove the platform fee if there are 5 or fewer Rune UTXOs or no profit
        const hasPlatformFee = butterfly.outputs.some(
          (output) => output.type === "platformFee"
        );

        if (hasPlatformFee) {
          // Remove the platform fee
          const updatedButterfly = {
            ...butterfly,
            outputs: butterfly.outputs.filter(
              (output) => output.type !== "platformFee"
            ),
          };

          setButterfly(updatedButterfly);
        }
      }
    };

    updatePlatformFee();
  }, [butterfly.inputs, runes, btcUtxos, config.feeCost, setButterfly]);

  return butterfly;
};
