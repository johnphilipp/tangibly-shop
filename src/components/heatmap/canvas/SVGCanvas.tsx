import type { Activity } from "@prisma/client";
import React from "react";

const SVG_WIDTH = 2000; // 200 mm
const SVG_HEIGHT = 960; // 96 mm

const FREETEXT_HEIGHT = 60;
const FREETEXT_X = 0;

const METRIC_WIDTH = 1000;
const METRIC_HEIGHT = 60;
const METRIC_X = 1000;

const SPACER = 50;
const ROWS = 7;
const COLS = 53;

const FREE_AREA_HEIGHT = SVG_HEIGHT - FREETEXT_HEIGHT - SPACER;

interface SVGCanvasProps {
  activities: (Activity | null)[];
  backgroundColor: string;
  strokeColor: string;
  useText: boolean;
  primaryText: string;
  secondaryText: string;
  svgRef: React.RefObject<SVGSVGElement>;
}

const SVGCanvas: React.FC<SVGCanvasProps> = ({
  activities,
  backgroundColor,
  strokeColor,
  useText,
  primaryText,
  secondaryText,
  svgRef,
}) => {
  const numActivities = activities.length;

  // Adjust the free area height based on whether text is used
  const adjustedFreeAreaHeight = useText ? FREE_AREA_HEIGHT : SVG_HEIGHT;

  // Calculate rectangle dimensions
  const rectWidth = SVG_WIDTH / COLS;
  const rectHeight = adjustedFreeAreaHeight / ROWS;

  // Generate grid of rectangles
  const rectangles = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      rectangles.push(
        <rect
          key={`${row}-${col}`}
          x={col * rectWidth}
          y={row * rectHeight}
          width={rectWidth}
          height={rectHeight}
          fill="none" // Or any other fill color
          stroke={strokeColor}
        />,
      );
    }
  }

  return (
    <div style={{ backgroundColor: backgroundColor }}>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`-60 -60 ${SVG_WIDTH + 120} ${SVG_HEIGHT + 120}`}
        preserveAspectRatio="xMidYMid meet"
        className="border"
      >
        {/* BACKGROUND COLOR */}
        <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill={backgroundColor} />

        {/* GRID OF RECTANGLES */}
        {rectangles}

        {/* FREE TEXT */}
        {useText && (
          <>
            <text
              x={FREETEXT_X}
              y={SVG_HEIGHT - FREETEXT_HEIGHT / 2}
              fill={strokeColor}
              fontSize="60px"
              fontFamily="'Roboto', sans-serif"
              fontWeight="bold"
              alignmentBaseline="middle"
            >
              {primaryText}
            </text>

            {/* METRIC */}
            <text
              x={METRIC_X + METRIC_WIDTH}
              y={SVG_HEIGHT - METRIC_HEIGHT / 2}
              fill={strokeColor}
              fontSize="60px"
              fontFamily="'Roboto', sans-serif"
              textAnchor="end"
              alignmentBaseline="middle"
            >
              <tspan fontWeight="bold" alignmentBaseline="middle">
                {secondaryText}
              </tspan>
            </text>
          </>
        )}
      </svg>
    </div>
  );
};

export default SVGCanvas;
