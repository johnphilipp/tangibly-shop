import React, { useState, FormEvent } from "react";
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Layout from "~/components/Layout";

// Load your Stripe publishable key
const stripePromise = loadStripe(
  "pk_test_51OBI5RBYeZI73kv1TxJvhGGozP0UlR5KaMrpFeFewTVGo7zBhehY4BqNUsfLQ975vrHh2h5MCw3gnZGrXCMYeppR00S8jxb8Bl",
);

const CheckoutForm: React.FC = () => {
  const stripe: Stripe | null = useStripe();
  const elements: StripeElements | null = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    if (cardElement) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        setError(error.message ?? "Unknown error");
        setLoading(false);
      } else {
        console.log(paymentMethod);
        // Send the paymentMethod.id to your server for processing
        // ...
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        Pay
      </button>
      {error && <div>{error}</div>}
    </form>
  );
};

const StripeCheckoutForm: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default StripeCheckoutForm;
