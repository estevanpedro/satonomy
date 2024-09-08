import { Modal } from "@/app/components/Modal";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const Tutorial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);

  return (
    <>
      <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
        <Image src="/info.svg" alt="Help" width={14} height={14} />
      </div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="w-full flex flex-col items-start justify-start text-start text-sm">
          <h2 className="text-[20px] font-bold mb-4">How to use </h2>
          <p className="mt-4">1. Connect your wallet</p>
          <p className="mt-4">2. Add inputs [+]</p>
          <p className="mt-4">3. Select the best UTXO for your case</p>
          <p className="mt-4">4. Add outputs [+] </p>
          <p className="mt-4">5. Adjust fee</p>
          <p className="mt-4">6. Confirm the transaction</p>

          <p className="mt-4 text-zinc-500 text-[12px]">
            Notes: some UTXO assets may not be supported yet. Always
            double-check before signing the transfer in your wallet.
          </p>

          <br />
          <Link
            href={"https://satonomy.gitbook.io/satonomy"}
            className="text-[12px] font-normal text-zinc-500 hover:text-zinc-300 flex gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/gitbook.svg" alt="Help" width={16} height={16} />
            Check our docs
          </Link>
        </div>
      </Modal>
    </>
  );
};
