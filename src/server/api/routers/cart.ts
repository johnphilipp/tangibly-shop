import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { pricing } from "~/utils/pricing";

export const cartRouter = createTRPCRouter({
  add: protectedProcedure
    .input(
      z.object({
        designId: z.number(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Adding to cart", input.designId);
        const creation = await ctx.db.cartItem.upsert({
          where: {
              userId: ctx.session.user.id,
              designId: input.designId,
          },
          create: {
            user: { connect: { id: ctx.session.user.id } },
            design: { connect: { id: input.designId } },
            amount: input.amount,
          },
          update: {
            amount: { increment: input.amount },
          },
        });

        const item = await ctx.db.cartItem.findUnique({
          where: { userId: ctx.session.user.id, id: creation.id },
          include: { design: true },
        });

        console.log("Added to cart", item);

        return { status: "success", item: item };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),

  get: protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
    try {
      console.log("Getting products from cart");
      const items = await ctx.db.cartItem.findMany({
        where: { userId: ctx.session.user.id },
        include: { design: true },
      });

      return { status: "success", items: items, prices: pricing.products };
    } catch (error) {
      console.log(error);
      return {
        status: "error",
        message: "Something went wrong. Please try again later",
      };
    }
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Deleting from Cart", input.id);
        await ctx.db.cartItem.delete({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        return { status: "success", message: "Deletion successful" };
      } catch (error) {
        console.log(error);
        return {
          status: "error",
          message: "Something went wrong. Please try again later",
        };
      }
    }),
});
