import type { Activity } from "@prisma/client";
import React from "react";
import { getQuadrantCoordinates } from "./utils/getQuadrantCoordinates";
import { convertToSVGPath } from "./utils/convertToSVGPath";
import { calculateGridDimensions } from "./utils/calculateGridDimensions";
import { getProperties } from "./utils/getProperties";

const FREETEXT_HEIGHT = 120;
const FREETEXT_X = 0;

const METRIC_WIDTH = 1000;
const METRIC_HEIGHT = 120;

const SPACER = 150;

interface SVGCanvasProps {
  SVG_WIDTH: number;
  SVG_HEIGHT: number;
  activities: (Activity | null)[];
  backgroundColor: string;
  strokeColor: string;
  useText: boolean;
  primaryText: string;
  secondaryText: string;
  svgRef: React.RefObject<SVGSVGElement>;
}

const SVGCanvas: React.FC<SVGCanvasProps> = ({
  SVG_WIDTH,
  SVG_HEIGHT,
  activities,
  backgroundColor,
  strokeColor,
  useText,
  primaryText,
  secondaryText,
  svgRef,
}) => {
  const FREE_AREA_HEIGHT = SVG_HEIGHT - FREETEXT_HEIGHT - SPACER;
  const METRIC_X = SVG_WIDTH - METRIC_WIDTH;

  const numActivities = activities.length;

  // Determine CELL_MARGIN and STROKE_WIDTH based on NUM_ACTIVITIES
  const { cellMargin, strokeWidth } = getProperties(numActivities);

  // Adjust the free area height based on whether text is used
  const adjustedFreeAreaHeight = useText ? FREE_AREA_HEIGHT : SVG_HEIGHT;

  const { rows, cols } = calculateGridDimensions(
    numActivities,
    SVG_WIDTH,
    adjustedFreeAreaHeight,
  );

  const boxHeight = adjustedFreeAreaHeight / rows;

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
    <div style={{ backgroundColor: backgroundColor }}>
      <div className="gridBackground border">
        <svg
          ref={svgRef}
          height="400px"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          className="mx-auto bg-white p-4"
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
          {useText && (
            <>
              <text
                x={FREETEXT_X}
                y={SVG_HEIGHT - FREETEXT_HEIGHT / 2} // Center text vertically in the box
                fill={strokeColor}
                fontSize="100px"
                fontFamily="'Roboto', sans-serif"
                fontWeight="bold"
                alignmentBaseline="middle"
              >
                {primaryText}
              </text>

              {/* METRIC */}
              <text
                x={METRIC_X + METRIC_WIDTH} // Right align from this point
                y={SVG_HEIGHT - METRIC_HEIGHT / 2}
                fill={strokeColor}
                fontSize="100px"
                fontFamily="'Roboto', sans-serif"
                textAnchor="end" // Aligns the text to the right
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
    </div>
  );
};

export default SVGCanvas;
