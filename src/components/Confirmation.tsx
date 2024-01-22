import Layout from "./Layout";
import { signal } from "@preact/signals-react";
import { api } from "~/utils/api";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Order } from "~/utils/Order";
import { CheckoutProduct } from "@prisma/client";
import { useRouter } from "next/router";
import { BiClipboard } from "react-icons/bi";
import { LoadingSpinner } from "~/components/Loading";

export default function Confirmation() {
  const confirmationSignal = signal(null);

  const searchParams = useSearchParams();

  const user = useSession().data?.user;

  const [checkoutData, setCheckoutData] = useState<Order | undefined>(
    undefined,
  );
  const [checkoutItems, setCheckoutItems] = useState<
    CheckoutProduct[] | undefined
  >(undefined);

  const { data: sessionData } = api.payment.getCheckoutSession.useQuery(
    {
      sessionId: searchParams.get("session_id") ?? "",
    },
    {
      enabled: !!searchParams.get("session_id") && user !== undefined,
    },
  );

  const router = useRouter();

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log("sessionData", sessionData);

    if (sessionData?.checkoutSession) {
      setCheckoutData(sessionData.checkoutSession);
      setCheckoutItems(sessionData.checkoutData);
    } else {
      if (retryCount < 3) {
        // Increment retry count and retry after 1 second
        setTimeout(() => {
          setRetryCount(retryCount + 1);
          // Trigger the query again (depends on how your query is set up)
        }, 1000);
      } else {
        // If all retries failed, navigate to /shop
      }
    }
  }, [sessionData, retryCount]);

  return (
    <>
      <Layout>
        <div className="relative isolate">
          <div className="bg-white">
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
              <div className="max-w-xl">
                <h1 className="text-base font-medium text-indigo-600">
                  Thank you!
                </h1>
                <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                  Your order is on the way!
                </p>
                <p className="mt-2 text-base text-gray-500">
                  Order number:
                  <button
                    onClick={() => {
                      if (!checkoutData?.checkoutSessionId) return;
                      void navigator.clipboard.writeText(
                        checkoutData?.checkoutSessionId,
                      );
                    }}
                  >
                    {checkoutData?.checkoutSessionId}
                  </button>
                </p>
                {/*
                <dl className="mt-12 text-sm font-medium">
                  <dt className="text-gray-900">Tracking number</dt>
                  <dd className="mt-2 text-indigo-600">51547878755545848512</dd>
                </dl>*/}
              </div>

              <div className="mt-10 border-t border-gray-200">
                <h2 className="sr-only">Your order</h2>

                <h3 className="sr-only">Items</h3>
                {!checkoutItems && <LoadingSpinner />}
                {checkoutItems?.map((product) => (
                  <div
                    key={product.id}
                    className="flex space-x-6 border-b border-gray-200 py-10"
                  >
                    <img
                      src={`data:image/svg+xml;base64,${product.previewSvg}`}
                      className="h-20 flex-none rounded-lg bg-gray-100 object-cover object-center sm:h-40"
                      height={200}
                      alt={product.name}
                    />
                    <div className="flex flex-auto flex-col">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {product.name}
                        </h4>
                        <p className="mt-2 text-sm text-gray-600">
                          {product.productType}
                        </p>
                      </div>
                      <div className="mt-6 flex flex-1 items-end">
                        <dl className="flex space-x-4 divide-x divide-gray-200 text-sm sm:space-x-6">
                          <div className="flex">
                            <dt className="font-medium text-gray-900">
                              Quantity
                            </dt>
                            <dd className="ml-2 text-gray-700">
                              {product.quantity}
                            </dd>
                          </div>
                          <div className="flex pl-4 sm:pl-6">
                            <dt className="font-medium text-gray-900">Price</dt>
                            <dd className="ml-2 text-gray-700">
                              {product.price * product.quantity}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="sm:ml-40 sm:pl-6">
                  <h3 className="sr-only">Your information</h3>

                  <h4 className="sr-only">Addresses</h4>
                  <dl className="grid grid-cols-2 gap-x-6 py-10 text-sm">
                    <div>
                      <dt className="font-medium text-gray-900">
                        Shipping address
                      </dt>
                      <dd className="mt-2 text-gray-700">
                        <address className="not-italic">
                          <span className="block">{checkoutData?.name}</span>
                          <span className="block">
                            {checkoutData?.shipping?.address?.line1}
                          </span>
                          {checkoutData?.shipping?.address?.line2 && (
                            <span className="block">
                              {checkoutData.shipping.address.line2}
                            </span>
                          )}
                          <span className="block">
                            {checkoutData?.shipping?.address?.postal_code}{" "}
                            {checkoutData?.shipping?.address?.city}
                          </span>
                          <span className="block">
                            {checkoutData?.shipping?.address?.country}
                          </span>
                        </address>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">
                        Billing address
                      </dt>
                      <dd className="mt-2 text-gray-700">
                        <address className="not-italic">
                          <span className="block">{checkoutData?.name}</span>
                          <span className="block">
                            {checkoutData?.shipping?.address?.line1}
                          </span>
                          {checkoutData?.shipping?.address?.line2 && (
                            <span className="block">
                              {checkoutData.shipping.address.line2}
                            </span>
                          )}
                          <span className="block">
                            {checkoutData?.shipping?.address?.postal_code}{" "}
                            {checkoutData?.shipping?.address?.city}
                          </span>
                          <span className="block">
                            {checkoutData?.shipping?.address?.country}
                          </span>
                        </address>
                      </dd>
                    </div>
                  </dl>

                  {/* <h3 className="sr-only">Summary</h3>

                  <dl className="space-y-6 border-t border-gray-200 pt-10 text-sm">
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-900">Subtotal</dt>
                      <dd className="text-gray-700">15,00€</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="flex font-medium text-gray-900">
                        Discount
                        <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                          IMP2023
                        </span>
                      </dt>
                      <dd className="text-gray-700">-€7,50 (50%)</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-900">Shipping</dt>
                      <dd className="text-gray-700">€5,00</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-900">Total</dt>
                      <dd className="text-gray-900">€12.50</dd>
                    </div>
                          </dl> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
