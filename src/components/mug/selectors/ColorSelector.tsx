// ColorSelector.tsx
import React, { FC } from "react";

interface ColorSelectorProps {
  label: string;
  color: string;
  onColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ColorSelector: FC<ColorSelectorProps> = ({
  label,
  color,
  onColorChange,
}) => {
  return (
    <div className="flex-col space-y-1">
      <p className="text-left font-semibold">{label}</p>
      <input
        type="color"
        value={color}
        onChange={onColorChange}
        className="h-12 w-full cursor-pointer rounded-md border border-gray-200 bg-white px-2 py-1 text-center font-semibold"
      />
    </div>
  );
};

export default ColorSelector;
