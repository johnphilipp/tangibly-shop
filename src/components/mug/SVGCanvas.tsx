// SVGCanvas.tsx
import React from "react";
import type { Activity } from "@prisma/client";
import { convertToSVGPath } from "./utils/canvas/convertToSVGPath";
import { getQuadrantCoordinates } from "./utils/canvas/getQuadrantCoordinates";

const SVG_WIDTH = 2000;
const SVG_HEIGHT = 1000;
const ASPECT_RATIO = { rows: 5, cols: 10 };
export const MAX_ACTIVITIES = ASPECT_RATIO.rows * ASPECT_RATIO.cols;

interface SVGCanvasProps {
  activities: (Activity | null)[];
  backgroundColor: string;
  strokeColor: string;
  strokeWidth: number;
  padding: number;
  svgRef: React.RefObject<SVGSVGElement>;
  onClickActivity: (index: number) => void;
}

const SVGCanvas: React.FC<SVGCanvasProps> = ({
  activities,
  backgroundColor,
  strokeColor,
  strokeWidth,
  padding,
  svgRef,
  onClickActivity,
}) => {
  const pathDataArray = activities.map((activity, index) => {
    const polyData = activity?.summaryPolyline;
    if (!polyData) return "";
    const quadrantCoordinates = getQuadrantCoordinates(
      polyData,
      index,
      padding,
      ASPECT_RATIO,
      SVG_WIDTH,
      SVG_HEIGHT,
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
      <rect
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        fill={backgroundColor}
        stroke={"#cfcfcf"}
        strokeWidth={"2"}
      />

      {Array.from({ length: MAX_ACTIVITIES }).map((_, index) => {
        const row = Math.floor(index / ASPECT_RATIO.cols);
        const col = index % ASPECT_RATIO.cols;
        const quadrantWidth =
          (SVG_WIDTH - padding * (ASPECT_RATIO.cols + 1)) / ASPECT_RATIO.cols;
        const quadrantHeight =
          (SVG_HEIGHT - padding * (ASPECT_RATIO.rows + 1)) / ASPECT_RATIO.rows;
        const x = col * (quadrantWidth + padding) + padding;
        const y = row * (quadrantHeight + padding) + padding;

        return (
          <g key={index} onClick={() => onClickActivity(index)}>
            {/* Render a transparent rectangle to capture the click event */}
            <rect
              x={x}
              y={y}
              width={quadrantWidth}
              height={quadrantHeight}
              fill="transparent"
              className="hoverable-rect"
              style={{ cursor: "pointer" }}
            />

            {/* Check if the activity is null and render a plus sign */}
            {activities[index] === null && (
              <text
                x={x + quadrantWidth / 2}
                y={y + quadrantHeight / 2}
                alignmentBaseline="middle"
                textAnchor="middle"
                fontSize="32"
                fill="gray"
                className="non-interactive-path"
              >
                +
              </text>
            )}
          </g>
        );
      })}

      {/* Render the paths last so they are on top of the transparent rectangles */}
      {pathDataArray.map((pathData, index) => (
        <path
          key={index}
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          className="non-interactive-path"
        />
      ))}
    </svg>
  );
};

export default SVGCanvas;
