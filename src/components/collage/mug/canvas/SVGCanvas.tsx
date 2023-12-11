import type { Activity } from "@prisma/client";
import React from "react";
import { getQuadrantCoordinates } from "../../../shared/utils/getQuadrantCoordinates";
import { convertToSVGPath } from "../../../shared/utils/convertToSVGPath";
import { calculateGridDimensions } from "../../../shared/utils/calculateGridDimensions";
import { getProperties } from "../../../shared/utils/getProperties";

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
  useText: boolean;
  primaryText: string;
  secondaryText: string;
  svgRef: React.RefObject<SVGSVGElement>;
  onClickActivity: (index: number) => void;
}

const SVGCanvas: React.FC<SVGCanvasProps> = ({
  activities,
  backgroundColor,
  strokeColor,
  useText,
  primaryText,
  secondaryText,
  svgRef,
  onClickActivity,
}) => {
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
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`-60 -60 ${SVG_WIDTH + 120} ${SVG_HEIGHT + 120}`}
        preserveAspectRatio="xMidYMid meet"
        className="border"
      >
        {/* BACKGROUND COLOR */}
        <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill={backgroundColor} />

        {/* TRANSPARENT RECTANGLES */}
        {Array.from({ length: numActivities }).map((_, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const quadrantWidth = SVG_WIDTH / cols;
          const quadrantHeight = FREE_AREA_HEIGHT / rows;
          const x = col * quadrantWidth;
          const y = row * quadrantHeight;

          return (
            <g key={index} onClick={() => onClickActivity(index)}>
              <rect
                x={x}
                y={y}
                width={quadrantWidth}
                height={quadrantHeight}
                className="hoverable-rect"
                fill="transparent"
                style={{ cursor: "pointer" }}
              />
            </g>
          );
        })}

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
              fontSize="60px"
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
              fontSize="60px"
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
  );
};

export default SVGCanvas;
