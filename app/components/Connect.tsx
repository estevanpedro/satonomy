import React, { useState, useEffect } from "react";
import { formatAddress } from "@/app/utils/format";
import { useAccounts, useConnectModal } from "@particle-network/btc-connectkit";
import { Button } from "@/app/components/ui/button";

export const ConnectButton = () => {
  const { openConnectModal, disconnect } = useConnectModal();
  const { accounts } = useAccounts();

  const account = accounts[0];
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

  return (
    <div
      className="relative dropdown-container gap-3 flex justify-center items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        variant="secondary"
        onClick={() => {
          if (!account) {
            openConnectModal?.();
          }
        }}
      >
        {account ? formatAddress(account) : "Connect Wallet"}
      </Button>

      {account && dropdownVisible && (
        <div
          className="absolute left-0 mt-2 "
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Button
            className="w-[148px]"
            onClick={() => {
              disconnect?.();
              setDropdownVisible(false);
            }}
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
};
