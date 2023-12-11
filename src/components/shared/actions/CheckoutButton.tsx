import { ShoppingCartIcon } from "@heroicons/react/20/solid";
import Button from "~/components/Button";

export const CheckoutButton = ({
  onClick,
}: {
  onClick: (open: boolean) => void;
}) => {
  return (
    <Button
      onClick={() => onClick(true)}
      className="flex w-full items-center justify-center bg-purple-600 text-white shadow-lg hover:bg-purple-500"
    >
      <ShoppingCartIcon
        className="mr-2 inline-block h-6 w-6"
        aria-hidden="true"
      />
      Add to Cart
    </Button>
  );
};
