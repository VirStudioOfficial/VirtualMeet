"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface WhiteboardProps {
  width?: number;
  height?: number;
}

export default function Whiteboard({
  width = 900,
  height = 550,
}: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(4);

  const getPosition = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return { x: 0, y: 0 };
      }

      const rect = canvas.getBoundingClientRect();

      return {
        x: ((event.clientX - rect.left) / rect.width) * canvas.width,
        y: ((event.clientY - rect.top) / rect.height) * canvas.height,
      };
    },
    []
  );

  const startDrawing = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const context = canvas.getContext("2d");

      if (!context) return;

      const { x, y } = getPosition(event);

      context.beginPath();
      context.moveTo(x, y);

      setIsDrawing(true);
      canvas.setPointerCapture(event.pointerId);
    },
    [getPosition]
  );

  const draw = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;

      if (!canvas) return;

      const context = canvas.getContext("2d");

      if (!context) return;

      const { x, y } = getPosition(event);

      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.lineCap = "round";
      context.lineJoin = "round";

      context.lineTo(x, y);
      context.stroke();
    },
    [color, getPosition, isDrawing, lineWidth]
  );

  const stopDrawing = useCallback(
    (event?: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;

      if (canvas && event) {
        canvas.releasePointerCapture(event.pointerId);
      }

      setIsDrawing(false);
    },
    []
  );

  const clearBoard = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.fillStyle = "#111827";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-900 p-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">
            Color
          </label>

          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="h-9 w-12 cursor-pointer rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">
            Size
          </label>

          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(event) =>
              setLineWidth(Number(event.target.value))
            }
          />
        </div>

        <button
          type="button"
          onClick={clearBoard}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          🗑️ Clear
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
          className="block h-auto w-full touch-none"
        />
      </div>
    </div>
  );
}
