import CheckoutForm from "~/components/CheckoutForm";
import {useEffect} from "react";
import getStripe from "~/utils/get-stripe";

export default function Checkout() {
  const stripe = getStripe();

  const appearance = { /* appearance */ };
const options = { /* options */ };
const elements = stripe.elements({ clientSecret, appearance });
const paymentElement = elements.create('payment', options);
paymentElement.mount('#payment-element');

}
const CardInput = () => {
  useEffect(() => {
    // Assuming 'cardElement' is defined and initialized elsewhere, e.g., using Stripe.js
    cardElement.mount('#card-element');
  }, []);

  return (
    <>
      <label htmlFor="card-element">Card</label>
      <div id="card-element" />
    </>
  );
};

