import { z, ZodError } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import axios from "axios";

export const accountRouter = createTRPCRouter({
  getAccountByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Get account data from db
        const account = await ctx.db.account.findFirst({
          where: { userId: input.userId },
        });

        // Check if account exists
        if (!account) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No account found",
          });
        }

        if (!account.access_token || !account.expires_at) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No access token found",
          });
        }

        return account;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        } else if (error instanceof ZodError) {
          // If there's a validation error, throw a TRPCError with details
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        } else {
          // For any other errors, throw a generic server error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }
      }
    }),
});
