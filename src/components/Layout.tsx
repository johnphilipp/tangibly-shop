import { Dialog, Menu, Tab, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  ShoppingCartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import type { FC, ReactNode } from "react";
import { Fragment, useState } from "react";
import ShoppingCartSidebar, { cartSignal } from "./ShoppingCartSidebar";
import DesignName from "~/components/DesignName";
import { useRouter } from "next/router";
import { Logo } from "./Logo";
import Image from "next/image";
import Footer from "./Footer";
import { signal } from "@preact/signals-react";
import Button from "~/components/Button";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const navigation = [
  { name: "Home", href: "/home" },
  { name: "Shop", href: "/shop" },
  { name: "Saved", href: "/saved" },
  { name: "Orders", href: "/orders" },
  { name: "Gifting", href: "/gifting" },
];

export function classNames(...classes: string[] | undefined[]) {
  return classes.filter(Boolean).join(" ");
}

export const sidebarSignal = signal(false);

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { status } = useSession();
  const { data } = useSession();

  const userImage = data?.user?.image ?? "/blank-user.png";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useSession().data?.user;

  const router = useRouter();

  const isTabActive = (href: string, tabName: string) => {
    if (tabName === "Home") {
      return router.pathname === href || router.pathname === "/";
    }
    return router.pathname === href;
  };

  return (
    <div className="bg-white">
      {/* Mobile menu */}
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
          onClose={setMobileMenuOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
                <div className="mb-2 flex px-4 pb-2 pt-5">
                  <button
                    type="button"
                    className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                  {navigation.map((item) => (
                    <div key={item.name} className="flow-root">
                      <Link
                        href={item.href}
                        className="-m-2 block p-2 font-medium text-gray-900"
                      >
                        {item.name}
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                  <div className="flow-root">
                    {status === "authenticated" ? (
                      <button
                        onClick={() => {
                          void signOut();
                        }}
                        className="-m-2 block p-2 font-medium text-gray-900"
                      >
                        Sign out
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          void signIn("strava");
                        }}
                        className="-m-2 block p-2 font-medium text-gray-900"
                      >
                        Sign in
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <header className="relative z-10">
        <nav aria-label="Top">
          {/* Secondary navigation */}
          <div className="bg-white">
            <div className="border-b border-gray-200">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  {/* Logo (lg+) */}
                  <div className="hidden lg:flex lg:items-center">
                    <Link href="/">
                      <span className="sr-only">Tangibly</span>
                      <Logo />
                    </Link>
                  </div>

                  <div className="ml-8 hidden h-full lg:flex">
                    <Tab.Group>
                      <div className="flex h-full justify-center space-x-8">
                        {navigation.map((item) => (
                          <Tab
                            key={item.name}
                            className={classNames(
                              isTabActive(item.href, item.name)
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-700 hover:text-gray-800",
                              "flex-1 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
                            )}
                            onClick={() => router.push(item.href)}
                          >
                            {item.name}
                          </Tab>
                        ))}
                      </div>
                    </Tab.Group>
                  </div>

                  {/* Mobile menu and search (lg-) */}
                  <div className="flex flex-1 items-center lg:hidden">
                    <button
                      type="button"
                      className="-ml-2 rounded-md bg-white p-2 text-gray-400"
                      onClick={() => setMobileMenuOpen(true)}
                    >
                      <span className="sr-only">Open menu</span>
                      <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex flex-1 items-center justify-end">
                    <div className="flex items-center lg:ml-8">
                      <div className="flex space-x-8">
                        <div className="flex">
                          <Link
                            href="#"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Account</span>
                            {/* Profile Dropdown */}
                            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                              <Menu as="div" className="relative ml-3">
                                <div>
                                  <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    <span className="sr-only">
                                      Open user menu
                                    </span>
                                    <Image
                                      className="h-8 w-8 rounded-full"
                                      src={userImage}
                                      alt=""
                                      width={32}
                                      height={32}
                                    />
                                  </Menu.Button>
                                </div>
                                <Transition
                                  as={Fragment}
                                  enter="transition ease-out duration-200"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="flex items-center justify-center">
                                      {status === "authenticated" ? (
                                        <button
                                          onClick={() => {
                                            void signOut();
                                          }}
                                          className="block px-4 py-2 text-sm font-semibold text-gray-700"
                                        >
                                          Sign out
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            void signIn("strava");
                                          }}
                                          className="block px-4 py-2 text-sm font-semibold text-gray-700"
                                        >
                                          Sign in
                                        </button>
                                      )}
                                    </div>
                                  </Menu.Items>
                                </Transition>
                              </Menu>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {router.pathname !== "/checkout" && user ? (
                        <>
                          <span
                            className="mx-4 h-6 w-px bg-gray-200 lg:mx-6"
                            aria-hidden="true"
                          />
                          <div className="flow-root">
                            <button
                              className="group -m-2 flex items-center p-2"
                              onClick={() => (sidebarSignal.value = true)}
                            >
                              <ShoppingCartIcon
                                className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                              <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
                                {cartSignal.value.length}
                              </span>
                              <span className="sr-only">
                                items in cart, view bag
                              </span>
                            </button>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="mx-auto min-h-screen max-w-7xl">{children}</main>

      <Footer />

      <ShoppingCartSidebar open={sidebarSignal.value} />
    </div>
  );
};

export default Layout;
