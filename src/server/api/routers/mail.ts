import {z} from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";


const emailRegex = /^[a-zA-Z0-9._%+-]+@(student\.unisg\.ch)$/;

export const mailRouter = createTRPCRouter({
  registerUserForMail: protectedProcedure
    .input(z.object({ email: z.string() }))
    .query( ({ctx, input}) => {
            if (!emailRegex.test(input.email)) {
                return {status: 'error', message: 'Invalid e-mail'};
            }


            console.log("registering user for mail")
            console.log(input.email)

            try {

                return {status: 'success', message: 'Check your email for your token'};
            } catch (error) {
                console.log(error)
                return {status: 'error', message: "Something went wrong. Please try again later"};
            }
    }),
});

