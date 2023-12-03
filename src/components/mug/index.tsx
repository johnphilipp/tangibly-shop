import React, { useState, useEffect, useMemo, useRef } from "react";
import { useData } from "~/contexts/DataContext";
import SVGCanvas from "./SVGCanvas";
import ActivityTypeSelector from "./ActivityTypeSelector";
import { useSession } from "next-auth/react";
import type { Activity } from "@prisma/client";
import YearSelector from "./YearSelector";

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
  const [metricText, setMetricText] = useState("Activities");
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

  const newestYear = useMemo(
    () => Math.max(...availableYears),
    [availableYears],
  );

  const [freeText, setFreeText] = useState(`Your ${newestYear} Wrapped`);

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

  useEffect(() => {
    // Once sportTypes is populated, set all as selected
    setSelectedActivityTypes(sportTypes);
  }, [sportTypes]);

  useEffect(() => {
    setSelectedActivities(
      activitiesWithGPS.filter((activity) =>
        selectedActivityTypes.includes(activity.sport_type),
      ),
    );
  }, [selectedActivityTypes, activitiesWithGPS]);

  useEffect(() => {
    const metricText =
      selectedYears.length === 1 ? `${selectedYears[0]} Wrapped` : "Wrap";

    if (session?.user?.name) {
      setFreeText(`${session.user.name.split(" ")[0]}'s ${metricText}`);
    } else {
      setFreeText(`Your ${metricText}`);
    }
  }, [selectedYears, session?.user?.name]);

  return (
    <div className="m-4 space-y-4">
      <div className="min-w-[300px] bg-white text-center shadow-lg sm:min-w-[800px]">
        <SVGCanvas
          activities={selectedActivities}
          backgroundColor={backgroundColor}
          strokeColor={strokeColor}
          freeText={freeText}
          metricText={metricText}
          svgRef={svgRef}
        />
      </div>

      <div className="border bg-white shadow-lg">
        <YearSelector
          availableYears={availableYears}
          selectedYears={selectedYears}
          onSelectYear={handleYearChange}
        />

        <hr />

        <ActivityTypeSelector
          sportTypes={sportTypes}
          selectedActivityTypes={selectedActivityTypes}
          onToggleActivityType={handleToggleActivityType}
        />

        <hr />

        <div className="grid grid-cols-2 flex-col gap-4 p-4 sm:p-6">
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
      </div>
    </div>
  );
}
