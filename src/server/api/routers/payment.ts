import {createTRPCRouter, protectedProcedure} from "~/server/api/trpc";
import {z} from "zod";

import getStripe from "~/utils/get-stripe";

const stripe = await getStripe();

export const paymentRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
      .input(z.object({ lineItems: z.array(z.object({ kind: z.string(), quantity: z.number() })) }))
    .mutation(async ({ ctx, input }) => {
        if (!stripe) {
            throw new Error('Payment is not initialized!, Try again later!')
        }
        try {



            const session = await stripe.redirectToCheckout({
                mode: 'payment',
                lineItems: input.lineItems,
                successUrl: `/success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `/canceled`,
            })

            return {session: session}



      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),
});