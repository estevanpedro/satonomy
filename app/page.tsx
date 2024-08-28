"use client";

import { MultiProvider } from "@/app/providers/MultiProvider";
import { NavBar, SubNavBar } from "@/app/components/NavBar";
import { Bowtie } from "@/app/components/Bowtie";
import { ConfigDeck } from "@/app/components/ConfigDeck";
import { UtxoDeck } from "@/app/components/CardsDeck";
import { BowtieMobile } from "@/app/components/BowtieMobile";

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
    </MultiProvider>
  );
}
