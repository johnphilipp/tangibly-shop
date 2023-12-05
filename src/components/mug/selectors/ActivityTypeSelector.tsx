// ActivityTypeSelector.tsx
import React from "react";
import SelectorButton from "~/components/SelectorButton";

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
    <div className="flex-col space-y-1">
      <p className="text-left font-semibold">Activity Types</p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-2">
        {sportTypes.map((sportType, index) => {
          const isActive = selectedActivityTypes.includes(sportType);
          const className = isActive
            ? "bg-gray-900 text-white hover:bg-gray-700 break-words"
            : "bg-white text-gray-900 hover:bg-gray-200 break-words";
          return (
            <SelectorButton
              key={index}
              onClick={() => onToggleActivityType(sportType)}
              className={className}
            >
              {sportType}
            </SelectorButton>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTypeSelector;
