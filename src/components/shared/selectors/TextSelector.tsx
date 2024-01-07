interface TextSelectorProps {
  label: string;
  text: string;
  onTextChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showReset?: boolean;
  onReset?: () => void;
}

const TextSelector: React.FC<TextSelectorProps> = ({
  label,
  text,
  onTextChange,
  showReset = false,
  onReset,
}) => {
  return (
    <div className="flex-col space-y-1">
      <label className="text-left font-semibold">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={onTextChange}
          className="focus:shadow-outline w-full rounded border border-gray-200 px-3 py-2 leading-tight text-gray-700 focus:outline-none"
        />
        {showReset && (
          <button
            className="absolute right-0 top-1.5 mr-3 cursor-pointer font-medium text-indigo-600 hover:text-indigo-500"
            onClick={onReset}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default TextSelector;
