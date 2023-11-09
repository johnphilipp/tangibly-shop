// AspectRatioSelector.tsx
import React from "react";
import Button from "../Button";
import type { AspectRatio } from "./utils/aspectRatios";
import { aspectRatios } from "./utils/aspectRatios";

interface AspectRatioSelectorProps {
  currentAspectRatio: AspectRatio;
  setCurrentAspectRatio: (aspectRatio: AspectRatio) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  currentAspectRatio,
  setCurrentAspectRatio,
}) => {
  return (
    <div className="flex-col space-y-1 p-4 sm:p-6">
      <p className="text-left font-semibold">Aspect Ratios</p>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {aspectRatios.map((ratio, index) => {
          const isActive =
            currentAspectRatio.rows === ratio.rows &&
            currentAspectRatio.cols === ratio.cols;
          const className = isActive
            ? "bg-gray-900 text-white hover:text-gray-900"
            : "";
          return (
            <Button
              key={index}
              onClick={() => setCurrentAspectRatio(ratio)}
              className={className}
            >
              {`${ratio.cols}x${ratio.rows}`}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default AspectRatioSelector;
