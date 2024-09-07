import { butterflyAtom } from "@/app/recoil/butterflyAtom";
import { configAtom } from "@/app/recoil/confgsAtom";
import { utxoAtom } from "@/app/recoil/utxoAtom";
import React, { useState, useRef } from "react";
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";

export const Canvas = ({ children }: { children: React.ReactNode }) => {
  const [butterfly, setButterfly] = useRecoilState(butterflyAtom);
  const setConfigs = useSetRecoilState(configAtom);
  const { proMode, isInputFullDeckOpen } = useRecoilValue(configAtom); // Get proMode value from the config
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [scale, setScale] = useState(1);
  const start = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const utxos = useRecoilValue(utxoAtom);
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!proMode) return; // Disable panning if not in proMode
    setIsPanning(true);
    start.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!proMode || !isPanning) return; // Disable panning if not in proMode or not panning
    setOffset({
      x: e.clientX - start.current.x,
      y: e.clientY - start.current.y,
    });
  };

  const handleMouseUp = () => {
    if (!proMode) return; // Disable mouse events if not in proMode
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!proMode) return; // Disable zooming if not in proMode
    e.preventDefault();
    const zoomFactor = 0.02; // Zoom sensitivity

    // Get the mouse position relative to the canvas
    const mouseX =
      e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0);
    const mouseY =
      e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0);

    // Calculate the new scale based on the wheel scroll
    let newScale = scale - e.deltaY * zoomFactor;
    newScale = Math.min(Math.max(newScale, 0.1), 1); // Limit scale between 0.1 and 1

    // Adjust the offset to zoom relative to the mouse position
    const scaleRatio = newScale / scale;
    const newOffset = {
      x: mouseX - (mouseX - offset.x) * scaleRatio,
      y: mouseY - (mouseY - offset.y) * scaleRatio,
    };

    setScale(newScale);
    setOffset(newOffset);
  };

  const resetCanvas = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const resetButterfly = () => {
    setButterfly({ inputs: [], outputs: [] });
    setConfigs((prev) => ({
      ...prev,
      isInputDeckOpen: false,
      isOutputDeckOpen: false,
      feeCost: 0,
    }));
  };
  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        width: "100%",
        height: "calc(100vh - 113.4px)",
        overflow: proMode ? "hidden" : "auto", // Use normal scroll when not in proMode
        cursor: proMode && isPanning ? "grabbing" : proMode ? "grab" : "auto", // No custom cursor when not in proMode
        position: "relative",
      }}
    >
      <div
        className="flex  justify-center"
        style={{
          transform: proMode
            ? `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
            : "none", // Disable transform when not in proMode
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>

      <div
        className={`fixed  left-4 gap-4 hidden sm:flex ${
          isInputFullDeckOpen ? "top-[82px]" : "bottom-0"
        }`}
      >
        {!isInputFullDeckOpen && (
          <div
            onClick={() => {
              setConfigs((prev) => ({
                ...prev,
                isInputDeckOpen: false,
                isOutputDeckOpen: false,
                proMode: !prev.proMode,
              }));
            }}
            className="hover:bg-zinc-600 hover:border-zinc-400  rounded-tl-[20px] rounded-tr-[20px] bg-zinc-950 py-2 px-4 border-2 border-zinc-600 flex flex-col cursor-pointer"
          >
            <div className="text-[12px] flex items-center justify-center opacity-50">
              Action
            </div>
            <div className="flex justify-center items-center">
              {proMode ? "Simple Mode" : "Pro Mode"}
            </div>
          </div>
        )}

        {proMode && !isInputFullDeckOpen && (
          <button
            onClick={resetCanvas}
            className={`rounded-tl-[20px] rounded-tr-[20px] bg-zinc-950 py-2 px-4 border-2 border-zinc-600 flex flex-col hover:bg-zinc-600 hover:border-zinc-400 justify-center items-center`}
          >
            <div className="text-[12px] flex items-center justify-center opacity-50">
              Action
            </div>
            <div>Reset Position &#x21C5;</div>
          </button>
        )}
        {(butterfly.inputs?.length > 0 || butterfly.outputs?.length > 0) &&
          !isInputFullDeckOpen && (
            <button
              onClick={resetButterfly}
              className={`rounded-tl-[20px] rounded-tr-[20px] bg-zinc-950 py-2 px-4 border-2 border-zinc-600 flex flex-col hover:bg-zinc-600 hover:border-zinc-400 justify-center items-center`}
            >
              <div className="text-[12px] flex items-center justify-center opacity-50">
                Action
              </div>
              <div>Clean</div>
            </button>
          )}

        {(proMode || isInputFullDeckOpen) && (
          <>
            <button
              onClick={() =>
                setConfigs((prev) => ({
                  ...prev,
                  isInputFullDeckOpen: !prev.isInputFullDeckOpen,
                  isInputDeckOpen: false,
                }))
              }
              className={`rounded-tl-[20px] rounded-tr-[20px] bg-zinc-950 py-2 px-4 border-2 border-zinc-600 flex flex-col hover:bg-zinc-600 hover:border-zinc-400 justify-center items-center`}
            >
              <div className="text-[12px] flex items-center justify-center opacity-50">
                Action
              </div>
              <div>
                {isInputFullDeckOpen
                  ? `Close portfolio (${utxos?.length})`
                  : "Open portfolio (${utxos?.length})"}
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
