interface ToggleTextDisplayProps {
  useText: boolean;
  setUseText: React.Dispatch<React.SetStateAction<boolean>>;
}

const ToggleTextDisplay: React.FC<ToggleTextDisplayProps> = ({
  useText,
  setUseText,
}) => {
  return (
    <div className="my-4">
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={useText}
          onChange={(e) => setUseText(e.target.checked)}
          className="form-checkbox h-5 w-5 text-gray-900 transition duration-150 ease-in-out focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        />
        <span className="font-semibold">Display Text</span>
      </label>
    </div>
  );
};

export default ToggleTextDisplay;
