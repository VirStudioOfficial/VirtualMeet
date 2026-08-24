"use client";

import {
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
}

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(3);

  function getPoint(
    event: PointerEvent<HTMLCanvasElement>
  ): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    return {
      x:
        ((event.clientX - rect.left) / rect.width) *
        canvas.width,
      y:
        ((event.clientY - rect.top) / rect.height) *
        canvas.height,
    };
  }

  function redraw(nextStrokes = strokes) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.lineCap = "round";
    context.lineJoin = "round";

    nextStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) {
        return;
      }

      context.beginPath();
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;

      context.moveTo(
        stroke.points[0].x,
        stroke.points[0].y
      );

      stroke.points.slice(1).forEach((point) => {
        context.lineTo(point.x, point.y);
      });

      context.stroke();
    });
  }

  function startDrawing(
    event: PointerEvent<HTMLCanvasElement>
  ) {
    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    const point = getPoint(event);

    setIsDrawing(true);

    setStrokes((current) => [
      ...current,
      {
        points: [point],
        color,
        width: lineWidth,
      },
    ]);
  }

  function draw(
    event: PointerEvent<HTMLCanvasElement>
  ) {
    if (!isDrawing) {
      return;
    }

    const point = getPoint(event);

    setStrokes((current) => {
      if (current.length === 0) {
        return current;
      }

      const updated = [...current];
      const lastStroke = updated[updated.length - 1];

      updated[updated.length - 1] = {
        ...lastStroke,
        points: [...lastStroke.points, point],
      };

      return updated;
    });
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clearBoard() {
    setStrokes([]);
  }

  useEffect(() => {
    redraw();
  }, [strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      const previousWidth = canvas.width;
      const previousHeight = canvas.height;

      canvas.width = Math.max(
        Math.floor(rect.width * window.devicePixelRatio),
        1
      );

      canvas.height = Math.max(
        Math.floor(rect.height * window.devicePixelRatio),
        1
      );

      if (previousWidth && previousHeight) {
        redraw();
      }
    };

    resize();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl bg-gray-900">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-800 p-3">
        <span className="font-semibold">
          🎨 Whiteboard
        </span>

        <input
          type="color"
          value={color}
          onChange={(event) =>
            setColor(event.target.value)
          }
          className="h-9 w-12 cursor-pointer rounded-lg bg-gray-800"
          title="انتخاب رنگ"
        />

        <select
          value={lineWidth}
          onChange={(event) =>
            setLineWidth(Number(event.target.value))
          }
          className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-white outline-none"
        >
          <option value={2}>نازک</option>
          <option value={3}>متوسط</option>
          <option value={5}>ضخیم</option>
          <option value={8}>خیلی ضخیم</option>
        </select>

        <button
          type="button"
          onClick={clearBoard}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm hover:bg-red-700"
        >
          پاک کردن
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        onPointerLeave={stopDrawing}
        className="h-[500px] w-full touch-none bg-gray-950"
      />
    </div>
  );
}
