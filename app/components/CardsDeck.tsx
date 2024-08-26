"use client";

import React, { useRef, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { useDrag } from "@use-gesture/react";

import { CardOption } from "@/app/components/Card";
import { useRecoilState, useRecoilValue } from "recoil";
import { MempoolUTXO, utxoAtom } from "@/app/recoil/utxoAtom";
import { butterflyAtom } from "@/app/recoil/butterflyAtom";
import { configAtom } from "@/app/recoil/confgsAtom";

export const UtxoDeck = () => {
  const utxos = useRecoilValue(utxoAtom);
  return utxos && Boolean(utxos?.length) ? (
    <CardCarousel utxos={utxos} />
  ) : null;
};

export const CardCarousel = ({ utxos }: { utxos: MempoolUTXO[] }) => {
  const [configs, setConfigs] = useRecoilState(configAtom);
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom);
  const containerRef = useRef<HTMLDivElement>(null);
  const [{ x }, api] = useSpring(() => ({ x: 0 }));
  const bind = useDrag(
    ({ offset: [ox] }) => {
      api.start({ x: ox });
    },
    { axis: "x" }
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      api.start({ x: x.get() - e.deltaY });
    };

    const container = containerRef.current;

    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [api, x]);

  const handleMouseEnter = (api: any) => {
    api.start({ scale: 1.05 });
  };

  const handleMouseLeave = (api: any) => {
    api.start({ scale: 1 });
  };

  const onClick = (utxo: MempoolUTXO) => {
    setConfigs((prev: any) => ({
      ...prev,
      isInputDeckOpen: false,
      feeCost: prev.feeCost ? prev.feeCost : 1000,
    }));

    const outputSum = butterfly.outputs.reduce(
      (acc, cur) => acc + cur.value,
      0
    );

    const inputSum =
      butterfly.inputs.reduce((acc, cur) => acc + cur.value, 0) + utxo.value;

    setButterfly((prev: any) => ({
      ...prev,
      inputs: [...prev.inputs, utxo],
    }));

    if (inputSum - outputSum > 0) {
      let outputsUpdated = [...butterfly.outputs];

      outputsUpdated[butterfly.outputs.length - 1] = {
        ...outputsUpdated[butterfly.outputs.length - 1],
        value:
          inputSum -
          configs.feeCost -
          outputSum -
          configs.feeCost +
          (inputSum - utxo.value),
      };

      setButterfly((prev) => ({
        ...prev,
        outputs: [...outputsUpdated],
      }));
    }
  };

  return (
    <div
      className={`fixed bottom-4 w-[100vw] ${
        !configs.isInputDeckOpen ? "hidden" : "flex"
      }`}
    >
      <div
        ref={containerRef}
        className="relative w-full h-[340px] overflow-hidden flex justify-center items-center"
        style={{ touchAction: "none" }}
      >
        <animated.div
          {...bind()}
          className="flex space-x-4 cursor-grab"
          style={{ x }}
        >
          {utxos!.map((utxo, index) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [props, api] = useSpring(() => ({ scale: 1 }));

            return (
              <animated.div
                key={index}
                className="flex items-center justify-center"
                style={{
                  ...props,
                  width: "200px",
                  height: "300px",
                }}
                onMouseEnter={() => handleMouseEnter(api)}
                onMouseLeave={() => handleMouseLeave(api)}
              >
                <CardOption onClick={onClick} utxo={utxo} />
              </animated.div>
            );
          })}
        </animated.div>
      </div>
    </div>
  );
};
