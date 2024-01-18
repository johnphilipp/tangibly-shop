import { useEffect, useState } from "react";
import { type CheckoutProduct } from "@prisma/client";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import Link from "next/link";
import { products } from "~/utils/products";
import Image from "next/image";
import NoDesignsField from "~/components/saved/NoDesignsField";
import Background from "~/components/Background";
import Layout from "~/components/Layout";
import NoOrdersField from "~/components/NoOrdersField";

export default function OrderList() {
  const [allOrders, setAllOrders] = useState<CheckoutProduct[] | undefined>(
    undefined,
  );

  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  const { data: designData } = api.payment.getAllOrders.useQuery({
    enabled: user !== undefined,
  });

  useEffect(() => {
    if (designData) {
      setAllOrders(designData.orders);
    }
  }, [designData]);

  return (
    <Layout>
      <div className="relative isolate">
        <Background />
        <div className="mx-auto max-w-4xl overflow-hidden">
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16 lg:max-w-7xl lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Your Orders
            </h1>

            <h2 className="mt-12 text-2xl font-bold tracking-tight text-gray-900">
              Manage your Orders
            </h2>

            <div className="mt-12 space-y-16 sm:mt-16">
              <div className="flow-root divide-y divide-gray-200 border-t border-gray-200">
                {allOrders?.length === 0 && <NoOrdersField />}

                {allOrders?.map((order) => (
                  <div key={order.id} className="py-6 sm:flex">
                    <div className="flex space-x-4 sm:min-w-0 sm:flex-1 sm:space-x-6 lg:space-x-8">
                      <Image
                        src={`data:image/svg+xml;base64,${order.previewSvg}`}
                        alt="Product image"
                        className="h-20 w-20 flex-none rounded-md object-contain object-center sm:h-48 sm:w-48"
                        width={1000}
                        height={1000}
                      />
                      <div className="min-w-0 flex-1 pt-1.5 sm:pt-0">
                        <h3 className="text-sm font-medium text-gray-900">
                          <Link
                            href={`${products.find(
                              (product) => product.name === order.productType,
                            )?.href}?designId=${order.id}`}
                          >
                            {order.name}
                          </Link>
                        </h3>
                        <p className="truncate text-sm text-gray-500">
                          <span>{order.productType}</span>{" "}
                          <span
                            className="mx-1 text-gray-400"
                            aria-hidden="true"
                          >
                            &middot;
                          </span>{" "}
                          <span>{"200x96mm"}</span>
                        </p>
                        <p className="mt-1 font-medium text-gray-900">{20}</p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4 sm:ml-6 sm:mt-0 sm:w-40 sm:flex-none">
                      <Link
                        href={`confirmation?session_id=${order.checkoutId}`}
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-2.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-full sm:flex-grow-0"
                      >
                        View Order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
