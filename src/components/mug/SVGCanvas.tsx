// SVGCanvas.tsx
import type { Activity } from "@prisma/client";
import React from "react";
import { getQuadrantCoordinates } from "./utils/canvas/getQuadrantCoordinates";
import { convertToSVGPath } from "./utils/canvas/convertToSVGPath";
import { calculateGridDimensions } from "./utils/canvas/calculateGridDimensions";

const SVG_WIDTH = 2000; // 200 mm
const SVG_HEIGHT = 960; // 96 mm

const FREETEXT_HEIGHT = 60;
const FREETEXT_X = 0;

const METRIC_WIDTH = 1000;
const METRIC_HEIGHT = 60;
const METRIC_X = 1000;

const FREETEXT = "Kimberley's 2023 Wrapped";
const METRIC_TEXT = "Activities";

const FREE_AREA_HEIGHT = SVG_HEIGHT - FREETEXT_HEIGHT;

const CELL_MARGIN = 10;

interface SVGCanvasProps {
  activities: (Activity | null)[];
  backgroundColor: string;
  strokeColor: string;
  strokeWidth: number;
  svgRef: React.RefObject<SVGSVGElement>;
}

const SVGCanvas: React.FC<SVGCanvasProps> = ({
  activities,
  backgroundColor,
  strokeColor,
  strokeWidth,
  svgRef,
}) => {
  const NUM_ACTIVITIES = activities.length;
  const { rows, cols } = calculateGridDimensions(
    NUM_ACTIVITIES,
    SVG_WIDTH,
    FREE_AREA_HEIGHT,
  );

  const boxHeight = FREE_AREA_HEIGHT / rows;

  const activityPaths = activities.map((activity, index) => {
    if (!activity || typeof activity.summaryPolyline !== "string") return null;

    const quadrantCoordinates = getQuadrantCoordinates(
      activity.summaryPolyline,
      index,
      CELL_MARGIN,
      cols,
      SVG_WIDTH,
      boxHeight,
    );
    return convertToSVGPath(quadrantCoordinates);
  });

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className="p-4"
    >
      {/* BACKGROUND COLOR */}
      <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill={backgroundColor} />

      {/* POLYLINES */}
      {activityPaths.map(
        (path, index) =>
          path && (
            <path
              key={index}
              d={path}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          ),
      )}

      {/* FREE TEXT */}
      <text
        x={FREETEXT_X}
        y={SVG_HEIGHT - FREETEXT_HEIGHT / 2} // Center text vertically in the box
        fill={strokeColor}
        fontSize="60px"
        fontFamily="Helvetica, Roboto, sans-serif"
        fontWeight="bold"
        alignmentBaseline="middle"
      >
        {FREETEXT}
      </text>

      {/* METRIC */}
      <text
        x={METRIC_X + METRIC_WIDTH} // Right align from this point
        y={SVG_HEIGHT - METRIC_HEIGHT / 2}
        fill={strokeColor}
        fontSize="60px"
        fontFamily="Helvetica, Roboto, sans-serif"
        textAnchor="end" // Aligns the text to the right
        alignmentBaseline="middle"
      >
        <tspan fontWeight="bold" alignmentBaseline="middle">
          {NUM_ACTIVITIES}{" "}
        </tspan>
        <tspan fontWeight="normal" alignmentBaseline="middle">
          {METRIC_TEXT}
        </tspan>
      </text>
    </svg>
  );
};

export default SVGCanvas;
