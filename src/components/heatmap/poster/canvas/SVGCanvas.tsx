import type { Activity } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { buildYearlyActivityMap } from "./utils/buildYearlyActivityMap";
import { getDayOfYear } from "./utils/getDayOfYear";

const FREETEXT_HEIGHT = 120;
const FREETEXT_X = 0;

const METRIC_WIDTH = 1000;

const SPACER = 150;

const BASE_SIZE = { width: 3000, height: 3000 }; // Define a base size for scaling

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
  onClickActivity: (index: number) => void;
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
  onClickActivity,
}) => {
  const [elements, setElements] = useState<JSX.Element[]>([]);

  const textScaleFactor = Math.sqrt(
    (SVG_WIDTH * SVG_HEIGHT) / (BASE_SIZE.width * BASE_SIZE.height),
  );

  const LABEL_OFFSET = 100 * textScaleFactor;
  const ADJUSTED_SVG_WIDTH = SVG_WIDTH - LABEL_OFFSET;
  const ROWS = 7;
  const COLS = 53;
  const TEXT_SPACING = 80 * textScaleFactor;

  const METRIC_X = SVG_WIDTH - METRIC_WIDTH;

  const squareSize = Math.min(
    ADJUSTED_SVG_WIDTH / COLS,
    (SVG_HEIGHT - FREETEXT_HEIGHT - SPACER) / ROWS,
  );
  const totalGridHeight = squareSize * ROWS;
  const startY =
    (SVG_HEIGHT - (totalGridHeight + FREETEXT_HEIGHT + TEXT_SPACING)) / 2;
  const skip = 6;

  useEffect(() => {
    const dayToActivityIndexMap = new Map() as Map<number, number>;
    activities.forEach((activity, index) => {
      if (activity?.start_date_local) {
        const dayOfYear = getDayOfYear(new Date(activity.start_date_local));
        dayToActivityIndexMap.set(dayOfYear, index);
      }
    });

    const yearlyActivityMap = buildYearlyActivityMap(activities);
    const maxActivityTime = Math.max(...yearlyActivityMap);

    const calculateColorIntensity = (time: number): string => {
      if (time === 0 || maxActivityTime === 0) return "#f3f4f6"; // Default color for 0 moving time

      const scaledTime = Math.log(time + 1); // +1 to avoid log(0)
      const scaledMaxTime = Math.log(maxActivityTime + 1);
      return `rgba(234, 88, 12, ${(
        (scaledTime / scaledMaxTime) * 0.8 +
        0.2
      ).toFixed(2)})`;
    };

    const newElements: JSX.Element[] = [];
    let dayIndex = 0;
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        if (col === 0 && row < skip) continue;

        const x = LABEL_OFFSET + col * squareSize;
        const y = startY + row * squareSize;
        const activityTime = yearlyActivityMap[dayIndex] ?? 0;

        const activityIndex = dayToActivityIndexMap.get(dayIndex + 1); // Day index starts from 1

        newElements.push(
          <g
            key={dayIndex}
            onClick={() =>
              activityIndex !== undefined
                ? onClickActivity(activityIndex)
                : null
            }
          >
            <rect
              key={`rect-${col}-${row}`}
              x={x}
              y={y}
              width={squareSize}
              height={squareSize}
              className="hoverable-rect"
              fill={calculateColorIntensity(activityTime)}
              style={{
                cursor: activityIndex !== undefined ? "pointer" : "default",
              }}
            />
          </g>,
        );

        dayIndex++;
      }
    }

    const weekdays = ["Mon", "Wed", "Fri", "Sun"];
    const LABEL_X_POSITION = 10;

    weekdays.forEach((day, i) => {
      newElements.push(
        <text
          key={`day-${day}`}
          x={LABEL_X_POSITION}
          y={startY + 2 * i * squareSize + squareSize / 2}
          fill={strokeColor}
          fontSize="32"
          fontFamily="'Roboto', sans-serif"
          textAnchor="start"
          alignmentBaseline="central"
        >
          {day}
        </text>,
      );
    });

    setElements(newElements);
  }, [activities, squareSize, startY, strokeColor, onClickActivity]);

  // Repositioned Free Text and Metric
  const textYPosition = startY + totalGridHeight + TEXT_SPACING;

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

          {/* GRID OF RECTANGLES WITH COLOR INTENSITY */}
          {elements}

          {/* FREE TEXT */}
          {useText && (
            <>
              <text
                x={FREETEXT_X}
                y={textYPosition}
                fill={strokeColor}
                fontSize={`${52 * textScaleFactor}px`}
                fontFamily="'Roboto', sans-serif"
                fontWeight=""
                alignmentBaseline="middle"
              >
                {primaryText}
              </text>

              {/* METRIC */}
              <text
                x={METRIC_X + METRIC_WIDTH}
                y={textYPosition}
                fill={strokeColor}
                fontSize={`${52 * textScaleFactor}px`}
                fontFamily="'Roboto', sans-serif"
                textAnchor="end"
                alignmentBaseline="middle"
              >
                <tspan fontWeight="" alignmentBaseline="middle">
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
