import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import StravaProvider from "next-auth/providers/strava";

import { env } from "~/env.mjs";
import { db } from "~/server/db";
import axios from "axios";
import { session } from "next-auth/core/routes";

type StravaTokenResponse = {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
};

const refreshStravaToken = async (
  refreshToken: string,
): Promise<StravaTokenResponse> => {
  const formData = new URLSearchParams();
  formData.append("client_id", env.STRAVA_CLIENT_ID);
  formData.append("client_secret", env.STRAVA_CLIENT_SECRET);
  formData.append("grant_type", "refresh_token");
  formData.append("refresh_token", refreshToken);

  try {
    const response = await axios.post(
      "https://www.strava.com/api/v3/oauth/token",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data as StravaTokenResponse;
  } catch (error) {
    // Handle error here
    throw error;
  }
};

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    StravaProvider({
      clientId: env.STRAVA_CLIENT_ID,
      clientSecret: env.STRAVA_CLIENT_SECRET,
      authorization: {
        url: "https://www.strava.com/api/v3/oauth/authorize",
        params: {
          scope: "activity:read_all,read",
          approval_prompt: "auto",
          response_type: "code",
        },
      },
      token: {
        async request({ client, params, checks, provider }) {
          const { token_type, expires_at, refresh_token, access_token } =
            await client.oauthCallback(provider.callbackUrl, params, checks);

          console.debug(
            "token",
            token_type,
            expires_at,
            refresh_token,
            access_token,
          );

          if (!expires_at || !refresh_token || !access_token)
            throw new Error(
              "The Strava token response did not include an expiry date",
            );

          const accessTokenExpiresAt = new Date(expires_at * 1000);

          console.log("Exipred Access Token", accessTokenExpiresAt);

          // Check if access-token expired
          const accessTokenExpired = accessTokenExpiresAt < new Date();

          console.log(accessTokenExpired);

          // Refresh access-token if expired
          if (accessTokenExpired) {
            console.log("Refreshing Strava Token");
            const response = await refreshStravaToken(refresh_token);

            console.log("Refreshed Strava Token", response);
            console.log("params", params);

            return {
              tokens: {
                token_type: response.token_type,
                expires_at: response.expires_at,
                refresh_token: response.refresh_token,
                access_token: response.access_token,
              },
            };
          }

          return {
            tokens: { token_type, expires_at, refresh_token, access_token },
          };
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const account = await db.account.findFirst({
        where: { userId: session.user.id },
      });

      if (!account) {
        throw new Error("No account found");
      }

      const accessTokenExpiresAt = new Date(account.expires_at! * 1000);

      console.log("Exipred Access Token", accessTokenExpiresAt);

      // Check if access-token expired
      const accessTokenExpired = accessTokenExpiresAt < new Date();

      if (accessTokenExpired) {
        const response = await refreshStravaToken(account.refresh_token!);
        await db.account.update({
          where: { id: account.id },
          data: {
            access_token: response.access_token,
            expires_at: response.expires_at,
            refresh_token: response.refresh_token,
          },
        });
      }
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
