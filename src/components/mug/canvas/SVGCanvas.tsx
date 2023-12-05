import type { Activity } from "@prisma/client";
import React from "react";
import { getQuadrantCoordinates } from "./utils/getQuadrantCoordinates";
import { convertToSVGPath } from "./utils/convertToSVGPath";
import { calculateGridDimensions } from "./utils/calculateGridDimensions";
import { getProperties } from "./utils/getProperties";

const SVG_WIDTH = 2000; // 200 mm
const SVG_HEIGHT = 960; // 96 mm

const FREETEXT_HEIGHT = 60;
const FREETEXT_X = 0;

const METRIC_WIDTH = 1000;
const METRIC_HEIGHT = 60;
const METRIC_X = 1000;

const SPACER = 50;

const FREE_AREA_HEIGHT = SVG_HEIGHT - FREETEXT_HEIGHT - SPACER;

interface SVGCanvasProps {
  activities: (Activity | null)[];
  backgroundColor: string;
  strokeColor: string;
  freeText: string;
  metricText: string;
  svgRef: React.RefObject<SVGSVGElement>;
}

const SVGCanvas: React.FC<SVGCanvasProps> = ({
  activities,
  backgroundColor,
  strokeColor,
  freeText,
  metricText,
  svgRef,
}) => {
  const NUM_ACTIVITIES = activities.length;

  // Determine CELL_MARGIN and STROKE_WIDTH based on NUM_ACTIVITIES
  const { cellMargin, strokeWidth } = getProperties(NUM_ACTIVITIES);

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
      cellMargin,
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
      viewBox={`-60 -60 ${SVG_WIDTH + 120} ${SVG_HEIGHT + 120}`}
      preserveAspectRatio="xMidYMid meet"
      className="border"
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
              strokeLinejoin="round"
              strokeLinecap="round"
              className="non-interactive-path"
            />
          ),
      )}

      {/* FREE TEXT */}
      <text
        x={FREETEXT_X}
        y={SVG_HEIGHT - FREETEXT_HEIGHT / 2} // Center text vertically in the box
        fill={strokeColor}
        fontSize="60px"
        fontFamily="'Roboto', sans-serif"
        fontWeight="bold"
        alignmentBaseline="middle"
      >
        {freeText}
      </text>

      {/* METRIC */}
      <text
        x={METRIC_X + METRIC_WIDTH} // Right align from this point
        y={SVG_HEIGHT - METRIC_HEIGHT / 2}
        fill={strokeColor}
        fontSize="60px"
        fontFamily="'Roboto', sans-serif"
        textAnchor="end" // Aligns the text to the right
        alignmentBaseline="middle"
      >
        <tspan fontWeight="bold" alignmentBaseline="middle">
          {metricText}
        </tspan>
      </text>
    </svg>
  );
};

export default SVGCanvas;
