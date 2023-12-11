import React, { useState, useEffect, useMemo, useRef } from "react";
import { useData } from "~/contexts/DataContext";
import SVGCanvas from "./canvas/SVGCanvas";
import ActivityTypeSelector from "../shared/selectors/ActivityTypeSelector";
import { useSession } from "next-auth/react";
import type { Activity, Collage } from "@prisma/client";
import YearSelector from "../shared/selectors/YearSelector";
import StrokeColorSelector from "../shared/selectors/StrokeColorSelector";
import TextSelector from "../shared/selectors/TextSelector";
import ToggleTextDisplay from "../shared/selectors/ToggleTextDisplay";
import MugColorSelector from "../shared/selectors/MugColorSelector";
import { api } from "~/utils/api";
import { useSearchParams } from "next/navigation";
import { getSVGBase64 } from "~/utils/getSVGBase64";
import { PreviewButton } from "../shared/actions/PreviewButton";
import { CheckoutButton } from "../shared/actions/CheckoutButton";
import { getSVGDataURL } from "~/utils/getSVGDataURL";
import Overlay from "../3d/Overlay";

const getUniqueSportTypes = (activities: Activity[]): string[] =>
  activities.reduce<string[]>((acc, activity) => {
    if (!acc.includes(activity.sport_type)) acc.push(activity.sport_type);
    return acc;
  }, []);

export default function Heatmap({ isLoading }: { isLoading: boolean }) {
  const { activities } = useData();
  const { data: session } = useSession();
  const svgRef = useRef<SVGSVGElement>(null);
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [useText, setUseText] = useState(true);
  const [primaryText, setPrimaryText] = useState("");
  const [secondaryText, setSecondaryText] = useState("");

  const [currentDesign, setCurrentDesign] = useState<Collage>();
  const { activeDesign, setActiveDesign } = useData();

  const searchParams = useSearchParams();
  const user = useSession().data?.user;

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
      activities.filter(
        (activity) =>
          new Date(activity.start_date_local).getFullYear() === selectedYear,
      ),
    [activities, selectedYear],
  );

  const sportTypes = useMemo(
    () => getUniqueSportTypes(activitiesFilteredByYears),
    [activitiesFilteredByYears],
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
      activitiesFilteredByYears.filter((activity) =>
        selectedActivityTypes.includes(activity.sport_type),
      ),
    );
  }, [activitiesFilteredByYears, selectedActivityTypes, activeDesign]);

  useEffect(() => {
    if (secondaryText || primaryText) return;

    const totalMovingTime = Math.round(
      selectedActivities.reduce(
        (acc, activity) => acc + activity.moving_time,
        0,
      ) /
        60 /
        60,
    );
    // Check if selectedYears array is not empty, otherwise -Infinity bug
    if (selectedActivities.length === 0) return;
    const userName = `${session?.user?.name?.split(" ")[0]}'s` ?? "Your";
    setPrimaryText(`${userName} ${selectedYear} Wrapped`);
    setSecondaryText(`Total moving time: ${totalMovingTime} hours`);
  }, [
    selectedYear,
    session?.user?.name,
    selectedActivities,
    secondaryText,
    primaryText,
  ]);

  const handleToggleActivityType = (sportType: string) => {
    setSelectedActivityTypes((prev) =>
      prev.includes(sportType)
        ? prev.filter((type) => type !== sportType)
        : [...prev, sportType],
    );
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
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

  const saveDesign = api.design.saveCollage.useMutation();

  const designId = searchParams.get("designId");

  const handleSaveDesignData = async () => {
    if (!user) return;

    await saveDesign.mutateAsync({
      id: Number(designId) ?? 0,
      activityTypes: selectedActivityTypes.join(","),
      backgroundColor: backgroundColor,
      strokeColor: strokeColor,
      previewSvg: getSVGBase64(svgRef) ?? "",
      primaryText: primaryText,
      secondaryText: secondaryText,
      useText: useText,
      name: activeDesign?.name ?? "Untitled-1",
    });
  };

  const { data: fetchedDesign } = api.design.getCollage.useQuery(
    { id: Number(designId) },
    {
      enabled: user !== undefined,
    },
  );

  useEffect(() => {
    if (!fetchedDesign || currentDesign) return;

    const foundDesign = fetchedDesign.design;

    if (foundDesign) {
      setBackgroundColor(foundDesign.Design.backgroundColor);
      setStrokeColor(foundDesign.Design.strokeColor);
      setCurrentDesign(foundDesign);
      setUseText(foundDesign.useText);
      setPrimaryText(foundDesign.primaryText);
      setSecondaryText(foundDesign.secondaryText);

      setActiveDesign({
        id: foundDesign.id,
        name: foundDesign.Design.name,
        designId: foundDesign.Design.id,
      });
    } else {
      // Handle the case where the design is not found
      console.error("Design not found");
    }
  }, [
    activities,
    currentDesign,
    fetchedDesign,
    setActiveDesign,
    selectedActivities,
  ]);

  return (
    <div className="m-4 sm:m-6">
      <h1 className="mt-4 text-2xl sm:mt-6 sm:text-4xl">
        Create Your <span className="font-bold">Heatmap Mug</span>
      </h1>

      {/* Floating Save Button */}
      <button
        onClick={handleSaveDesignData}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-green-500 p-3 text-lg text-white shadow-lg hover:bg-green-600 focus:outline-none"
      >
        Save
      </button>

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
          <PreviewButton onClick={() => setOverlayOpen(true)} />
          <CheckoutButton onClick={() => void 0} />
        </div>
      )}

      {/* Right-side selectors */}
      {!isLoading && (
        <div className="mt-4 grid gap-4 border bg-white p-4 shadow-lg sm:mt-6 sm:p-6 lg:col-span-1">
          <YearSelector
            availableYears={availableYears}
            selectedYears={[selectedYear]}
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

          <Overlay
            svgDataURL={svgRef.current ? getSVGDataURL(svgRef) : ""}
            isOpen={isOverlayOpen}
            onClose={() => setOverlayOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
