import { useRef, useState } from "react";
import { useData } from "~/contexts/DataContext";
import SVGCanvas from "./SVGCanvas";
import { useActivityTypes } from "./utils/useActivityTypes";

export default function Mug() {
  const { activities } = useData();

  // State hooks
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(6);

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);

  // Custom hooks
  const { activitiesWithGPS } = useActivityTypes(activities);
  const activitiesFilteredByYear = activitiesWithGPS;

  const activitiesFiltered = activitiesFilteredByYear;

  return (
    <div className="m-4 space-y-4">
      <div className="min-w-[300px] bg-white text-center shadow-lg sm:min-w-[800px]">
        <SVGCanvas
          activities={activitiesFiltered}
          backgroundColor={backgroundColor}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          svgRef={svgRef}
        />
      </div>
    </div>
  );
}
