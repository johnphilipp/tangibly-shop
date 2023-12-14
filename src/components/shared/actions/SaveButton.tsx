import { IoMdSave } from "react-icons/io";
import Button from "~/components/Button";

export const SaveButton = () => {
  return (
    <Button
      onClick={() => void 0}
      className="flex w-full items-center justify-center bg-white shadow-lg"
    >
      <IoMdSave className="mr-2 inline-block h-6 w-6" aria-hidden="true" />
      Save
    </Button>
  );
};
