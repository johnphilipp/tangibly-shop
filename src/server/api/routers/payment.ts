import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import * as process from "process";
import { Order } from "~/utils/Order";

const prices =
  process.env.STRIPE_MODE === "prod"
    ? {
        collage_mug: "price_1ONZXYBYeZI73kv1hzk7PDpL",
        collage_heatmap: "price_1ONbfWBYeZI73kv1NA82Xw98",
        shipping: "price_1ONaMeBYeZI73kv1VedZhY5s",
        poster: "price_1OJz1rBYeZI73kv1UatLIZDv",
      }
    : {
        collage_mug: "price_1ONZXQBYeZI73kv1sb2WU0md",
        collage_heatmap: "price_1ONZZ5BYeZI73kv1XbJUQ5Ki",
        shipping: "price_1ONaMWBYeZI73kv1vDJQuDqZ",
        poster: "price_1OJz1rBYeZI73kv1UatLIZDv",
      };

export const paymentRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        lineItems: z.array(
          z.object({ price: z.string(), quantity: z.number() }),
        ),
      }),
    )
    .mutation(async ({ ctx }) => {
      if (!ctx.stripe) {
        throw new Error("Payment is not initialized!, Try again later!");
      }
      try {
        const items = await ctx.db.cartItem.findMany({
          where: { userId: ctx.session.user.id },
          include: { design: true },
        });

        const lineItems = items
          .map((item) => {
            console.log(item);
            switch (item.design.productType) {
              case "Collage":
                return { price: prices.collage_mug, quantity: item.amount };
              case "Heatmap":
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
                return { price: prices.collage_heatmap, quantity: item.amount };
              case "poster":
                return { price: prices.poster, quantity: item.amount };
              default:
                return null;
            }
          })
          .filter((item) => item !== null);

        console.log(lineItems);

        lineItems.push({ price: prices.shipping, quantity: 1 });

        if (!lineItems) {
          console.log("Cart is empty");
          return {
            status: "error",
            message: "Cart is empty",
          };
        }

        console.log("Creating checkout session", lineItems);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const session = await ctx.stripe.checkout.sessions.create({
          ui_mode: "embedded",
          line_items: lineItems,
          mode: "payment",
          client_reference_id: ctx.session.user.id,
          shipping_address_collection: {
            allowed_countries: ["CH"],
          },
          return_url: `${process.env.NEXTAUTH_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        });

        const saveItems = items.map((item) => {
          return {
            previewSvg: item.design.previewSvg ?? "",
            productType: item.design.productType,
            name: item.design.name,
            quantity: item.amount,
            checkoutId: session.id,
            price: 14.99,
            userId: ctx.session.user.id,
          };
        });

        const saveResult = await ctx.db.checkoutProduct.createMany({
          data: saveItems,
        });

        console.log(saveResult);

        return { status: "success", clientSecret: session.client_secret };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),

  getAllOrders: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      if (!ctx.stripe) {
        throw new Error("Payment is not initialized!, Try again later!");
      }
      try {
        const orders = await ctx.db.checkoutProduct.findMany({
          where: { userId: ctx.session.user.id, state: "paid" },
        });

        return {
          status: "success",
          orders: orders,
        };
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

        if (session.client_reference_id !== ctx.session.user.id.toString()) {
          return {
            status: "error",
            message: "Session does not belong to user",
          };
        }

        const checkoutData = await ctx.db.checkoutProduct.findMany({
          where: {
            checkoutId: session.id,
          },
        });

        const order: Order = {
          checkoutSessionId: session.id,
          lineItems: [],
          status: session.payment_status,
          shipping: {
            address: session.shipping_details?.address,
            name: session.shipping_details?.name,
          },
          email: session.customer_email,
          name: session.customer_details?.name,
          phone: session.customer_details?.phone,
          paymentStatus: session.payment_status,
          currency: session.currency,
          amountTotal: session.amount_total,
        };

        if (
          session.payment_status === "paid" &&
          checkoutData.length > 0 &&
          checkoutData?.at(0)?.state != "paid"
        ) {
          for (const item of checkoutData) {
            await ctx.db.checkoutProduct.update({
              where: { id: item.id },
              data: { state: "paid" },
            });
          }
        }

        console.log(order);

        return {
          status: "success",
          checkoutSession: order,
          checkoutData: checkoutData,
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
