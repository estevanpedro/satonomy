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
        <Image src="/info.svg" alt="Help" width={20} height={20} />
      </div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <h2 className="text-[20px] font-bold mb-8">How to use </h2>
        <p className="mt-4">1. Connect your wallet</p>
        <p className="mt-4">2. Add inputs [+]</p>
        <p className="mt-4">3. Select the best UTXO for you case</p>
        <p className="mt-4">4. Add outputs [+] </p>
        <p className="mt-4">5. Adjust fee</p>
        <p className="mt-4">6. Confirm the transaction</p>

        <br />
        <Link
          href={"https://x.com/satonomy"}
          className="text-[12px] font-normal text-zinc-500 hover:text-zinc-300 flex gap-2"
        >
          <Image src="/gitbook.svg" alt="Help" width={16} height={16} />
          Check our docs
        </Link>
      </Modal>
    </>
  );
};
