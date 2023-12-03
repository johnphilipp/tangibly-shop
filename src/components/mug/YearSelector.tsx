import React from "react";
import Button from "../Button";

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
    <div className="flex-col space-y-1 p-4 sm:p-6">
      <p className="text-left font-semibold">Select Year(s)</p>{" "}
      {/* Updated text */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {availableYears.map((year, index) => {
          const isActive = selectedYears.includes(year);
          const className = isActive
            ? "bg-gray-900 text-white hover:text-gray-900"
            : "bg-white text-gray-900 hover:bg-gray-900 hover:text-white";
          return (
            <Button
              key={index}
              onClick={() => onSelectYear(year)}
              className={className}
            >
              {year}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default YearSelector;
