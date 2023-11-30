import type { Activity } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { AiOutlineDownload } from "react-icons/ai";
import { BsEmojiHeartEyes, BsEyeFill } from "react-icons/bs";
import Overlay from "~/components/3d/Overlay";
import { InterestedModal } from "~/components/editor/InterestedModal";
import { useData } from "~/contexts/DataContext";
import Button from "../Button";
import { ActivityModal } from "./ActivityModal";
import ActivityTypeSelector from "./ActivityTypeSelector";
import { AddActivityModal } from "./AddActivityModal";
import { DownloadModal } from "./DownloadModal";
import SVGCanvas, { MAX_ACTIVITIES } from "./SVGCanvas";
import { useActivityTypes } from "./utils/useActivityTypes";

export default function Mug() {
  const { activities } = useData();

  // State hooks
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(8);
  const [padding, setPadding] = useState(20);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<
    number | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isInterestedModalVisible, setIsInterestedModalVisible] =
    useState(false);
  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);

  // Custom hooks
  const {
    activitiesWithGPS,
    sportTypes,
    selectedActivityTypes,
    setSelectedActivityTypes,
  } = useActivityTypes(activities);

  const [selectedActivities, setSelectedActivities] = useState<
    (Activity | null)[]
  >(activitiesWithGPS.slice(0, MAX_ACTIVITIES));

  // Handlers
  const handleClickActivity = (index: number) => {
    setSelectedActivityIndex(index);
    const activity = selectedActivities[index];
    if (activity) {
      setIsModalVisible(true);
    } else {
      setIsAddModalVisible(true);
    }
  };

  const handleDeleteActivity = (index: number) => {
    const newActivities = [...selectedActivities];
    newActivities[index] = null;
    setSelectedActivities(newActivities);
    setIsModalVisible(false);
  };

  const handleAddActivity = (index: number, activity: Activity) => {
    const newActivities = [...selectedActivities];
    newActivities[index] = activity;
    setSelectedActivities(newActivities);
    setIsAddModalVisible(false);
  };

  const handleToggleActivityType = (sportType: string) => {
    setSelectedActivityTypes((prevSelectedActivityTypes) => {
      if (prevSelectedActivityTypes.includes(sportType)) {
        return prevSelectedActivityTypes.filter((type) => type !== sportType);
      } else {
        return [...prevSelectedActivityTypes, sportType];
      }
    });
  };

  const getSVGDataURL = () => {
    const svgNode = svgRef.current;
    if (!svgNode) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgNode);

    // Create a Blob from the SVG data
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });

    // Create and return the object URL
    return URL.createObjectURL(svgBlob);
  };

  const getSVGBase64 = () => {
    const svgNode = svgRef.current;
    if (!svgNode) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgNode);

    // Convert to Base64
    const base64 = btoa(unescape(encodeURIComponent(svgString)));

    return base64;
  };

  // Hooks
  useEffect(() => {
    const newSportTypes = activitiesWithGPS.reduce<string[]>(
      (acc, activity) => {
        if (!acc.includes(activity.sport_type)) {
          acc.push(activity.sport_type);
        }
        return acc;
      },
      [],
    );

    setSelectedActivityTypes(newSportTypes);
  }, [activitiesWithGPS, setSelectedActivityTypes]);

  useEffect(() => {
    // Filter activities based on the selected activity types
    const filteredActivities = activitiesWithGPS.filter((activity) =>
      selectedActivityTypes.includes(activity.sport_type),
    );

    setSelectedActivities(filteredActivities.slice(0, MAX_ACTIVITIES));
  }, [activities, activitiesWithGPS, selectedActivityTypes]);

  return (
    <div className="m-4 space-y-4">
      {/* CANVAS */}
      <div className="min-w-[300px] bg-white text-center shadow-lg sm:min-w-[800px]">
        <SVGCanvas
          activities={selectedActivities}
          backgroundColor={backgroundColor}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          padding={padding}
          svgRef={svgRef}
          onClickActivity={handleClickActivity}
        />
      </div>

      {/* CONTROLS */}
      <div className="border bg-white shadow-lg">
        <ActivityTypeSelector
          sportTypes={sportTypes}
          selectedActivityTypes={selectedActivityTypes}
          onToggleActivityType={handleToggleActivityType}
        />

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
            <Button className="w-full" onClick={() => setOverlayOpen(true)}>
              <BsEyeFill className="mr-2 inline-block h-5 w-5 sm:h-6 sm:w-6" />{" "}
              <span className="hidden sm:block">Preview</span>
            </Button>
            <Button
              onClick={() => setIsDownloadModalVisible(true)}
              className="w-full"
            >
              <AiOutlineDownload className="mr-2 inline-block h-5 w-5 sm:h-6 sm:w-6" />{" "}
              <span className="hidden sm:block">Download</span>
            </Button>
            <Button
              onClick={() => setIsInterestedModalVisible(true)}
              className="w-full bg-gray-900 text-white hover:bg-gray-700"
            >
              <BsEmojiHeartEyes className="mr-2 inline-block h-5 w-5 sm:h-6 sm:w-6" />{" "}
              <span className="hidden sm:block">I am interested</span>
            </Button>
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      <Overlay
        svgDataURL={getSVGDataURL() ?? ""}
        isOpen={isOverlayOpen}
        onClose={() => setOverlayOpen(false)}
      />

      {/* MODALS */}
      {isModalVisible &&
        selectedActivityIndex !== null &&
        selectedActivities[selectedActivityIndex] && (
          <ActivityModal
            activity={selectedActivities[selectedActivityIndex]!}
            onClose={() => setIsModalVisible(false)}
            onDelete={() => handleDeleteActivity(selectedActivityIndex)}
          />
        )}

      {isDownloadModalVisible && (
        <DownloadModal
          onClose={() => setIsDownloadModalVisible(false)}
          svg={getSVGBase64() ?? ""}
        />
      )}

      {isInterestedModalVisible && (
        <InterestedModal
          onClose={() => setIsInterestedModalVisible(false)}
          svg={getSVGBase64() ?? ""}
        />
      )}

      {isAddModalVisible && (
        <AddActivityModal
          activities={activitiesWithGPS}
          onAdd={(activity) => {
            typeof selectedActivityIndex === "number" &&
              handleAddActivity(selectedActivityIndex, activity);
          }}
          onClose={() => setIsAddModalVisible(false)}
        />
      )}
    </div>
  );
}
