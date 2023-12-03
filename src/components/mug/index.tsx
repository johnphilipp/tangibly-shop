import { useRef, useState } from "react";
import { useData } from "~/contexts/DataContext";
import SVGCanvas from "./SVGCanvas";
import { useActivityTypes } from "./utils/useActivityTypes";

export default function Mug() {
  const { activities } = useData();

  // State hooks
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(8);
  const [padding, setPadding] = useState(20);
  const [numActivitiesSelected, setNumActivitiesSelected] = useState(50);

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);

  // Custom hooks
  const { activitiesWithGPS } = useActivityTypes(activities);
  const activitiesFilteredByYear = activitiesWithGPS.filter((activity) => {
    const year = new Date(activity?.start_date_local).getFullYear();
    return year === 2023;
  });

  const activitiesFiltered = activitiesFilteredByYear;

  return (
    <div className="m-4 space-y-4">
      <div className="min-w-[300px] bg-white text-center shadow-lg sm:min-w-[800px]">
        <SVGCanvas
          activities={activitiesFiltered}
          strokeColor={strokeColor}
          backgroundColor={backgroundColor}
          svgRef={svgRef}
        />
      </div>
    </div>
  );
}
