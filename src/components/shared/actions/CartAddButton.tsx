import { ShoppingCartIcon } from "@heroicons/react/20/solid";
import Button from "~/components/Button";
import { api } from "~/utils/api";
import { cartSignal } from "~/components/ShoppingCartSidebar";
import { type Design } from "@prisma/client";
import { sidebarSignal } from "~/components/Layout";
import { activeDesign } from "~/components/shared/utils/data";
import { useSearchParams } from "next/navigation";

interface CheckoutButtonProps {
  design: Design | undefined;
  onClick?: () => Promise<void>;
}

export const CartAddButton = ({ onClick }: CheckoutButtonProps) => {
  const addProductToCart = api.cart.add.useMutation();

  const handleClick = async () => {
    await onClick?.();

    console.log("design", activeDesign.value);

    // Polling for 'activeDesign' state change
    while (!activeDesign.value?.designId) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
      console.log("Waiting for design to be saved...");
    }

    const item = await addProductToCart.mutateAsync({
      // Assuming safe assignment here
      designId: activeDesign.value?.designId,
      amount: 1,
    });

    if (!item?.item) return;

    if (
      cartSignal.value.find(
        (cartItem) => cartItem.design.id === item.item?.design.id,
      )
    ) {
      cartSignal.value.map((cartItem) => {
        if (cartItem.design.id === item.item?.design.id) {
          cartItem.amount = cartItem.amount + 1;
        }
      });
      sidebarSignal.value = true;
      return;
    }

    const items = [...cartSignal.value, item.item];
    cartSignal.value = items;

    sidebarSignal.value = true;
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
