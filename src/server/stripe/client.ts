import Stripe from "stripe";
import * as process from "process";

export const stripe = new Stripe(process.env.STRIPE_SK!, {
  apiVersion: "2023-10-16",
});