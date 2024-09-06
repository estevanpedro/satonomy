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

      // Step 1: Count Rune UTXOs in butterfly inputs and calculate total BTC value from Rune UTXOs
      let runeUtxoCount = 0;
      let totalRuneBtcValue = 0; // This will hold the BTC value of the Rune UTXOs

      butterfly.inputs.forEach((input) => {
        // For each input in the butterfly, find the corresponding Rune UTXO and its associated BTC value
        runes.forEach((rune) => {
          rune.utxos.forEach((utxo) => {
            if (utxo.location === `${input.txid}:${input.vout}`) {
              runeUtxoCount++; // Increment Rune UTXO count

              // Find the BTC value for this UTXO in the btcUtxos array
              const btcUtxo = btcUtxos.find(
                (btc) => btc.txid === input.txid && btc.vout === input.vout
              );
              if (btcUtxo) {
                totalRuneBtcValue += btcUtxo.value; // Add the BTC value of the Rune UTXO
              }
            }
          });
        });
      });

      // Step 2: Calculate the user's profit based on total Rune UTXO BTC value
      const outputsValuesOfRunesUtxos = butterfly.outputs.reduce(
        (acc, output) => {
          if (output.type === "runes") {
            return acc + output.value;
          }
          return acc;
        },
        0
      );

      const profit = totalRuneBtcValue - feeCost - outputsValuesOfRunesUtxos;

      // If the profit is negative or zero, no platform fee should be applied
      if (runeUtxoCount > 5 && profit > 0) {
        const platformFee = Math.floor(profit * 0.2); // 20% of the profit for the platform

        const updatedOutputs = butterfly.outputs.map((output) => {
          if (output.type === "platformFee") {
            // Update the existing platform fee in place
            return {
              ...output,
              value: platformFee,
            };
          }
          return output;
        });

        const platformFeeExists = butterfly.outputs.some(
          (output) => output.type === "platformFee"
        );

        // If platformFee doesn't exist, add it to the outputs
        if (!platformFeeExists) {
          updatedOutputs.push({
            value: platformFee,
            address:
              "bc1p88kkz603d5haumns83pd25x5a5ctkp0wzpvkla82ltdvcnezqvzqgwfc93", // Platform fee address
            vout: butterfly.outputs.length + 1,
            type: "platformFee",
          });
        }

        const updatedButterfly = {
          ...butterfly,
          outputs: updatedOutputs,
        };

        setButterfly(updatedButterfly); // Update state with the updated or new platform fee
      } else {
        // If the platform fee should not exist (profit <= 0 or <= 5 Rune UTXOs)
        const updatedOutputs = butterfly.outputs.filter(
          (output) => output.type !== "platformFee"
        );

        const updatedButterfly = {
          ...butterfly,
          outputs: updatedOutputs,
        };

        setButterfly(updatedButterfly); // Update butterfly without platform fee
      }
    };

    updatePlatformFee();
  }, [butterfly.inputs, runes, btcUtxos, config.feeCost, setButterfly]);

  return butterfly;
};
