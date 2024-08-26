"use client";

import { Bowtie } from "@/app/components/Bowtie";
import CardCarousel from "@/app/components/CardsDeck";

import { ConfigDeck } from "@/app/components/ConfigDeck";
import { ConnectButton } from "@/app/components/Connect";
import { useBitcoinPrice } from "@/app/hooks/useBitcoinPrice";
import { utxoState } from "@/app/recoil/utxo";
import Image from "next/image";
import { useRecoilValue } from "recoil";

export default function Butterfly() {
  const utxos = useRecoilValue(utxoState);
  useBitcoinPrice();

  return (
    <>
      <div className="mt-8 z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="flex items-center justify-center gap-2 font-bold text-[24px]">
          <Image
            src="/satonomy-logo.png"
            alt="Satonomy"
            width={40}
            height={40}
          />
          SATONOMY
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t  from-black via-black lg:static lg:size-auto lg:bg-none">
          <ConnectButton />
        </div>
      </div>

      <div className=" items-center justify-center w-full max-w-[1200px] self-center ">
        <h1 className="text-4xl font-bold text-center text-gray-100">
          Create PSBT
        </h1>

        <p className="text-center  text-gray-400 mb-24">
          Visually create UTXOs, verify PSBTs, and sign transactions.
        </p>

        <Bowtie />
      </div>
      <ConfigDeck />
      {Boolean(utxos?.length) && <CardCarousel />}
    </>
  );
}
