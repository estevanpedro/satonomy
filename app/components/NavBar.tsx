import { ConnectButton } from "@/app/components/Connect";
import Image from "next/image";

export const NavBar = () => {
  return (
    <div className="mt-8 z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
      <p className="flex items-center justify-center gap-2 font-bold text-[24px]">
        <Image src="/satonomy-logo.png" alt="Satonomy" width={40} height={40} />
        SATONOMY
      </p>
      <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t  from-black via-black lg:static lg:size-auto lg:bg-none">
        <ConnectButton />
      </div>
    </div>
  );
};

export const SubNavBar = () => {
  return (
    <>
      {" "}
      <h1 className="text-4xl font-bold text-center text-gray-100">
        Create PSBT <span className="text-[12px] opacity-50">(alpha)</span>
      </h1>
      <p className="text-center  text-gray-400 mb-24">
        Effortlessly Visualize and Program Your Bitcoin L1 Transactions (UTXOs)
      </p>
    </>
  );
};
