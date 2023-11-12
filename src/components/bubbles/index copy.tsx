import React, { useRef, useEffect, useState } from "react";
import { useData } from "~/contexts/DataContext";

export default function BubblesCanvas() {
  const { activities } = useData();
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Constants for margin and corner radius
  const margin = 2;
  const cornerRadius = 5;
  const defaultIntensity = 20;

  // Function to get the day of the year from a date string
  const getDayOfYear = (dateString: string) => {
    const date = new Date(dateString);
    const start = new Date(date.getFullYear(), 0, 0);
    const diff =
      date -
      start +
      (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  // Adjusted logIntensity function
  const logIntensity = (value, min, max) => {
    if (value <= min) return defaultIntensity;
    if (value >= max) return 100;
    return ((value - min) / (max - min)) * 80 + 20;
  };

  // Calculate the max and min moving time
  const maxMovingTime = Math.max(...activities.map((a) => a.moving_time / 60));
  const minMovingTime = Math.min(...activities.map((a) => a.moving_time / 60));

  // Function to draw a rounded rectangle
  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  };

  // Calculate the canvas size and update on window resize
  useEffect(() => {
    function updateSize() {
      if (canvasRef.current) {
        const width = canvasRef.current.parentElement.offsetWidth;
        const height = Math.ceil(width / 53) * 7; // Maintain aspect ratio for 53x7 grid
        setCanvasSize({ width, height });
      }
    }

    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Draw on canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const { width, height } = canvasSize;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate rectangle size, accounting for margins
      const rectWidth = (width - margin * 54) / 53;
      const rectHeight = (height - margin * 8) / 7;

      // Initialize an array to track drawn days
      const drawnDays = new Set();

      // Draw rectangles for activities
      activities.forEach((activity) => {
        const dayOfYear = getDayOfYear(activity.start_date_local);
        const intensity = logIntensity(
          activity.moving_time / 60,
          minMovingTime,
          maxMovingTime,
        );
        const alpha = intensity / 100;

        // Adjust position for margin
        const x = (dayOfYear % 53) * (rectWidth + margin) + margin;
        const y = Math.floor(dayOfYear / 53) * (rectHeight + margin) + margin;

        // Set fill style and draw rounded rectangle
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        drawRoundedRect(ctx, x, y, rectWidth, rectHeight, cornerRadius);

        // Mark the day as drawn
        drawnDays.add(dayOfYear);
      });

      // Draw default rectangles for days without activities
      for (let i = 0; i < 365; i++) {
        if (!drawnDays.has(i)) {
          const x = (i % 53) * (rectWidth + margin) + margin;
          const y = Math.floor(i / 53) * (rectHeight + margin) + margin;
          ctx.fillStyle = `rgba(0, 0, 0, ${defaultIntensity / 100})`;
          drawRoundedRect(ctx, x, y, rectWidth, rectHeight, cornerRadius);
        }
      }
    }
  }, [activities, canvasSize]);

  return (
    <div className="m-4 space-y-4">
      <div className="mx-auto border bg-white text-center shadow-lg">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
        />
      </div>
    </div>
  );
}
