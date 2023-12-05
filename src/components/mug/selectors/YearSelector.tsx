import React from "react";
import SelectorButton from "~/components/SelectorButton";

interface YearSelectorProps {
  availableYears: number[];
  selectedYears: number[];
  onSelectYear: (year: number) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({
  availableYears,
  selectedYears,
  onSelectYear,
}) => {
  return (
    <div className="flex-col space-y-1">
      <p className="text-left font-semibold">Select Year(s)</p>{" "}
      {/* Updated text */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-2">
        {availableYears.map((year, index) => {
          const isActive = selectedYears.includes(year);
          const className = isActive
            ? "bg-gray-900 text-white hover:bg-gray-700"
            : "bg-white text-gray-900 hover:bg-gray-200";
          return (
            <SelectorButton
              key={index}
              onClick={() => onSelectYear(year)}
              className={className}
            >
              {year}
            </SelectorButton>
          );
        })}
      </div>
    </div>
  );
};

export default YearSelector;
