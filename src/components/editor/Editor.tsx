import React, { useRef, useState } from "react";
import Layout from "~/components/Layout";
import { handleDownload } from "./utils/handleDownload";
import { convertToSVGPath } from "./utils/convertToSVGPath";
import { getQuadrantCoordinates } from "./utils/getQuadrantCoordinates";
import { AddActivityModal } from "./AddActivityModal";
import { ActivityModal } from "./ActivityModal";
import type { FlattenedActivity } from "~/server/api/routers/activities";
import Button from "../Button";
import { AiOutlineDownload } from "react-icons/ai";
import { BiShuffle } from "react-icons/bi";
import { BsEyeFill } from "react-icons/bs";

export const SVG_WIDTH = 1000;
export const SVG_HEIGHT = 500;
const MAX_ACTIVITIES = 50;

export default function Editor({
  activities,
}: {
  activities: FlattenedActivity[];
}) {
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

  return (
    <div className="m-4">
      {/* CANVAS */}
      <div className="min-w-[300px] border text-center shadow-lg sm:min-w-[800px]">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="white" />

          {Array.from({ length: MAX_ACTIVITIES }).map((_, index) => {
            const row = Math.floor(index / 10);
            const col = index % 10;
            const quadrantWidth = (SVG_WIDTH - padding * 11) / 10;
            const quadrantHeight = (SVG_HEIGHT - padding * 6) / 5;
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
              stroke="black"
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

      {/* ACTIONS */}
      <div className="mt-4 flex-col space-y-4 border bg-white p-4 shadow-lg sm:p-6">
        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Button onClick={shuffleActivities} className="w-full">
              <BiShuffle className="mr-2 inline-block h-8 w-8" />
            </Button>
            <Button className="w-full">
              <BsEyeFill className="mr-2 inline-block h-8 w-8" />
            </Button>
            <Button onClick={() => handleDownload(svgRef)} className="w-full">
              <AiOutlineDownload className="mr-2 inline-block h-8 w-8" />
            </Button>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="mt-4 grid grid-cols-2 flex-col gap-4 border bg-white p-4 shadow-lg sm:p-6">
        {/* Stroke Width */}
        <div className="flex-col space-y-1">
          <p className="text-left font-semibold ">Stroke Width</p>
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
      </div>
    </div>
  );
}
