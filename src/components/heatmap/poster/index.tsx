import React, { useState, useEffect, useMemo, useRef } from "react";
import { useData } from "~/contexts/DataContext";
import SVGCanvas from "./canvas/SVGCanvas";
import ActivityTypeSelector from "../../shared/selectors/ActivityTypeSelector";
import { useSession } from "next-auth/react";
import type { Activity, Collage } from "@prisma/client";
import YearSelector from "../../shared/selectors/YearSelector";
import StrokeColorSelector from "../../shared/selectors/StrokeColorSelector";
import TextSelector from "../../shared/selectors/TextSelector";
import ToggleTextDisplay from "../../shared/selectors/ToggleTextDisplay";
import MugColorSelector from "../../shared/selectors/MugColorSelector";
import { api } from "~/utils/api";
import { useSearchParams } from "next/navigation";
import { getSVGBase64 } from "~/utils/getSVGBase64";
import { PreviewButton } from "../../shared/actions/PreviewButton";
import { CartAddButton } from "../../shared/actions/CartAddButton";
import { getSVGDataURL } from "~/utils/getSVGDataURL";
import Overlay from "../../3d/Overlay";
import SizeSelector from "~/components/shared/selectors/SizeSelector";
import type { AvailableSize } from "~/components/shared/selectors/SizeSelector";
import { getUniqueSportTypes } from "../utils/getUniqueSportTypes";
import { ActivityModal } from "~/components/shared/modals/ActivityModal";
import DesignName from "~/components/DesignName";
import { InterestedModal } from "~/components/modals/InterestedModal";
import Button from "~/components/Button";
import { BiMailSend } from "react-icons/bi";

export default function HeatmapPoster({ isLoading }: { isLoading: boolean }) {
  const { activities } = useData();
  const { data: session } = useSession();
  const svgRef = useRef<SVGSVGElement>(null);
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<
    number | null
  >(null);
  const [size, setSize] = useState({ width: 3000, height: 3000 });
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [useText, setUseText] = useState(true);
  const [primaryText, setPrimaryText] = useState("");
  const [secondaryText, setSecondaryText] = useState("");
  const [isInterestedModalVisible, setIsInterestedModalVisible] =
    useState(false);

  const [currentDesign, setCurrentDesign] = useState<Collage>();

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
  }, [activitiesFilteredByYears, selectedActivityTypes]);

  useEffect(() => {
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
  }, [selectedYear, session?.user?.name, selectedActivities]);

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

  const handleSizeChange = (newSize: AvailableSize) => {
    setSize(newSize);
  };

  const handleClickActivity = (index: number) => {
    console.log("Clicked activity", index);
    setSelectedActivityIndex(index);
    const activity = selectedActivities[index];
    if (activity) {
      setIsModalVisible(true);
    }
  };

  const handleDeleteActivity = (index: number) => {
    setSelectedActivities((prev) => {
      const newActivities = [...prev];
      newActivities.splice(index, 1);
      return newActivities;
    });
    setIsModalVisible(false);
  };

  const saveDesign = api.design.saveCollage.useMutation();

  const designId = searchParams.get("designId");

  const handleSaveDesignData = () => {
    if (!user) return;
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
    } else {
      // Handle the case where the design is not found
      console.error("Design not found");
    }
  }, [activities, currentDesign, fetchedDesign, selectedActivities]);

  return (
    <div className="m-4 sm:m-6">
      <h1 className="mt-4 text-2xl sm:mt-6 sm:text-4xl">
        Create Your <span className="font-bold">Heatmap Poster</span>
      </h1>

      <DesignName />

      {isInterestedModalVisible && (
        <InterestedModal
          onClose={() => setIsInterestedModalVisible(false)}
          svg={getSVGBase64(svgRef) ?? ""}
        />
      )}

      {/* Sticky SVGCanvasCollage */}
      <div className="sticky top-0 z-10 my-4 text-center sm:my-6">
        <div className="bg-white shadow-2xl">
          <SVGCanvas
            SVG_WIDTH={size.width}
            SVG_HEIGHT={size.height}
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

      <Button
        onClick={() => setIsInterestedModalVisible(true)}
        className="flex w-full items-center justify-center bg-purple-600 text-white shadow-lg hover:bg-purple-700"
      >
        <BiMailSend className="mr-2 inline-block h-6 w-6" aria-hidden="true" />
        Pre-order
      </Button>

      {/* Right-side selectors */}
      {!isLoading && (
        <div className="mt-4 grid gap-4 border bg-white p-4 shadow-lg sm:mt-6 sm:p-6 lg:col-span-1">
          <SizeSelector selectedSize={size} onSelectedSize={handleSizeChange} />

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
        </div>
      )}

      <Overlay
        svgDataURL={svgRef.current ? getSVGDataURL(svgRef) : ""}
        isOpen={isOverlayOpen}
        onClose={() => setOverlayOpen(false)}
      />

      <ActivityModal
        isOpen={isModalVisible}
        activity={selectedActivities[selectedActivityIndex!]!}
        onClose={() => setIsModalVisible(false)}
        onDelete={() => handleDeleteActivity(selectedActivityIndex!)}
      />
    </div>
  );
}
