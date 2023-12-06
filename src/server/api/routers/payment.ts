import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const paymentRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        lineItems: z.array(
          z.object({ price: z.string(), quantity: z.number() }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.stripe) {
        throw new Error("Payment is not initialized!, Try again later!");
      }
      try {
        const session = await ctx.stripe.checkout.sessions.create({
          ui_mode: "embedded",
          line_items: [
            { price: "price_1OJyuwBYeZI73kv1Kj5oyOmJ", quantity: 2 },
            { price: "price_1OJz1rBYeZI73kv1UatLIZDv", quantity: 1 },
          ],
          mode: "payment",
          return_url: `http://localhost:3000/return?session_id={CHECKOUT_SESSION_ID}`,
        });

        return { status: "success", clientSecret: session.client_secret };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),

  getCheckoutSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.stripe) {
        throw new Error("Payment is not initialized!, Try again later!");
      }
      try {
        const session = await ctx.stripe.checkout.sessions.retrieve(
          input.sessionId,
        );
        return {
          status: session.status,
        };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),
});
