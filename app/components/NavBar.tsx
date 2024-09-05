import { ConnectButton } from "@/app/components/Connect";
import { Optimizations } from "@/app/components/Optimizations";
import { Tutorial } from "@/app/components/Tutorial";
import Image from "next/image";

export const NavBar = () => {
  return (
    <div className="my-8 z-10 w-full max-w-[1200px] items-center justify-around font-mono text-sm flex  sm:justify-between">
      <p className="flex items-center justify-center gap-2 font-bold text-[24px]">
        <Image src="/satonomy-logo.png" alt="Satonomy" width={40} height={40} />
        SATONOMY{" "}
        <span className="text-[12px] opacity-70 font-normal">
          {" "}
          - Manage Your Bitcoin L1 Transactions (UTXOs)
        </span>
      </p>
      <div className="flex  items-center justify-center gap-4">
        <Tutorial />
        <Optimizations />
        <ConnectButton />
      </div>
    </div>
  );
};

export const SubNavBar = () => {
  const showOptimizations = true;

  return (
    <>
      {!showOptimizations && (
        <>
          <h1 className="text-4xl font-bold text-center text-gray-100">
            Create PSBT <span className="text-[12px] opacity-50">(alpha)</span>
          </h1>
          <p className="text-center  text-gray-400 px-4">
            Visualize and Program Your Bitcoin L1 Transactions (UTXOs)
          </p>
        </>
      )}
      {/* {showOptimizations && (
        <div className="flex w-full flex-col items-start justify-start border-b-2 pb-8">
          <h1 className="text-4xl font-bold text-center text-gray-100">
            Extract Locked Sats{" "}
          </h1>
          <p className="text-center  text-gray-400">
            Merge all of your Runes UTXOs into one, and extract the locked sats
          </p>
          <Optimizations />
        </div>
      )} */}
    </>
  );
};
