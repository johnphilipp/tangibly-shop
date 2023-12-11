import SelectorButton from "~/components/SelectorButton";

export interface AvailableSize {
  width: number;
  height: number;
}

interface YearSelectorProps {
  selectedSize: AvailableSize;
  onSelectedSize: (size: AvailableSize) => void;
}

const availableSizes: AvailableSize[] = [
  {
    width: 3000,
    height: 3000,
  },
  {
    width: 5000,
    height: 5000,
  },
  {
    width: 4000,
    height: 3000,
  },
  {
    width: 7000,
    height: 5000,
  },
  {
    width: 3000,
    height: 4000,
  },
  {
    width: 5000,
    height: 7000,
  },
];

const SizeSelector: React.FC<YearSelectorProps> = ({
  selectedSize,
  onSelectedSize,
}) => {
  return (
    <div className="flex-col space-y-1">
      <p className="text-left font-semibold">Select Size</p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {availableSizes.map((size, index) => {
          const isActive =
            selectedSize.width === size.width &&
            selectedSize.height === size.height;
          const className = isActive
            ? "bg-gray-900 text-white hover:bg-gray-700"
            : "bg-white text-gray-900 hover:bg-gray-200";
          return (
            <SelectorButton
              key={index}
              onClick={() => onSelectedSize(size)}
              className={className}
            >
              {size.width / 100} x {size.height / 100} cm
            </SelectorButton>
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelector;
