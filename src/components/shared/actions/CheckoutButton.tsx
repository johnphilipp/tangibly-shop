import { ShoppingCartIcon } from "@heroicons/react/20/solid";
import Button from "~/components/Button";
import { api } from "~/utils/api";
import { cartSignal } from "~/components/ShoppingCartSidebar";
import { Design } from "@prisma/client";

export const CheckoutButton = ({ design }: { design: Design | undefined }) => {
  const addProductToCart = api.cart.add.useMutation();
  const handleClick = () => {
    console.log("design", design);
    if (!design) return;

    const item = addProductToCart.mutateAsync({
      designId: design.id,
      amount: 1,
    });

    void item.then((item) => {
      const items = cartSignal.value.slice();
      if (!item?.item) return;

      items.push(item?.item);
      cartSignal.value = items;
    });
  };

  return (
    <Button
      onClick={handleClick}
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
