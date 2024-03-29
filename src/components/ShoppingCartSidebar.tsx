import { Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { ExtendedCartItem, useData } from "~/contexts/DataContext";
import { pricing } from "~/utils/pricing";
import { Signal, signal } from "@preact/signals-react";
import { useRouter } from "next/router";
import { products } from "~/utils/products";
import { sidebarSignal } from "./Layout";

const product = "CoffeeMug"; // or 'Bubbles'
const currency = "CHF"; // or 'EUR'

/**
const dasdad = [
  {
    id: 1,
    name: "Throwback Hip Bag",
    href: "#",
    color: "Salmon",
    price: "$90.00",
    quantity: 1,
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/shopping-cart-page-04-product-01.jpg",
    imageAlt:
      "Salmon orange fabric pouch with match zipper, gray zipper pull, and adjustable hip belt.",
  },
  {
    id: 2,
    name: "Medium Stuff Satchel",
    href: "#",
    color: "Blue",
    price: "$32.00",
    quantity: 1,
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/shopping-cart-page-04-product-02.jpg",
    imageAlt:
      "Front of satchel with blue canvas body, black straps and handle, drawstring top, and front zipper pouch.",
  },
]; **/

export const cartSignal: Signal<ExtendedCartItem[]> = signal([]);

export default function ShoppingCartSidebar({ open }: { open: boolean }) {
  //const { cartItems, setCartItems } = useData();
  const user = useSession().data?.user;
  const router = useRouter();

  const { data: cartData } = api.cart.get.useQuery({
    enabled: user !== undefined && router.pathname !== "/demo",
  });

  useEffect(() => {
    if (user !== undefined && cartData?.items) {
      cartSignal.value = cartData.items;
    }
  }, [cartData, user]);

  const cart = api.cart.delete.useMutation();
  const handleCartDeletion = async (id: number) => {
    await cart.mutateAsync({
      id: id,
    });

    cartSignal.value = cartSignal.value.filter(
      (cartItem) => cartItem.id !== id,
    );
  };

  const getPrice = (cartItem: ExtendedCartItem) => {
    if (cartItem.design.productType === "Heatmap") {
      if (currency === "CHF") {
        return pricing.products.Heatmap.CHF;
      }
      if (currency === "EUR") {
        return pricing.products.Heatmap.EUR;
      }
    }
    if (cartItem.design.productType === "Collage") {
      if (currency === "CHF") {
        return pricing.products.Collage.CHF;
      }
      if (currency === "EUR") {
        return pricing.products.Collage.EUR;
      }
    }
    return;
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => (sidebarSignal.value = false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Shopping cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => (sidebarSignal.value = false)}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul
                            role="list"
                            className="-my-6 divide-y divide-gray-200"
                          >
                            {cartSignal.value.map((cartItem) => (
                              <li key={cartItem.id} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <img
                                    src={`data:image/svg+xml;base64,${cartItem.design.previewSvg}`}
                                    className="h-full w-full object-contain object-center"
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>
                                        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                                        <a href={"#"}>{cartItem.design.name}</a>
                                      </h3>
                                      <p className="ml-4">
                                        {currency} {getPrice(cartItem)}
                                      </p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                      {cartItem.design.productType}
                                    </p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className="text-gray-500">
                                      Qty {cartItem.amount}
                                    </p>

                                    <div className="flex">
                                      <Link
                                        href={
                                          `${products.find(
                                            (value) =>
                                              value.name ===
                                              cartItem.design.productType,
                                          )?.href}?designId=` +
                                          cartItem.designId
                                        }
                                        className="mr-2 font-medium text-indigo-600 hover:text-indigo-500"
                                      >
                                        Edit
                                      </Link>
                                      <button
                                        type="button"
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                        onClick={() =>
                                          handleCartDeletion(cartItem.id)
                                        }
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>
                          {currency}{" "}
                          {cartSignal.value
                            .map((value) => getPrice(value))
                            .reduce((total, current) => {
                              return (total ?? 0) + (current ?? 0);
                            }, 0)}
                        </p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        Shipping and taxes calculated at checkout.
                      </p>
                      <div className="mt-6">
                        <Link
                          href="/checkout"
                          className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                          onClick={() => (sidebarSignal.value = false)}
                        >
                          Checkout
                        </Link>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or{" "}
                          <button
                            type="button"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                            onClick={() => (sidebarSignal.value = false)}
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
