"use client";

import Butterfly from "@/app/components/Butterfly";

import { MultiProvider } from "@/app/providers/MultiProvider";

export default function Home() {
  return (
    <MultiProvider>
      <Butterfly />
    </MultiProvider>
  );
}
