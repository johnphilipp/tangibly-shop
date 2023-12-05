import React, { useState, useEffect, useMemo, useRef } from "react";
import { useData } from "~/contexts/DataContext";
import SVGCanvas from "./SVGCanvas";
import ActivityTypeSelector from "./selectors/ActivityTypeSelector";
import { useSession } from "next-auth/react";
import type { Activity } from "@prisma/client";
import YearSelector from "./selectors/YearSelector";
import ColorSelector from "./selectors/ColorSelector";
import TextSelector from "./selectors/TextSelector";

const getActivitiesWithGPS = (activities: Activity[]): Activity[] =>
  activities.filter((activity) => activity.summaryPolyline);

const getUniqueSportTypes = (activities: Activity[]): string[] =>
  activities.reduce<string[]>((acc, activity) => {
    if (!acc.includes(activity.sport_type)) acc.push(activity.sport_type);
    return acc;
  }, []);

export default function Mug() {
  const { activities } = useData();
  const { data: session } = useSession();
  const svgRef = useRef<SVGSVGElement>(null);

  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [selectedYears, setSelectedYears] = useState<number[]>([
    new Date().getFullYear(),
  ]);

  const availableYears = useMemo(() => {
    const years = new Set(
      activities.map((activity) =>
        new Date(activity.start_date_local).getFullYear(),
      ),
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [activities]);

  const [primaryText, setPrimaryText] = useState("");
  const [secondaryText, setSecondaryText] = useState("");

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

  // Initially set selectedActivityTypes as an empty array
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>(
    [],
  );

  // Set selectedActivities based on selectedActivityTypes
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);

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
    if (selectedYears.length > 0) {
      const year = selectedYears.length === 1 ? selectedYears[0] : "Years";
      const numActivities = selectedActivities.length;

      if (session?.user?.name) {
        setPrimaryText(`${session.user.name.split(" ")[0]}'s ${year} Wrapped`);
      } else {
        setPrimaryText(`Your ${year} Wrapped`);
      }

      setSecondaryText(`${numActivities} Activities`);
    } else {
      // If selectedYears is empty, set freeText to a default or blank value
      setPrimaryText("");
      setSecondaryText("");
    }
  }, [selectedYears, session?.user?.name, selectedActivities]);

  return (
    <div className="m-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* SVG Canvas */}
          <div className="bg-white text-center shadow-lg">
            <SVGCanvas
              activities={selectedActivities}
              backgroundColor={backgroundColor}
              strokeColor={strokeColor}
              freeText={primaryText}
              metricText={secondaryText}
              svgRef={svgRef}
            />
          </div>
        </div>

        {/* Right-side Selectors */}
        <div className="grid gap-4 border bg-white p-4 shadow-lg sm:p-6 lg:col-span-1">
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

          <ColorSelector
            label="Background Color"
            color={backgroundColor}
            onColorChange={(e) => setBackgroundColor(e.target.value)}
          />

          <ColorSelector
            label="Stroke Color"
            color={strokeColor}
            onColorChange={(e) => setStrokeColor(e.target.value)}
          />

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
      </div>
    </div>
  );
}
