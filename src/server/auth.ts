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
;
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: PrismaAdapter(db),
  providers: [
    StravaProvider({
      clientId: env.STRAVA_CLIENT_ID,
      clientSecret: env.STRAVA_CLIENT_SECRET,
      authorization: {
        url: "https://www.strava.com/api/v3/oauth/authorize",
        params: {
          scope: "activity:read_all",
          approval_prompt: "auto",
          response_type: "code",
        },
      },
      token: {
        async request({ client, params, checks, provider }) {
          const { token_type, expires_at, refresh_token, access_token } =
            await client.oauthCallback(provider.callbackUrl, params, checks);

          console.debug('token', token_type, expires_at, refresh_token, access_token)

          //Refresh the token when it is about to expire
          if ((expires_at ?? 0) * 1000 < Date.now() - 60000) {
            const refreshedToken = await refreshStravaToken(refresh_token ?? '');
            console.log('refreshedToken', refreshedToken);

            return {
              tokens: {
                access_token: refreshedToken.access_token,
                refresh_token: refreshedToken.refresh_token,
                expires_at: refreshedToken.expires_at,
              },
            };
          }
          return {
            tokens: { token_type, expires_at, refresh_token, access_token },
          };
        },
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
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

interface StravaTokenResponse {
  token_type: string
  access_token: string
  expires_at: number
  expires_in: number
  refresh_token: string
}

const refreshStravaToken = async (refreshToken: string): Promise<StravaTokenResponse> => {
  const formData = new URLSearchParams();
  formData.append('client_id', env.STRAVA_CLIENT_ID);
  formData.append('client_secret', env.STRAVA_CLIENT_SECRET);
  formData.append('grant_type', 'refresh_token');
  formData.append('refresh_token', refreshToken);

  try {
    const response = await axios.post('https://www.strava.com/api/v3/oauth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data as StravaTokenResponse;
  } catch (error) {
    // Handle error here
    throw error;
  }
};

