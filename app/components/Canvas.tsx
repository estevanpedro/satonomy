import React, { useState, useRef } from "react"
import Image from "next/image"
import { useRecoilValue } from "recoil"

import { configsAtom } from "@/app/recoil/confgsAtom"
import { track } from "@vercel/analytics"

export const Canvas = ({ children }: { children: React.ReactNode }) => {
  const { proMode, isInputFullDeckOpen } = useRecoilValue(configsAtom)

  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [scale, setScale] = useState(1)
  const start = useRef({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!proMode) return
    setIsPanning(true)
    start.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!proMode || !isPanning) return
    setOffset({
      x: e.clientX - start.current.x,
      y: e.clientY - start.current.y,
    })
  }

  const handleMouseUp = () => {
    if (!proMode) return
    setIsPanning(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!proMode) return
    e.preventDefault()
    const zoomFactor = 0.005 // Slower zoom sensitivity

    const mouseX =
      e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0)
    const mouseY =
      e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0)

    let newScale = scale - e.deltaY * zoomFactor
    newScale = Math.min(Math.max(newScale, 0.1), 1) // Restrict scale between 1 and 2

    const scaleRatio = newScale / scale
    const newOffset = {
      x: mouseX - (mouseX - offset.x) * scaleRatio,
      y: mouseY - (mouseY - offset.y) * scaleRatio,
    }

    setScale(newScale)
    setOffset(newOffset)
  }

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 1))
  }

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.1)) // Minimum scale is 1
  }

  const resetCanvas = () => {
    track("resetCanvas", {}, { flags: ["resetCanvas"] })
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

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
        height: "calc(100vh - 79px)",
        overflow: proMode ? "hidden" : "auto",
        cursor: proMode && isPanning ? "grabbing" : proMode ? "grab" : "auto",
        position: "relative",
      }}
      className="hidden sm:block scrollbar z-99"
    >
      <div
        className="flex justify-center z-0"
        style={{
          transform: proMode
            ? `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
            : "none",
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>

      <div
        className={`fixed right-4 gap-4 hidden sm:flex z-1 ${
          isInputFullDeckOpen ? "top-[82px]" : "bottom-0"
        }`}
      >
        {proMode && !isInputFullDeckOpen && (
          <div className="bg-zinc-950 border border-zinc-800 rounded flex-col flex mb-16">
            <button
              onClick={resetCanvas}
              className="p-4 hover:bg-zinc-800 rounded"
            >
              <Image
                src="/directions.png"
                width={16}
                height={16}
                alt="Directions"
                className="w-[16px] h-[16px]"
              />
            </button>
            <button onClick={zoomIn} className="p-4 hover:bg-zinc-800 rounded">
              +
            </button>
            <button onClick={zoomOut} className="p-4 hover:bg-zinc-800 rounded">
              -
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
