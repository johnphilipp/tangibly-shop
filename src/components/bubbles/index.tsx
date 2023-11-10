import { useRef, useState } from "react";
import { getSVGDimensions } from "../editor/utils/getSVGDimensions";
import { aspectRatios } from "../editor/utils/aspectRatios";

export default function Bubbles() {
  const svgRef = useRef<SVGSVGElement>(null);

  // State hooks
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(
    aspectRatios[0]!,
  );
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [padding, setPadding] = useState(10);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<
    number | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const { SVG_WIDTH, SVG_HEIGHT, MAX_ACTIVITIES } =
    getSVGDimensions(currentAspectRatio);

  return (
    <div className="m-4 space-y-4">
      {/* CANVAS */}
      <div className="min-w-[300px] bg-white text-center shadow-lg sm:min-w-[800px]">
        <svg
          ref={svgRef}
          width="100%"
          height="400px"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          className="gridBackground"
        >
          <rect
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            fill={backgroundColor}
            stroke={"#cfcfcf"}
            strokeWidth={"2"}
          />
        </svg>
      </div>
    </div>
  );
}
