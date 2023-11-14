import {z, ZodError} from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {TRPCError} from "@trpc/server";
import axios from "axios";

interface TokenResponse {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
}

export const accountRouter = createTRPCRouter({
  getAccountByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ctx, input}) => {
        try {
            // Get account data from db
            const account = await ctx.db.account.findFirst({
                where: {userId: input.userId},
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

            const accessTokenExpiresAt = new Date(account.expires_at*1000);

            console.log('Exipred Access Token', accessTokenExpiresAt)

            // Check if access-token expired
            const accessTokenExpired = accessTokenExpiresAt < new Date();

            console.log(accessTokenExpired)

            // Refresh access-token if expired
            if (accessTokenExpired) {
                const config = {
                    method: "post",
                    url: `https://www.strava.com/oauth/token?client_id=${process.env.STRAVA_CLIENT_ID}&client_secret=${process.env.STRAVA_CLIENT_SECRET}&refresh_token=${account.refresh_token}&grant_type=refresh_token`,
                    headers: {},
                };

                const response = await axios(config);
                const tokens = response.data as TokenResponse;

                await ctx.db.account.update({
                    where: {id: account.id},
                    data: {
                        access_token: tokens.access_token,
                        expires_at: tokens.expires_at,
                    },
                });
            }

            return  ctx.db.account.findUnique({
                    where: {id: account.id},
                });

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
