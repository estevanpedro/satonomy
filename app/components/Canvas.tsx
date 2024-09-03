import React, { useState, useRef } from "react";

export const Canvas = ({ children }: { children: React.ReactNode }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [scale, setScale] = useState(1);
  const start = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    start.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - start.current.x,
        y: e.clientY - start.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.02; // Reduced zoom factor for slower zooming
    let newScale = scale - e.deltaY * zoomFactor;
    newScale = Math.min(Math.max(newScale, 0.5), 3); // Limit scale between 0.5 and 3
    setScale(newScale);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        width: "100%",
        height: "calc(100vh - 113.4px)",
        overflow: "hidden",
        cursor: isPanning ? "grabbing" : "grab",
        position: "relative",
      }}
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
          border: "1px solid red",
        }}
      >
        {children}
      </div>
    </div>
  );
};
