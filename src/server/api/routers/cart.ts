import {z} from "zod";

import {createTRPCRouter, protectedProcedure} from "~/server/api/trpc";

export const cartRouter = createTRPCRouter({
    addProductToCart: protectedProcedure
        .input(z.object({name: z.string(), product_type: z.string(), svg: z.string(), amount: z.number()}))
        .mutation(async ({ctx, input}) => {
            try {
                console.log("Adding to cart", input.product_type)
                await ctx.db.product.create({
                    data: {
                        product_type: input.product_type,
                        name: input.name,
                        svg: input.svg,
                        amount: input.amount,
                        user: { connect: { id: ctx.session.user.id } }
                    }
                });

                return {status: 'success', message: 'Success! Thank you.'};
            } catch (error) {
                console.log(error)
                return {status: 'error', message: "Something went wrong. Please try again later"};
            }
        }),

    getProductsFromCart: protectedProcedure
        .input(z.object({}))
        .query(async ({ctx}) => {
            try {
                console.log("Getting products from cart")
                const products = await ctx.db.product.findMany({
                    where: {userId: ctx.session.user.id},
                });

                return {status: 'success', products: products};
            } catch (error) {
                console.log(error)
                return {status: 'error', message: "Something went wrong. Please try again later"};
            }
        })
});


