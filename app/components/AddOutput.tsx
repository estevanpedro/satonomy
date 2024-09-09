import { Modal } from "@/app/components/Modal";
import { useState } from "react";

export const AddOutput = ({ onClick }: { onClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);

  return (
    <>
      <div
        className={`self-end w-[100px] h-[100px] rounded-xl flex flex-col gap-3 items-center justify-center text-4xl cursor-pointer border bg-zinc-950`}
        onClick={() => setIsOpen(true)}
      >
        +
      </div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="mb-6">Select an action</div>
        <div className="w-full flex text-[12px] flex-wrap gap-3">
          <button
            onClick={() => {
              onClick();
              onClose();
            }}
            className="border-[1px] border-zinc-700 text-zinc-300 py-2 px-4 rounded"
          >
            Transfer or split
          </button>
          <button className="border-[1px] border-zinc-700 text-zinc-700 py-2 px-4 rounded">
            Bridge
          </button>

          <button className="border-[1px] border-zinc-700 text-zinc-700 py-2 px-4 rounded">
            Swap with Saturn
          </button>

          <button className="border-[1px] border-zinc-700 text-zinc-700 py-2 px-4 rounded">
            Stake with Arch
          </button>

          <button className="border-[1px] border-zinc-700 text-zinc-700 py-2 px-4 rounded">
            Recursive Transactions
          </button>
          <button className="border-[1px] border-zinc-700 text-zinc-700 py-2 px-4 rounded">
            Add redeemScript
          </button>
        </div>

        <div className="mt-4 opacity-50 text-[12px]">
          Notes: only transfer and split of bitcoin is supported
        </div>
      </Modal>
    </>
  );
};
