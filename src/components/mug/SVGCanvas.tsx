// SVGCanvas.tsx
import type { Activity } from "@prisma/client";
import React from "react";
import { getQuadrantCoordinates } from "./utils/canvas/getQuadrantCoordinates";
import { convertToSVGPath } from "./utils/canvas/convertToSVGPath";

const SVG_WIDTH = 2000; // 200 mm
const SVG_HEIGHT = 960; // 96 mm

const TEXT_MARGIN = 60;

const FREETEXT_HEIGHT = 160;
const FREETEXT_X = 0;

const METRIC_WIDTH = 1000;
const METRIC_HEIGHT = 160;
const METRIC_X = 1000;

const FREETEXT = "Kimberley's 2023 Wrapped";
const METRIC_TEXT = "Activities";

const BOX_PADDING = 0;
const FREE_AREA_HEIGHT = SVG_HEIGHT - FREETEXT_HEIGHT;

const MARGIN = 5;

// TODO: STRETCH

interface SVGCanvasProps {
  activities: (Activity | null)[];
  backgroundColor: string;
  strokeColor: string;
  svgRef: React.RefObject<SVGSVGElement>;
}

function calculateGridDimensions(
  numActivities: number,
  width: number,
  height: number,
  padding: number,
) {
  let bestLayout = {
    rows: 1,
    cols: numActivities,
    aspectDiff: Number.MAX_VALUE,
  };

  for (let cols = 1; cols <= numActivities; cols++) {
    const rows = Math.ceil(numActivities / cols);
    const boxWidth = (width - (cols + 1) * padding) / cols;
    const boxHeight = (height - (rows + 1) * padding) / rows;

    // Aspect difference favors more square-like layouts
    const aspectDiff = Math.abs(boxWidth / boxHeight - 1);

    // Update the best layout if this layout has a more square-like aspect ratio
    if (aspectDiff < bestLayout.aspectDiff) {
      bestLayout = { rows, cols, aspectDiff };
    }
  }

  return bestLayout;
}

const SVGCanvas: React.FC<SVGCanvasProps> = ({
  activities,
  backgroundColor,
  strokeColor,
  svgRef,
}) => {
  const NUM_ACTIVITIES = activities.length;
  const { rows, cols } = calculateGridDimensions(
    NUM_ACTIVITIES,
    SVG_WIDTH,
    FREE_AREA_HEIGHT,
    BOX_PADDING,
  );

  const boxHeight = (FREE_AREA_HEIGHT - (rows + 1) * BOX_PADDING) / rows;

  const activityPaths = activities.map((activity, index) => {
    if (!activity || typeof activity.summaryPolyline !== "string") return null;

    const quadrantCoordinates = getQuadrantCoordinates(
      activity.summaryPolyline,
      index,
      BOX_PADDING,
      MARGIN, // Pass the margin value
      { rows: 1, cols },
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
              strokeWidth="2"
            />
          ),
      )}

      {/* FREE TEXT */}
      <text
        x={FREETEXT_X + TEXT_MARGIN}
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
        x={METRIC_X + METRIC_WIDTH - TEXT_MARGIN} // Right align from this point
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
