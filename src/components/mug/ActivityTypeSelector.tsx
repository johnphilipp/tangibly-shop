// ActivityTypeSelector.tsx
import React from "react";
import Button from "../Button";

interface ActivityTypeSelectorProps {
  sportTypes: string[];
  selectedActivityTypes: string[];
  onToggleActivityType: (sportType: string) => void;
}

const ActivityTypeSelector: React.FC<ActivityTypeSelectorProps> = ({
  sportTypes,
  selectedActivityTypes,
  onToggleActivityType,
}) => {
  return (
    <div className="flex-col space-y-1 p-4 sm:p-6">
      <p className="text-left font-semibold">Activity Types</p>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {sportTypes.map((sportType, index) => {
          const isActive = selectedActivityTypes.includes(sportType);
          const className = isActive
            ? "bg-gray-900 text-white hover:text-gray-900 break-words"
            : "break-words";
          return (
            <Button
              key={index}
              onClick={() => onToggleActivityType(sportType)}
              className={className}
            >
              {sportType}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTypeSelector;
