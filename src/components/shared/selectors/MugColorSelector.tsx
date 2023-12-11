interface MugColorSelectorProps {
  label: string;
  onColorChange: (color: string) => void; // Updated type
}

const MugColorSelector: React.FC<MugColorSelectorProps> = ({
  label,
  onColorChange,
}) => {
  return (
    <div className="flex-shrink-0 flex-col space-y-1">
      <p className="text-left font-semibold">{label}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onColorChange("#ffffff")}
          className="h-12 w-12 cursor-pointer rounded-full border border-gray-200 bg-white"
        ></button>
        <button
          onClick={() => onColorChange("#000000")}
          className="h-12 w-12 cursor-pointer rounded-full border border-gray-200 bg-black text-white"
        ></button>
      </div>
    </div>
  );
};

export default MugColorSelector;
