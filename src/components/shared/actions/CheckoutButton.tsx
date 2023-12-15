import { ShoppingCartIcon } from "@heroicons/react/20/solid";
import Button from "~/components/Button";
import { api } from "~/utils/api";
import { cartSignal } from "~/components/ShoppingCartSidebar";
import { Design } from "@prisma/client";
import { sidebarSignal } from "~/components/Layout";

interface CheckoutButtonProps {
  design: Design | undefined;
  id: number;
  activityTypes: string[];
  backgroundColor: string;
  strokeColor: string;
  previewSvg: string;
  primaryText: string;
  secondaryText: string;
  useText: boolean;
  name: string;
}

export const CheckoutButton = ({
  design,
  id,
  activityTypes,
  backgroundColor,
  strokeColor,
  previewSvg,
  primaryText,
  secondaryText,
  useText,
  name,
}: CheckoutButtonProps) => {
  const addProductToCart = api.cart.add.useMutation();

  const saveDesign = api.design.saveCollage.useMutation();

  const handleSaveDesignData = () => {
    if (!design) return;

    void saveDesign.mutateAsync({
      id: id,
      activityTypes: activityTypes.join(","),
      backgroundColor: backgroundColor,
      strokeColor: strokeColor,
      previewSvg: previewSvg,
      primaryText: primaryText,
      secondaryText: secondaryText,
      useText: useText,
      name: name,
    });
  };
  const handleClick = () => {
    console.log("design", design);
    if (!design) return;

    handleSaveDesignData();

    const item = addProductToCart.mutateAsync({
      designId: design.id,
      amount: 1,
    });

    void item.then((item) => {
      const items = cartSignal.value.slice();
      if (!item?.item) return;

      items.push(item?.item);
      cartSignal.value = items;

      sidebarSignal.value = true;
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
