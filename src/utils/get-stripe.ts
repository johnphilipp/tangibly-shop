import { loadStripe } from "@stripe/stripe-js";
import { signal } from "@preact/signals-react";

const stripeSignal = signal(() =>
  loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
);
export default stripeSignal;
