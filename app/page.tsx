"use client";

import { MultiProvider } from "@/app/providers/MultiProvider";
import { NavBar, SubNavBar } from "@/app/components/NavBar";
import { Bowtie } from "@/app/components/Bowtie";
import { ConfigDeck } from "@/app/components/ConfigDeck";
import { UtxoDeck } from "@/app/components/CardsDeck";

export default function Home() {
  return (
    <MultiProvider>
      <NavBar />
      <div className="w-full max-w-[1200px]">
        <SubNavBar />
        <Bowtie />
      </div>
      <ConfigDeck />
      <UtxoDeck />
    </MultiProvider>
  );
}
