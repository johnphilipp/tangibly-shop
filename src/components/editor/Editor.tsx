import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDownload } from "react-icons/ai";
import { BiShuffle } from "react-icons/bi";
import { BsEyeFill } from "react-icons/bs";
import type { FlattenedActivity } from "~/server/api/routers/activities";
import Button from "../Button";
import { ActivityModal } from "./ActivityModal";
import { AddActivityModal } from "./AddActivityModal";
import { convertToSVGPath } from "./utils/convertToSVGPath";
import { getQuadrantCoordinates } from "./utils/getQuadrantCoordinates";
import { handleDownload } from "./utils/handleDownload";

export interface AspectRatio {
  rows: number;
  cols: number;
}

export default function Editor({
  activities,
}: {
  activities: FlattenedActivity[];
}) {
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF"); // default white
  const [strokeColor, setStrokeColor] = useState("#000000"); // default black

  const aspectRatios: AspectRatio[] = [
    { rows: 5, cols: 10 },
    { rows: 10, cols: 10 },
    { rows: 10, cols: 20 },
    { rows: 20, cols: 20 },
  ];
  const [currentAspectRatio, setCurrentAspectRatio] = useState<AspectRatio>(
    aspectRatios[0]!,
  );
  const MAX_ACTIVITIES = currentAspectRatio.rows * currentAspectRatio.cols;
  const SVG_WIDTH = 100 * currentAspectRatio.cols;
  const SVG_HEIGHT = 100 * currentAspectRatio.rows;

  const [strokeWidth, setStrokeWidth] = useState(4);
  const [padding, setPadding] = useState(10);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<
    number | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const activitiesWithGPS = activities.filter(
    (activity) => activity.summaryPolyline,
  );
  const [selectedActivities, setSelectedActivities] = useState<
    (FlattenedActivity | null)[]
  >(activitiesWithGPS.slice(0, MAX_ACTIVITIES));

  const shuffleActivities = () => {
    const shuffled = [...activitiesWithGPS].sort(() => Math.random() - 0.5);
    setSelectedActivities(shuffled.slice(0, MAX_ACTIVITIES));
  };

  const pathDataArray = selectedActivities.map((activity, index) => {
    const polyData = activity?.summaryPolyline;
    if (!polyData) return "";
    const quadrantCoordinates = getQuadrantCoordinates(
      polyData,
      index,
      padding,
      currentAspectRatio,
      SVG_WIDTH,
      SVG_HEIGHT,
    );
    return convertToSVGPath(quadrantCoordinates);
  });

  const handlePathClick = (index: number) => {
    setSelectedActivityIndex(index);
    const activity = selectedActivities[index];
    if (activity) {
      setIsModalVisible(true);
    } else {
      setIsAddModalVisible(true);
    }
  };

  const deleteActivity = (index: number) => {
    const newActivities = [...selectedActivities];
    newActivities[index] = null;
    setSelectedActivities(newActivities);
    setIsModalVisible(false);
  };

  const addActivity = (index: number, activity: FlattenedActivity) => {
    const newActivities = [...selectedActivities];
    newActivities[index] = activity;
    setSelectedActivities(newActivities);
    setIsAddModalVisible(false);
  };

  useEffect(() => {
    setSelectedActivities(activitiesWithGPS.slice(0, MAX_ACTIVITIES));
  }, [currentAspectRatio]);

  return (
    <div className="m-4 space-y-4">
      {/* CANVAS */}
      <div className="min-w-[300px] border text-center shadow-lg sm:min-w-[800px]">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill={backgroundColor} />

          {Array.from({ length: MAX_ACTIVITIES }).map((_, index) => {
            const row = Math.floor(index / currentAspectRatio.cols);
            const col = index % currentAspectRatio.cols;
            const quadrantWidth =
              (SVG_WIDTH - padding * (currentAspectRatio.cols + 1)) /
              currentAspectRatio.cols;
            const quadrantHeight =
              (SVG_HEIGHT - padding * (currentAspectRatio.rows + 1)) /
              currentAspectRatio.rows;
            const x = col * (quadrantWidth + padding) + padding;
            const y = row * (quadrantHeight + padding) + padding;

            return (
              <g key={index} onClick={() => handlePathClick(index)}>
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
                {selectedActivities[index] === null && (
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
      </div>

      {/* MODALS */}
      {isModalVisible &&
        selectedActivityIndex !== null &&
        selectedActivities[selectedActivityIndex] && (
          <ActivityModal
            activity={selectedActivities[selectedActivityIndex]!}
            onClose={() => setIsModalVisible(false)}
            onDelete={() => deleteActivity(selectedActivityIndex)}
          />
        )}

      {isAddModalVisible && (
        <AddActivityModal
          activities={activitiesWithGPS}
          onAdd={(activity) => {
            typeof selectedActivityIndex === "number" &&
              addActivity(selectedActivityIndex, activity);
          }}
          onClose={() => setIsAddModalVisible(false)}
        />
      )}

      {/* CONTROLS */}
      <div className="border bg-white shadow-lg">
        {/* ASPECT RATIOS */}
        <div className="flex-col space-y-1 p-4 sm:p-6">
          <p className="text-left font-semibold ">Aspect Ratios</p>
          <div className="grid grid-cols-4 gap-4">
            {aspectRatios.map((ratio, index) => {
              // Check if this ratio is the current one.
              const isActive =
                currentAspectRatio.rows === ratio.rows &&
                currentAspectRatio.cols === ratio.cols;

              const className = isActive
                ? "bg-indigo-600 text-white hover:text-gray-900"
                : "";

              return (
                <Button
                  key={index}
                  onClick={() => setCurrentAspectRatio(ratio)}
                  // Apply the 'bg-red-100' class if active, otherwise a different class or none.
                  className={className}
                >
                  {`${ratio.cols}x${ratio.rows}`}
                </Button>
              );
            })}
          </div>
        </div>

        <hr />

        <div className="grid grid-cols-2 flex-col gap-4 p-4 sm:p-6">
          {/* Stroke Width */}
          <div className="flex-col space-y-1">
            <p className="text-left font-semibold ">Stroke</p>
            <input
              className="w-full rounded-md border border-gray-200 px-4 py-2 text-center font-semibold"
              type="number"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              min="3"
              max="10"
            />
          </div>

          {/* Padding */}
          <div className="flex-col space-y-1">
            <p className="text-left font-semibold ">Padding</p>
            <input
              className="w-full rounded-md border border-gray-200 px-4 py-2 text-center font-semibold"
              type="number"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              min="5"
              max="50"
            />
          </div>

          {/* Background Color */}
          <div className="flex-col space-y-1">
            <p className="text-left font-semibold">Background Color</p>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-12 w-full cursor-pointer rounded-md border border-gray-200 bg-white px-2 py-1 text-center font-semibold"
            />
          </div>

          {/* Stroke Color */}
          <div className="flex-col space-y-1">
            <p className="text-left font-semibold">Stroke Color</p>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="h-12 w-full cursor-pointer rounded-md border border-gray-200 bg-white px-2 py-1 text-center font-semibold"
            />
          </div>
        </div>

        <hr />

        {/* ACTIONS */}
        <div className="flex-col space-y-1 p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={shuffleActivities} className="w-full">
              <BiShuffle className="mr-2 inline-block h-5 w-5 sm:h-6 sm:w-6" />{" "}
              Shuffle
            </Button>
            <Button className="w-full">
              <BsEyeFill className="mr-2 inline-block h-5 w-5 sm:h-6 sm:w-6" />{" "}
              Preview
            </Button>
            <Button onClick={() => handleDownload(svgRef)} className="w-full">
              <AiOutlineDownload className="mr-2 inline-block h-5 w-5 sm:h-6 sm:w-6" />{" "}
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
