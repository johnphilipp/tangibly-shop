import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { accountRouter } from "./routers/account";
import { activitiesRouter } from "./routers/activities";
import { mailRouter } from "~/server/api/routers/mail";
import { cartRouter } from "~/server/api/routers/cart";
import { designRouter } from "~/server/api/routers/design";
import {paymentRouter} from "~/server/api/routers/payment";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  account: accountRouter,
  activities: activitiesRouter,
  mail: mailRouter,
  cart: cartRouter,
  design: designRouter,
  payment: paymentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
