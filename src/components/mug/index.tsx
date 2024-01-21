import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useData } from "~/contexts/DataContext";
import SVGCanvasCollage from "./canvas/SVGCanvasCollage";
import ActivityTypeSelector from "~/components/shared/selectors/ActivityTypeSelector";
import { useSession } from "next-auth/react";
import type { Activity, Design } from "@prisma/client";
import type { Collage } from "@prisma/client";
import YearSelector from "~/components/shared/selectors/YearSelector";
import StrokeColorSelector from "~/components/shared/selectors/StrokeColorSelector";
import TextSelector from "~/components/shared/selectors/TextSelector";
import WarningBanner from "../WarningBanner";
import ToggleTextDisplay from "~/components/shared/selectors/ToggleTextDisplay";
import MugColorSelector from "~/components/shared/selectors/MugColorSelector";
import { api } from "~/utils/api";
import { useSearchParams } from "next/navigation";
import { getSVGBase64 } from "~/utils/getSVGBase64";
import { CartAddButton } from "~/components/shared/actions/CartAddButton";
import { ActivityModal } from "~/components/shared/modals/ActivityModal";
import DesignName from "~/components/DesignName";
import { useRouter } from "next/router";
import { activeDesign } from "~/components/shared/utils/data";
import { cartSignal } from "~/components/ShoppingCartSidebar";
import { DebouncedFunc, debounce } from "lodash";
import { showNoDesignFoundBanner } from "~/components/shop";
import SVGCanvasHeatmap from "~/components/mug/canvas/SVGCanvasHeatmap";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { LoadingSpinner } from "../Loading";
import { signal } from "@preact/signals-react";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { NotSavedModal } from "~/components/shared/modals/NotSavedModal";

const getActivitiesWithGPS = (activities: Activity[]): Activity[] =>
  activities.filter((activity) => activity.summaryPolyline);

const getUniqueSportTypes = (activities: Activity[]): string[] =>
  activities.reduce<string[]>((acc, activity) => {
    if (!acc.includes(activity.sport_type)) acc.push(activity.sport_type);
    return acc;
  }, []);

enum SaveStatus {
  "SAVING",
  "SAVED",
  "UNSAVED",
  "ERROR",
}

export const saveStateSignal = signal(SaveStatus.UNSAVED);

export default function CollageMug({
  isLoading,
  type,
}: {
  isLoading: boolean;
  type: undefined | string;
}) {
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

  const [originalPrimaryText, setOriginalPrimaryText] = useState("");
  const [originalSecondaryText, setOriginalSecondaryText] = useState("");

  const [currentCollage, setCurrentCollage] = useState<Collage>();
  const [currentDesign, setCurrentDesign] = useState<Design>();

  const [showResetPrimary, setShowResetPrimary] = useState(false);
  const [showResetSecondary, setShowResetSecondary] = useState(false);

  const searchParams = useSearchParams();
  const user = useSession().data?.user;

  const [hasSavedOnce, setHasSavedOnce] = useState(false);

  const router = useRouter();
  const designParameter = router.query.designId;

  const availableYears = useMemo(() => {
    const years = new Set(
      activities.map((activity) =>
        new Date(activity.start_date_local).getFullYear(),
      ),
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [activities]);

  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  const activitiesFilteredByYears = useMemo(
    () =>
      activities.filter((activity) =>
        selectedYears.includes(
          new Date(activity.start_date_local).getFullYear(),
        ),
      ),
    [activities, selectedYears],
  );

  const designId = searchParams.get("designId");

  const { data: fetchedDesign, isLoading: loading } =
    api.design.getCollage.useQuery(
      { id: Number(designId) },
      {
        enabled: user !== undefined,
      },
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
    if (selectedActivityTypes[0] !== "" || sportTypes.length === 0) return;
    setSelectedActivityTypes(sportTypes);
  }, [sportTypes.length, activitiesWithGPS]);

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
    const yearText = selectedYears.length === 2 ? selectedYears[1] : "Years";
    const user =
      session?.user?.name === undefined ? "Your" : session?.user?.name;

    const userName = user === "Your" ? user : user?.split(" ")[0];

    const userText = userName?.endsWith("s") ? `${userName}'` : `${userName}'s`;

    const primText = `${userText} ${yearText} Wrapped`;
    const secText = `${selectedActivities.length} Activities`;

    if (loading) return;

    if (!showResetPrimary) {
      setPrimaryText(primText);
      setOriginalPrimaryText(primText);
    }

    if (!showResetSecondary) {
      setSecondaryText(secText);
      setOriginalSecondaryText(secText);
    }
  }, [
    selectedYears,
    session?.user?.name,
    selectedActivities,
    loading,
    showResetSecondary,
    showResetPrimary,
  ]);

  const handleToggleActivityType = (sportType: string) => {
    setSelectedActivityTypes((prev) => {
      return prev.includes(sportType)
        ? prev.filter((type) => type !== sportType)
        : [...prev, sportType];
    });
  };

  const handleYearChange = (year: number) => {
    setSelectedYears((prevYears) => {
      if (prevYears.includes(year)) {
        // Remove the year if it's already selecte
        return prevYears.filter((y) => y !== year);
      } else {
        // Add the year if it's not already selected
        return [...prevYears, year];
      }
    });
  };

  const handleResetPrimaryText = () => {
    setPrimaryText(originalPrimaryText);
    setShowResetPrimary(false);
  };

  const handleResetSecondaryText = () => {
    setSecondaryText(originalSecondaryText);
    setShowResetSecondary(false);
  };

  const handlePrimaryTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === originalPrimaryText) {
      setShowResetPrimary(false);
    } else {
      setShowResetPrimary(true);
    }
    setPrimaryText(e.target.value);
  };

  const handleSecondaryTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.value === originalSecondaryText) {
      setShowResetSecondary(false);
    } else {
      setShowResetSecondary(true);
    }
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

  const handleSaveDesignData = () => {
    if (!user) return;

    console.log("showReset", showResetSecondary);

    saveStateSignal.value = SaveStatus.SAVING;

    void saveDesign
      .mutateAsync({
        id: Number(designId) ?? 0,
        activityTypes: selectedActivityTypes.join(","),
        years: selectedYears.join(","),
        backgroundColor: backgroundColor,
        strokeColor: strokeColor,
        previewSvg: getSVGBase64(svgRef) ?? "",
        primaryText: primaryText,
        secondaryText: secondaryText,
        isPrimaryOriginal: showResetPrimary,
        isSecondaryOriginal: showResetSecondary,
        useText: useText,
        name: activeDesign.value?.name ?? "Untitled-1",
      })
      .then((result) => {
        if (result.status === "success") {
          saveStateSignal.value = SaveStatus.SAVED;
        } else if (result.status === "error") {
          saveStateSignal.value = SaveStatus.ERROR;
        }

        //setHasSavedOnce(true);
      });

    cartSignal.value.map((item) => {
      if (item.design.id === Number(designId)) {
        item.design.previewSvg = getSVGBase64(svgRef) ?? "";
      }
    });
  };

  const debouncedSaveRef = useRef<DebouncedFunc<typeof handleSaveDesignData>>();

  // Initialize or update the debounced function
  useEffect(() => {
    debouncedSaveRef.current = debounce(() => {
      handleSaveDesignData();
    }, 500);

    return () => {
      // Cancel the debounced call on cleanup
      debouncedSaveRef.current?.cancel();
    };
  }, [
    selectedActivities.length,
    selectedYears.length,
    secondaryText,
    primaryText,
    strokeColor,
    backgroundColor,
  ]);

  // Trigger the debounced function when dependencies change
  useEffect(() => {
    debouncedSaveRef.current?.();
  }, [
    selectedActivities.length,
    selectedYears.length,
    secondaryText,
    primaryText,
    strokeColor,
    backgroundColor,
  ]);

  const handleStrokeColorChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setStrokeColor(e.target.value);
  };

  useEffect(() => {
    console.log("fetchedDesign", fetchedDesign);
    //if (!fetchedDesign || currentDesign) return;

    if (!fetchedDesign) return;

    const foundDesign = fetchedDesign.design;

    if (foundDesign) {
      setBackgroundColor(foundDesign.Design.backgroundColor);
      setStrokeColor(foundDesign.Design.strokeColor);
      setCurrentCollage(foundDesign);
      setUseText(foundDesign.useText);
      setSelectedYears(foundDesign.Design.years.split(",").map(Number));
      setSelectedActivityTypes(foundDesign.Design.activityTypes.split(","));
      setPrimaryText(foundDesign.primaryText);
      setSecondaryText(foundDesign.secondaryText);
      setShowResetPrimary(foundDesign.Design.isPrimaryOriginal);
      setShowResetSecondary(foundDesign.Design.isSecondaryOriginal);

      activeDesign.value = {
        id: foundDesign.id,
        name: foundDesign.Design.name,
        designId: foundDesign.Design.id,
      };

      setCurrentDesign(foundDesign.Design);
    } else {
      // Handle the case where the design is not found
      console.error("Design not found");
      showNoDesignFoundBanner.value = true;
      void router.push("/shop");
    }
  }, [activities, fetchedDesign, currentDesign, designId, user]);

  return (
    <div className="m-4 sm:m-6">
      <div className="mt-4 flex items-center justify-between sm:mt-6">
        <h1 className="text-2xl sm:text-4xl">
          Create Your <span className="font-bold">Collage Mug</span>
        </h1>
        <NotSavedModal shouldConfirmLeave={!hasSavedOnce} />

        {/* Save status */}
        <div className="text-sm text-gray-500">
          {saveStateSignal.value === SaveStatus.SAVING && (
            <div className="flex items-center space-x-2">
              <p className="text-gray-500">Saving</p>
              <LoadingSpinner />
            </div>
          )}
          {saveStateSignal.value === SaveStatus.SAVED && (
            <div className="flex items-center">
              <p className="text-green-500">Saved</p>
              <CheckCircleIcon className="ml-1 h-4 w-4 text-green-500" />
            </div>
          )}

          {saveStateSignal.value === SaveStatus.ERROR && (
            <div className="flex items-center">
              <p className="text-red-500">Error</p>
              <XCircleIcon className="ml-1 h-4 w-4 text-red-500" />
            </div>
          )}
        </div>
      </div>
      <DesignName />

      {/* Sticky SVGCanvasCollage */}
      <div className="sticky top-0 z-10 my-4 text-center sm:my-6">
        <div className="bg-white shadow-2xl">
          {(() => {
            if (type === "collage")
              return (
                <SVGCanvasCollage
                  activities={selectedActivities}
                  backgroundColor={backgroundColor}
                  strokeColor={strokeColor}
                  useText={useText}
                  primaryText={primaryText}
                  secondaryText={secondaryText}
                  svgRef={svgRef}
                  onClickActivity={handleClickActivity}
                />
              );
            if (type === "heatmap")
              return (
                <SVGCanvasHeatmap
                  activities={selectedActivities}
                  backgroundColor={backgroundColor}
                  strokeColor={strokeColor}
                  useText={useText}
                  primaryText={primaryText}
                  secondaryText={secondaryText}
                  svgRef={svgRef}
                  onClickActivity={handleClickActivity}
                />
              );
          })()}
        </div>
      </div>

      {!isLoading && (
        <div className="space-y-4">
          <div className="flex w-full gap-4 sm:gap-6">
            {/* <SaveButton /> */}
            {/* <PreviewButton onClick={() => setOverlayOpen(true)} /> */}
            <CartAddButton design={currentDesign} />
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
              onColorChange={handleStrokeColorChange}
            />
          </div>

          <ToggleTextDisplay useText={useText} setUseText={setUseText} />

          <TextSelector
            label="Primary Text"
            text={primaryText}
            onTextChange={handlePrimaryTextChange}
            showReset={showResetPrimary}
            onReset={handleResetPrimaryText}
          />

          <TextSelector
            label="Secondary Text"
            text={secondaryText}
            onTextChange={handleSecondaryTextChange}
            showReset={showResetSecondary}
            onReset={handleResetSecondaryText}
          />
        </div>
      )}

      <ActivityModal
        isOpen={isModalVisible}
        activity={selectedActivities[selectedActivityIndex!]!}
        onClose={() => setIsModalVisible(false)}
        onDelete={() => handleDeleteActivity(selectedActivityIndex!)}
      />
    </div>
  );
}
