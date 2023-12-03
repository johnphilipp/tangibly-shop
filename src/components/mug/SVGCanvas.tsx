// SVGCanvas.tsx
import React from "react";

const SVG_WIDTH = 2000; // 200 mm
const SVG_HEIGHT = 960; // 96 mm

const TEXT_MARGIN = 60;

const FREETEXT_HEIGHT = 160;
const FREETEXT_X = 0;

const METRIC_WIDTH = 1000;
const METRIC_HEIGHT = 160;
const METRIC_X = 1000;

const FREETEXT = "Kimberley's 2023 Wrapped";
const METRIC_NUMBER = "147";
const METRIC_TEXT = "Activities";

const BOX_PADDING = 10; // Padding between boxes
const FREE_AREA_HEIGHT = SVG_HEIGHT - FREETEXT_HEIGHT; // Height of the area where boxes will be placed
const ACTIVITIES = 17;

// TODO: STRETCH

interface SVGCanvasProps {
  backgroundColor: string;
  strokeColor: string;
  svgRef: React.RefObject<SVGSVGElement>;
}

function calculateGridDimensions(
  activities: number,
  width: number,
  height: number,
  padding: number,
) {
  let bestLayout = {
    rows: 1,
    cols: activities,
    aspectDiff: Number.MAX_VALUE,
  };

  for (let cols = 1; cols <= activities; cols++) {
    const rows = Math.ceil(activities / cols);
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

// function calculateGridDimensions(
//   activities: number,
//   width: number,
//   height: number,
//   padding: number,
// ) {
//   let bestLayout = {
//     rows: 1,
//     cols: activities,
//     filledArea: 0,
//   };

//   for (let cols = 1; cols <= activities; cols++) {
//     const rows = Math.ceil(activities / cols);
//     const boxWidth = (width - (cols + 1) * padding) / cols;
//     const boxHeight = (height - (rows + 1) * padding) / rows;

//     // Calculate the filled area
//     const filledArea = boxWidth * boxHeight * Math.min(rows * cols, activities);

//     if (filledArea > bestLayout.filledArea) {
//       bestLayout = { rows, cols, filledArea };
//     }
//   }

//   return bestLayout;
// }

const SVGCanvas: React.FC<SVGCanvasProps> = ({
  backgroundColor,
  strokeColor,
  svgRef,
}) => {
  const { rows, cols } = calculateGridDimensions(
    ACTIVITIES,
    SVG_WIDTH,
    FREE_AREA_HEIGHT,
    BOX_PADDING,
  );
  const boxWidth = (SVG_WIDTH - (cols + 1) * BOX_PADDING) / cols;
  const boxHeight = (FREE_AREA_HEIGHT - (rows + 1) * BOX_PADDING) / rows;

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* BACKGROUND COLOR */}
      <rect
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        fill={backgroundColor}
        stroke={"#cfcfcf"}
        strokeWidth={"2"}
      />

      {/* GRID */}
      {Array.from({ length: rows * cols }).map((_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = col * (boxWidth + BOX_PADDING) + BOX_PADDING;
        const y = row * (boxHeight + BOX_PADDING) + BOX_PADDING;

        return index < ACTIVITIES ? (
          <rect
            key={index}
            x={x}
            y={y}
            width={boxWidth}
            height={boxHeight}
            fill="someColor" // Color for the boxes
            stroke="someBorderColor" // Border color for the boxes
          />
        ) : null; // Leave excess squares blank
      })}

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
          {METRIC_NUMBER}{" "}
        </tspan>
        <tspan fontWeight="normal" alignmentBaseline="middle">
          {METRIC_TEXT}
        </tspan>
      </text>
    </svg>
  );
};

export default SVGCanvas;
