import React, { useState, useEffect } from "react";
import { formatAddress } from "@/app/utils/format";
import { useAccounts, useConnectModal } from "@particle-network/btc-connectkit";
import { useSetRecoilState } from "recoil";
import { utxoAtom } from "@/app/recoil/utxoAtom";
import { ordByWalletAtom } from "@/app/recoil/ordByWalletAtom";
import { runesAtom } from "@/app/recoil/runesAtom";
import { ordinalsAtom } from "@/app/recoil/ordinalsAtom";

export const ConnectButton = ({
  mobileVisible,
}: {
  mobileVisible?: boolean;
}) => {
  const { openConnectModal, disconnect } = useConnectModal();
  const { accounts } = useAccounts();

  const account = accounts[0];
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const setUtxo = useSetRecoilState(utxoAtom);
  const setOrdByWallet = useSetRecoilState(ordByWalletAtom);
  const setRunesUtxos = useSetRecoilState(runesAtom);
  const setOrdinals = useSetRecoilState(ordinalsAtom);

  const handleMouseEnter = () => {
    setDropdownVisible(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY;
    const x = e.clientX;

    if (y < rect.top || y > rect.bottom || x < rect.left || x > rect.right) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownVisible &&
        !document
          .querySelector(".dropdown-container")
          ?.contains(e.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  const onDisconnect = () => {
    // sleep 1s
    setTimeout(() => {
      setUtxo(null);
      setOrdByWallet(undefined);
      setRunesUtxos(null);
      setOrdinals(null);
    }, 500);
  };

  return (
    <div
      className={`relative dropdown-container gap-3 justify-center items-center ${
        mobileVisible ? "flex" : "hidden sm:flex"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="text-white bg-zinc-900 px-4 py-2 rounded-md"
        onClick={() => {
          if (!account) {
            openConnectModal?.();
          }
        }}
      >
        {account ? formatAddress(account) : "Connect Wallet"}
      </button>

      {account && dropdownVisible && (
        <div
          className="absolute left-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className="w-[148px] text-white bg-zinc-600 px-4 py-2 rounded-md"
            onClick={() => {
              disconnect?.();
              setDropdownVisible(false);

              onDisconnect();
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
