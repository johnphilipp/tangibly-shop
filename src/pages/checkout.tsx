import CheckoutForm from "~/components/CheckoutForm";
import { useEffect, useState } from "react";
import getStripe from "~/utils/get-stripe";
import { api } from "~/utils/api";

import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import Layout from "~/components/Layout";
import stripeSignal from "~/utils/get-stripe";
import { loadStripe } from "@stripe/stripe-js";

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState(() =>
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""),
  );

  const getCheckout = api.payment.createCheckoutSession.useMutation();

  const user = useSession().data?.user;

  const { data: cartData } = api.cart.get.useQuery({
    enabled: user !== undefined,
  });

  useEffect(() => {
    void getCheckout
      .mutateAsync({
        lineItems:
          cartData?.items?.map((item) => ({
            price: item.design.name,
            quantity: item.amount,
          })) ?? [],
      })
      .then((value) => {
        if (value.clientSecret === clientSecret) return;
        setClientSecret(value.clientSecret ?? "");
      });
  }, [cartData?.items]);

  return (
    <>
      <Layout>
        <div className="h-12" />
        <div id="checkout">
          {clientSecret && clientSecret != "" ? (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            "Loading..."
          )}
        </div>
      </Layout>
    </>
  );
}
