import React, { useRef, useState } from "react";
import Layout from "~/components/Layout";
import { handleDownload } from "./utils/handleDownload";
import { convertToSVGPath } from "./utils/convertToSVGPath";
import { getQuadrantCoordinates } from "./utils/getQuadrantCoordinates";
import { AddActivityModal } from "./AddActivityModal";
import { ActivityModal } from "./ActivityModal";
import type { FlattenedActivity } from "~/server/api/routers/activities";
import Button from "../Button";

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
    <>
      <div className="min-w-[300px] text-center sm:min-w-[800px]">
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

        <div className="mt-4 grid grid-cols-3 items-center gap-4">
          <div className="col-span-1">
            <p className="text-left font-semibold ">Stroke Width</p>
          </div>
          <div className="col-span-2">
            <input
              className="w-full rounded-full bg-white/10 px-4 py-3 text-center font-semibold "
              type="number"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              min="3"
              max="10"
            />
          </div>

          <div className="col-span-1">
            <p className="text-left font-semibold ">Padding</p>
          </div>
          <div className="col-span-2">
            <input
              className="w-full rounded-full bg-white/10 px-4 py-3 text-center font-semibold "
              type="number"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              min="5"
              max="50"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Button onClick={shuffleActivities} className="w-full">
            shuffle
          </Button>
          <Button className="w-full">
            {/* ideally as a popup, which spins nicely, maybe with option to zoom */}
            visualize
          </Button>
          <Button onClick={() => handleDownload(svgRef)} className="w-full">
            {/* maybe remove this once visualization is done */}
            download
          </Button>
        </div>
      </div>
    </>
  );
}
