import React, { useState, useEffect, useMemo, useRef } from "react";
import { useData } from "~/contexts/DataContext";
import SVGCanvas from "./canvas/SVGCanvas";
import ActivityTypeSelector from "../../shared/selectors/ActivityTypeSelector";
import { useSession } from "next-auth/react";
import type { Activity, Design } from "@prisma/client";
import type { Collage } from "@prisma/client";
import YearSelector from "../../shared/selectors/YearSelector";
import StrokeColorSelector from "../../shared/selectors/StrokeColorSelector";
import TextSelector from "../../shared/selectors/TextSelector";
import WarningBanner from "../../WarningBanner";
import ToggleTextDisplay from "../../shared/selectors/ToggleTextDisplay";
import MugColorSelector from "../../shared/selectors/MugColorSelector";
import { api } from "~/utils/api";
import { useSearchParams } from "next/navigation";
import Overlay from "../../3d/Overlay";
import { getSVGDataURL } from "../../../utils/getSVGDataURL";
import { getSVGBase64 } from "~/utils/getSVGBase64";
import { PreviewButton } from "../../shared/actions/PreviewButton";
import { CheckoutButton } from "../../shared/actions/CheckoutButton";
import { ActivityModal } from "~/components/shared/modals/ActivityModal";
import { SaveButton } from "~/components/shared/actions/SaveButton";
import DesignName from "~/components/DesignName";

const getActivitiesWithGPS = (activities: Activity[]): Activity[] =>
  activities.filter((activity) => activity.summaryPolyline);

const getUniqueSportTypes = (activities: Activity[]): string[] =>
  activities.reduce<string[]>((acc, activity) => {
    if (!acc.includes(activity.sport_type)) acc.push(activity.sport_type);
    return acc;
  }, []);

export default function CollageMug({ isLoading }: { isLoading: boolean }) {
  const { activities } = useData();
  const { data: session } = useSession();

  const svgRef = useRef<SVGSVGElement>(null);
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<
    number | null
  >(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");

  const [useText, setUseText] = useState(true);
  const [primaryText, setPrimaryText] = useState("");
  const [secondaryText, setSecondaryText] = useState("");

  const [currentCollage, setCurrentCollage] = useState<Collage>();
  const [currentDesign, setCurrentDesign] = useState<Design>();
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

  const [selectedYears, setSelectedYears] = useState<number[]>(
      [availableYears[0] ?? new Date().getFullYear()]
  );

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
    const user =
      session?.user?.name === undefined ? "Your" : session?.user?.name;
    const userName = user === "Your" ? user : user?.split(" ")[0] + "'s";
    setPrimaryText(`${userName} ${yearText} Wrapped`);
    setSecondaryText(`${selectedActivities.length} Activities`);
  }, [selectedYears, session?.user?.name, selectedActivities]);

  const handleToggleActivityType = (sportType: string) => {
    setSelectedActivityTypes((prev) =>
      prev.includes(sportType)
        ? prev.filter((type) => type !== sportType)
        : [...prev, sportType],
    );

    handleSaveDesignData();
  };

  const handleYearChange = (year: number) => {
    setSelectedYears((prevYears) => {
      if (prevYears.includes(year)) {
        // Remove the year if it's already selected
        return prevYears.filter((y) => y !== year);
      } else {
        // Add the year if it's not already selected
        return [...prevYears, year];
      }
    });

    handleSaveDesignData();
  };

  const handlePrimaryTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryText(e.target.value);

    handleSaveDesignData();
  };

  const handleSecondaryTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSecondaryText(e.target.value);

    handleSaveDesignData();
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

    handleSaveDesignData();
  };

  const handleClickActivity = (index: number) => {
    setSelectedActivityIndex(index);
    const activity = selectedActivities[index];
    if (activity) {
      setIsModalVisible(true);
    }

    handleSaveDesignData();
  };

  const handleDeleteActivity = (index: number) => {
    setSelectedActivities((prev) => {
      const newActivities = [...prev];
      newActivities.splice(index, 1);
      return newActivities;
    });
    setIsModalVisible(false);

    handleSaveDesignData();
  };

  const saveDesign = api.design.saveCollage.useMutation();

  const designId = searchParams.get("designId");

  const handleSaveDesignData = () => {
    if (!user) return;

    void saveDesign.mutateAsync({
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
      enabled: user !== undefined && !currentDesign,
    },
  );

  useEffect(() => {
    handleSaveDesignData();
  }, []);

  useEffect(() => {
    if (!fetchedDesign || currentDesign) return;

    console.log("foundDesign", designId);

    const foundDesign = fetchedDesign.design;

    if (foundDesign) {
      setBackgroundColor(foundDesign.Design.backgroundColor);
      setStrokeColor(foundDesign.Design.strokeColor);
      setCurrentCollage(foundDesign);
      setUseText(foundDesign.useText);
      setActiveDesign({
        id: foundDesign.id,
        name: foundDesign.Design.name,
        designId: foundDesign.Design.id,
      });

      setCurrentDesign(foundDesign.Design);
    } else {
      // Handle the case where the design is not found
      console.error("Design not found");
    }
  }, [
    activities,
    fetchedDesign,
    currentDesign,
    designId,
    user,
    setActiveDesign,
  ]);

  return (
    <div className="m-4 sm:m-6">
      <h1 className="mt-4 text-2xl sm:mt-6 sm:text-4xl">
        Create Your <span className="font-bold">Collage Mug</span>
      </h1>
      <DesignName />

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
            onClickActivity={handleClickActivity}
          />
        </div>
      </div>

      {!isLoading && (
        <div className="space-y-4">
          <div className="flex w-full gap-4 sm:gap-6">
            {/* <SaveButton /> */}
            {/* <PreviewButton onClick={() => setOverlayOpen(true)} /> */}
            <CheckoutButton
              design={currentDesign}
              name={activeDesign?.name ?? "Untitled"}
              id={Number(designId)}
              primaryText={primaryText}
              secondaryText={secondaryText}
              backgroundColor={backgroundColor}
              strokeColor={backgroundColor}
              useText={useText}
              activityTypes={selectedActivityTypes}
              previewSvg={getSVGBase64(svgRef) ?? ""}
            />
          </div>
        </div>
      )}
      {selectedActivities.length > 200 && (
        <WarningBanner
          title="Warning"
          text="Selecting >200 activities makes for a tough print"
        />
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

      <ActivityModal
        isOpen={isModalVisible}
        activity={selectedActivities[selectedActivityIndex!]!}
        onClose={() => setIsModalVisible(false)}
        onDelete={() => handleDeleteActivity(selectedActivityIndex!)}
      />

      <Overlay
        svgDataURL={svgRef.current ? getSVGDataURL(svgRef) : ""}
        isOpen={isOverlayOpen}
        onClose={() => setOverlayOpen(false)}
      />
    </div>
  );
}
