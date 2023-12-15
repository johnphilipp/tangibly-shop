import Image from "next/image";
import Layout from "./Layout";
import { signal } from "@preact/signals-react";
import { api } from "~/utils/api";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const products = [
  {
    id: 1,
    name: "Mug with Heatmap",
    description: "Your GPS tracks merged into a unique heatmap",
    href: "#",
    quantity: 1,
    price: "15€",
    imageSrc: "/heatmap.png",
    imageAlt: "Glass bottle with black plastic pour top and mesh insert.",
  },
];

const stripe_response = {
  id: "cs_test_b1H1fiZNbFHGv7JcS1g1lSJiJs1tYK146YVPv2EGgnI4nzH5O6HdDVgrsx",
  object: "checkout.session",
  after_expiration: null,
  allow_promotion_codes: null,
  amount_subtotal: 5197,
  amount_total: 5197,
  automatic_tax: {
    enabled: false,
    status: null,
  },
  billing_address_collection: null,
  cancel_url: null,
  client_reference_id: null,
  client_secret: null,
  consent: null,
  consent_collection: null,
  created: 1702644166,
  currency: "chf",
  currency_conversion: null,
  custom_fields: [],
  custom_text: {
    after_submit: null,
    shipping_address: null,
    submit: null,
    terms_of_service_acceptance: null,
  },
  customer: null,
  customer_creation: "if_required",
  customer_details: {
    address: {
      city: "St. Gallen",
      country: "CH",
      line1: "Torstrasse 20",
      line2: null,
      postal_code: "9000",
      state: null,
    },
    email: "johanneswenz98@gmail.com",
    name: "Johannes Wenz",
    phone: null,
    tax_exempt: "none",
    tax_ids: [],
  },
  customer_email: null,
  expires_at: 1702730565,
  invoice: null,
  invoice_creation: {
    enabled: false,
    invoice_data: {
      account_tax_ids: null,
      custom_fields: null,
      description: null,
      footer: null,
      metadata: {},
      rendering_options: null,
    },
  },
  livemode: false,
  locale: null,
  metadata: {},
  mode: "payment",
  payment_intent: "pi_3ONak4BYeZI73kv10ZaBAbai",
  payment_link: null,
  payment_method_collection: "if_required",
  payment_method_configuration_details: {
    id: "pmc_1OMftYBYeZI73kv1suxiyRae",
    parent: null,
  },
  payment_method_options: {},
  payment_method_types: ["card", "link", "klarna"],
  payment_status: "paid",
  phone_number_collection: {
    enabled: false,
  },
  recovered_from: null,
  redirect_on_completion: "always",
  return_url:
    "http://localhost:3000/confirmation?session_id={CHECKOUT_SESSION_ID}",
  setup_intent: null,
  shipping_address_collection: {
    allowed_countries: ["CH"],
  },
  shipping_cost: null,
  shipping_details: {
    address: {
      city: "St. Gallen",
      country: "CH",
      line1: "Torstrasse 20",
      line2: null,
      postal_code: "9000",
      state: "",
    },
    name: "Johannes Wenz",
  },
  shipping_options: [],
  status: "complete",
  submit_type: null,
  subscription: null,
  success_url: null,
  total_details: {
    amount_discount: 0,
    amount_shipping: 0,
    amount_tax: 0,
  },
  ui_mode: "embedded",
  url: null,
};

export default function Confirmation() {
  const confirmationSignal = signal(null);

  const searchParams = useSearchParams();

  const user = useSession().data?.user;

  const sessionData = api.payment.getCheckoutSession.useQuery(
    {
      sessionId: searchParams.get("session_id") ?? "",
    },
    {
      enabled: !!searchParams.get("session_id") && user !== undefined,
    },
  );

  useEffect(() => {
    console.log("sessionData", sessionData);
  }, [sessionData]);

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
                  Order number: #14034056
                </p>

                <dl className="mt-12 text-sm font-medium">
                  <dt className="text-gray-900">Tracking number</dt>
                  <dd className="mt-2 text-indigo-600">51547878755545848512</dd>
                </dl>
              </div>

              <div className="mt-10 border-t border-gray-200">
                <h2 className="sr-only">Your order</h2>

                <h3 className="sr-only">Items</h3>
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex space-x-6 border-b border-gray-200 py-10"
                  >
                    <Image
                      src={product.imageSrc}
                      alt={product.imageAlt}
                      className="h-20 w-20 flex-none rounded-lg bg-gray-100 object-cover object-center sm:h-40 sm:w-40"
                      width={200}
                      height={200}
                    />
                    <div className="flex flex-auto flex-col">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          <a href={product.href}>{product.name}</a>
                        </h4>
                        <p className="mt-2 text-sm text-gray-600">
                          {product.description}
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
                              {product.price}
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
                          <span className="block">Kristin Watson</span>
                          <span className="block">7363 Cynthia Pass</span>
                          <span className="block">Toronto, ON N3Y 4H8</span>
                        </address>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">
                        Billing address
                      </dt>
                      <dd className="mt-2 text-gray-700">
                        <address className="not-italic">
                          <span className="block">Kristin Watson</span>
                          <span className="block">7363 Cynthia Pass</span>
                          <span className="block">Toronto, ON N3Y 4H8</span>
                        </address>
                      </dd>
                    </div>
                  </dl>

                  <h4 className="sr-only">Payment</h4>
                  <dl className="grid grid-cols-2 gap-x-6 border-t border-gray-200 py-10 text-sm">
                    <div>
                      <dt className="font-medium text-gray-900">
                        Payment method
                      </dt>
                      <dd className="mt-2 text-gray-700">
                        <p>Apple Pay</p>
                        <p>Mastercard</p>
                        <p>
                          <span aria-hidden="true">••••</span>
                          <span className="sr-only">Ending in </span>1545
                        </p>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">
                        Shipping method
                      </dt>
                      <dd className="mt-2 text-gray-700">
                        <p>DHL</p>
                        <p>Takes up to 3 working days</p>
                      </dd>
                    </div>
                  </dl>

                  <h3 className="sr-only">Summary</h3>

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
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
