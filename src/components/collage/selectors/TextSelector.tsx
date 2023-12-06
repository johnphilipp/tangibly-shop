// TextSelector.tsx
import React, { FC } from "react";

interface TextSelectorProps {
  label: string;
  text: string;
  onTextChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextSelector: FC<TextSelectorProps> = ({ label, text, onTextChange }) => {
  return (
    <div className="flex-col space-y-1">
      <label className="text-left font-semibold">{label}</label>
      <input
        type="text"
        value={text}
        onChange={onTextChange}
        className="focus:shadow-outline w-full rounded border border-gray-200 px-3 py-2 leading-tight text-gray-700 focus:outline-none"
      />
    </div>
  );
};

export default TextSelector;
