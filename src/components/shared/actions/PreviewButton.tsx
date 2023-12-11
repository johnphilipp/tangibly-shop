import { FaEye } from "react-icons/fa";
import Button from "~/components/Button";

export const PreviewButton = ({
  onClick,
}: {
  onClick: (open: boolean) => void;
}) => {
  return (
    <Button
      onClick={() => onClick(true)}
      className="flex w-full items-center justify-center bg-blue-600 text-white shadow-lg hover:bg-blue-500"
    >
      <FaEye className="mr-2 inline-block h-6 w-6" aria-hidden="true" />
      Preview
    </Button>
  );
};
