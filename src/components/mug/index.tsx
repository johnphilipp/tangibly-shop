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

  const [freeText, setFreeText] = useState("");
  const [metricText, setMetricText] = useState("");

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

  const handleFreeTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFreeText(e.target.value);
  };

  const handleMetricTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetricText(e.target.value);
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
    // Check if selectedYears array is not empty
    if (selectedYears.length > 0) {
      const year = selectedYears.length === 1 ? selectedYears[0] : "Years";
      const numActivities = selectedActivities.length;

      if (session?.user?.name) {
        setFreeText(`${session.user.name.split(" ")[0]}'s ${year} Wrapped`);
      } else {
        setFreeText(`Your ${year} Wrapped`);
      }

      setMetricText(`${numActivities} Activities`);
    } else {
      // If selectedYears is empty, set freeText to a default or blank value
      setFreeText("");
      setMetricText("");
    }
  }, [selectedYears, session?.user?.name, selectedActivities]);

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

        <hr />
        <div className="grid grid-cols-2 flex-col gap-4 p-4 sm:p-6">
          {/* Primary Text */}
          <div className="flex-col space-y-1">
            <label className="text-left font-semibold">Primary Text</label>
            <input
              type="text"
              value={freeText}
              onChange={handleFreeTextChange}
              className="focus:shadow-outline w-full rounded border border-gray-200 px-3 py-2 leading-tight text-gray-700 focus:outline-none"
            />
          </div>

          {/* Secondary Text */}
          <div className="flex-col space-y-1">
            <label className="text-left font-semibold">Secondary Text</label>
            <input
              type="text"
              value={metricText}
              onChange={handleMetricTextChange}
              className="focus:shadow-outline w-full rounded border border-gray-200 px-3 py-2 leading-tight text-gray-700 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
