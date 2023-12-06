import React, { useState, useEffect, useMemo, useRef } from "react";
import { useData } from "~/contexts/DataContext";
import SVGCanvas from "./canvas/SVGCanvas";
import ActivityTypeSelector from "./selectors/ActivityTypeSelector";
import { useSession } from "next-auth/react";
import type { Activity } from "@prisma/client";
import YearSelector from "./selectors/YearSelector";
import StrokeColorSelector from "./selectors/StrokeColorSelector";
import TextSelector from "./selectors/TextSelector";
import Button from "../Button";
import WarningBanner from "../WarningBanner";
import ToggleTextDisplay from "./selectors/ToggleTextDisplay";
import { InterestedModal } from "./modals/InterestedModal";
import { getSVGBase64 } from "./utils/getSVGBase64";
import { BiMailSend } from "react-icons/bi";
import MugColorSelector from "./selectors/MugColorSelector";

const getActivitiesWithGPS = (activities: Activity[]): Activity[] =>
  activities.filter((activity) => activity.summaryPolyline);

const getUniqueSportTypes = (activities: Activity[]): string[] =>
  activities.reduce<string[]>((acc, activity) => {
    if (!acc.includes(activity.sport_type)) acc.push(activity.sport_type);
    return acc;
  }, []);

export default function Heatmap({ isLoading }: { isLoading: boolean }) {
  const { activities } = useData();
  const { data: session } = useSession();
  const svgRef = useRef<SVGSVGElement>(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [selectedYears, setSelectedYears] = useState<number[]>([
    new Date().getFullYear(),
  ]);
  const [useText, setUseText] = useState(true);
  const [primaryText, setPrimaryText] = useState("");
  const [secondaryText, setSecondaryText] = useState("");
  const [isInterestedModalVisible, setIsInterestedModalVisible] =
    useState(false);

  const availableYears = useMemo(() => {
    const years = new Set(
      activities.map((activity) =>
        new Date(activity.start_date_local).getFullYear(),
      ),
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [activities]);

  const activitiesFilteredByYears = useMemo(
    () =>
      activities.filter((activity) =>
        selectedYears.includes(
          new Date(activity.start_date_local).getFullYear(),
        ),
      ),
    [activities, selectedYears],
  );

  const activitiesWithGPS = useMemo(
    () => getActivitiesWithGPS(activitiesFilteredByYears),
    [activitiesFilteredByYears],
  );

  const sportTypes = useMemo(
    () => getUniqueSportTypes(activitiesWithGPS),
    [activitiesWithGPS],
  );

  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>(
    [],
  );
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Once sportTypes is populated, set all as selected
    setSelectedActivityTypes(sportTypes);
  }, [sportTypes]);

  useEffect(() => {
    // Once selectedActivityTypes is populated, filter activitiesWithGPS to get selectedActivities
    setSelectedActivities(
      activitiesWithGPS.filter((activity) =>
        selectedActivityTypes.includes(activity.sport_type),
      ),
    );
  }, [selectedActivityTypes, activitiesWithGPS]);

  useEffect(() => {
    // Check if selectedYears array is not empty, otherwise -Infinity bug
    if (selectedActivities.length === 0 || selectedYears.length === 0) return;
    const yearText = selectedYears.length === 1 ? selectedYears[0] : "Years";
    const userName = `${session?.user?.name?.split(" ")[0]}'s` ?? "Your";
    setPrimaryText(`${userName} ${yearText} Wrapped`);
    setSecondaryText(`${selectedActivities.length} Activities`);
  }, [selectedYears, session?.user?.name, selectedActivities]);

  const handleToggleActivityType = (sportType: string) => {
    setSelectedActivityTypes((prev) =>
      prev.includes(sportType)
        ? prev.filter((type) => type !== sportType)
        : [...prev, sportType],
    );
  };

  const handleYearChange = (year: number) => {
    setSelectedYears((prevYears) =>
      prevYears.includes(year)
        ? prevYears.filter((y) => y !== year)
        : [...prevYears, year],
    );
  };

  const handlePrimaryTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryText(e.target.value);
  };

  const handleSecondaryTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSecondaryText(e.target.value);
  };

  const handleColorChange = (newColor: string) => {
    // Check if the new color is black and the current stroke color is black
    if (newColor === "#000000" && strokeColor === "#000000") {
      setStrokeColor("#ffffff");
    }
    // Check if the new color is white and the current stroke color is white
    else if (newColor === "#ffffff" && strokeColor === "#ffffff") {
      setStrokeColor("#000000");
    }
    // Update the background color
    setBackgroundColor(newColor);
  };

  return (
    <div className="m-4 sm:m-6">
      <h1 className="mt-4 text-2xl font-bold sm:mt-6 sm:text-4xl">
        Create Your Own Mug
      </h1>

      {selectedActivities.length > 200 && (
        <WarningBanner
          title="Warning"
          text="Selecting >200 activities makes for a tough print"
        />
      )}

      {isInterestedModalVisible && (
        <InterestedModal
          onClose={() => setIsInterestedModalVisible(false)}
          svg={getSVGBase64(svgRef) ?? ""}
        />
      )}

      {/* Sticky SVGCanvas */}
      <div className="sticky top-0 z-10 my-4 text-center sm:my-6">
        <div className="bg-white shadow-2xl">
          <SVGCanvas
            activities={selectedActivities}
            backgroundColor={backgroundColor}
            strokeColor={strokeColor}
            useText={useText}
            primaryText={primaryText}
            secondaryText={secondaryText}
            svgRef={svgRef}
          />
        </div>
      </div>

      {!isLoading && (
        <div className="flex w-full gap-4 sm:gap-6">
          {/* <Button className="flex w-full items-center justify-center bg-blue-600 text-white shadow-lg hover:bg-blue-800">
            <BsCupFill
              className="mr-2 inline-block h-6 w-6"
              aria-hidden="true"
            />
            Visualize
          </Button> */}

          <Button
            onClick={() => setIsInterestedModalVisible(true)}
            className="flex w-full items-center justify-center bg-purple-600 text-white shadow-lg hover:bg-purple-700"
          >
            <BiMailSend
              className="mr-2 inline-block h-6 w-6"
              aria-hidden="true"
            />
            Pre-order
          </Button>

          {/* <Button className="flex w-full items-center justify-center bg-purple-600 text-white shadow-lg hover:bg-purple-700">
            <ShoppingCartIcon
              className="mr-2 inline-block h-6 w-6"
              aria-hidden="true"
            />
            Checkout
          </Button> */}
        </div>
      )}

      {/* Right-side selectors */}
      {!isLoading && (
        <div className="mt-4 grid gap-4 border bg-white p-4 shadow-lg sm:mt-6 sm:p-6 lg:col-span-1">
          <YearSelector
            availableYears={availableYears}
            selectedYears={selectedYears}
            onSelectYear={handleYearChange}
          />

          <ActivityTypeSelector
            sportTypes={sportTypes}
            selectedActivityTypes={selectedActivityTypes}
            onToggleActivityType={handleToggleActivityType}
          />

          <div className="flex space-x-4 sm:space-x-6">
            <MugColorSelector
              label="Mug Base Color"
              onColorChange={handleColorChange}
            />

            <StrokeColorSelector
              label="Stroke Color"
              color={strokeColor}
              onColorChange={(e) => setStrokeColor(e.target.value)}
            />
          </div>

          <ToggleTextDisplay useText={useText} setUseText={setUseText} />

          <TextSelector
            label="Primary Text"
            text={primaryText}
            onTextChange={handlePrimaryTextChange}
          />

          <TextSelector
            label="Secondary Text"
            text={secondaryText}
            onTextChange={handleSecondaryTextChange}
          />
        </div>
      )}
    </div>
  );
}