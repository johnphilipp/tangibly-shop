import { useEffect, useRef, useState } from "react";
import { useData } from "~/contexts/DataContext";
import SVGCanvas from "./SVGCanvas";
import { useActivityTypes } from "./utils/useActivityTypes";
import { useSession } from "next-auth/react";

export default function Mug() {
  const { activities } = useData();

  const session = useSession();

  // State hooks
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [freeText, setFreeText] = useState("Your 2023 Wrapped");
  const [metricText, setMetricText] = useState("Activities");

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);

  // Custom hooks
  const { activitiesWithGPS } = useActivityTypes(activities);
  const activitiesFilteredByYear = activitiesWithGPS.filter((activity) => {
    const year = new Date(activity?.start_date_local).getFullYear();
    return year === 2023;
  });

  const activitiesFiltered = activitiesFilteredByYear;

  useEffect(() => {
    // Update name if loaded
    if (session?.data?.user?.name) {
      setFreeText(`${session?.data?.user?.name.split(" ")[0]}'s 2023 Wrapped`);
    }
  }, [session?.data?.user?.name]);

  return (
    <div className="m-4 space-y-4">
      <div className="min-w-[300px] bg-white text-center shadow-lg sm:min-w-[800px]">
        <SVGCanvas
          activities={activitiesFiltered}
          backgroundColor={backgroundColor}
          strokeColor={strokeColor}
          freeText={freeText}
          metricText={metricText}
          svgRef={svgRef}
        />
      </div>
    </div>
  );
}
