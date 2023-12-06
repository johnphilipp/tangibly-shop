import CheckoutForm from "~/components/CheckoutForm";
import { useEffect, useState } from "react";
import getStripe from "~/utils/get-stripe";
import { api } from "~/utils/api";

import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";

export default function Checkout() {
  const stripe = getStripe();
  const [clientSecret, setClientSecret] = useState("");

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
        setClientSecret(value.clientSecret ?? "");
      });
  }, [cartData?.items]);

  return (
    <>
      <div id="checkout">
        {clientSecret && (
          <EmbeddedCheckoutProvider stripe={stripe} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        )}
      </div>
    </>
  );
}
