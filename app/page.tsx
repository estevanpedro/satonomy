"use client";

import { MultiProvider } from "@/app/providers/MultiProvider";
import { NavBar, SubNavBar } from "@/app/components/NavBar";
import { Bowtie } from "@/app/components/Bowtie";
import { ConfigDeck } from "@/app/components/ConfigDeck";
import { UtxoDeck } from "@/app/components/CardsDeck";
import { BowtieMobile } from "@/app/components/BowtieMobile";
import { OutputDeck } from "@/app/components/CardsOutputDeck";
import { Canvas } from "@/app/components/Canvas";

export default function Home() {
  return (
    <MultiProvider>
      <NavBar />
      <div className="w-full max-w-[1200px] flex flex-col items-center sm:block">
        <SubNavBar />

        <Bowtie />

        <BowtieMobile />
      </div>
      <ConfigDeck />
      <UtxoDeck />
      <OutputDeck />
    </MultiProvider>
  );
}
